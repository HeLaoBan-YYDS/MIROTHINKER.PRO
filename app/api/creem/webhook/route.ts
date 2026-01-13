import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, pointsHistory, stripePayments } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { getCreemProductByPoints } from '@/lib/creem'
import { verifySignature } from '@/app/api/creem/signature'
import { nanoid } from 'nanoid'

/**
 * Creem Webhook处理
 * 处理支付成功、失败等事件
 */
export async function POST(req: NextRequest) {
  try {
    // 获取webhook数据
    const body = await req.text()
    const signature = req.headers.get('x-creem-signature') || ''

    // 验证webhook签名
    if (signature) {
      const event = JSON.parse(body)
      const isValid = verifySignature(event, signature)
      
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      
      console.log('Webhook signature verified successfully')
    } else {
      console.warn('No signature provided in webhook request')
    }

    const event = JSON.parse(body)

    console.log('Received Creem webhook event:', event.type || event.event_type)

    // 根据不同的事件类型处理
    switch (event.type || event.event_type) {
      case 'checkout.completed':
      case 'payment.succeeded':
        await handlePaymentSuccess(event)
        break
      
      case 'checkout.expired':
      case 'payment.failed':
      case 'payment.cancelled':
        await handlePaymentFailed(event)
        break
      
      default:
        console.log('Unhandled Creem event type:', event.type || event.event_type)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing Creem webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * 处理支付成功事件
 */
async function handlePaymentSuccess(event: any) {
  try {
    // 从event中提取metadata
    const metadata = event.data?.metadata || event.metadata || {}
    const { userId, userEmail, points, productId, requestId } = metadata

    if (!userId || !points) {
      console.error('Missing required metadata in webhook:', metadata)
      return
    }

    // 获取产品配置
    const product = getCreemProductByPoints(parseInt(points))
    
    if (!product) {
      console.error('Invalid product points:', points)
      return
    }

    console.log(`Processing payment success for user ${userId}, adding ${points} points`)

    // 检查是否已经处理过这个支付（防止重复处理）
    const checkoutSessionId = event.data?.id || event.id
    if (checkoutSessionId) {
      const existingPayment = await db
        .select()
        .from(stripePayments)
        .where(eq(stripePayments.checkoutSessionId, checkoutSessionId))
        .limit(1)

      if (existingPayment.length > 0) {
        console.log('Payment already processed, skipping:', checkoutSessionId)
        return
      }
    }

    // 更新用户积分
    const [user] = await db
      .update(users)
      .set({
        points: sql`${users.points} + ${parseInt(points)}`,
        purchasedPoints: sql`${users.purchasedPoints} + ${parseInt(points)}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!user) {
      console.error('User not found:', userId)
      return
    }

    // 记录积分历史
    await db.insert(pointsHistory).values({
      id: nanoid(),
      userId: userId,
      points: parseInt(points),
      pointsType: 'purchased',
      action: 'purchase',
      description: `购买积分套餐: ${product.name} ($${product.price})`,
      createdAt: new Date(),
    })

    // 保存支付记录（使用 stripePayments 表，但标记为 creem 提供商）
    await db.insert(stripePayments).values({
      id: nanoid(),
      userId: userId,
      stripeCustomerId: 'creem_customer', // Creem 没有 customer ID，使用占位符
      checkoutSessionId: checkoutSessionId,
      paymentStatus: 'succeeded',
      paymentType: 'points_purchase',
      amount: product.price * 100, // 转换为分
      currency: 'usd',
      productName: product.name,
      productDescription: product.description,
      pointsAmount: parseInt(points),
      pointsType: 'purchased',
      metadata: JSON.stringify({
        productId: productId,
        provider: 'creem',
        requestId: requestId,
        checkoutSessionId: checkoutSessionId,
      }),
      webhookEventId: event.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log(`Successfully added ${points} points to user ${userId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

/**
 * 处理支付失败事件
 */
async function handlePaymentFailed(event: any) {
  try {
    const metadata = event.data?.metadata || event.metadata || {}
    const { userId, requestId, points, productId } = metadata

    console.log('Payment failed for user:', userId, 'requestId:', requestId)

    // 如果有用户ID和产品信息，记录失败的支付
    if (userId && points) {
      const product = getCreemProductByPoints(parseInt(points))
      const checkoutSessionId = event.data?.id || event.id
      
      // 确定失败原因
      const eventType = event.type || event.event_type
      let paymentStatus = 'failed'
      if (eventType === 'checkout.expired' || eventType === 'payment.expired') {
        paymentStatus = 'cancelled'
      } else if (eventType === 'payment.cancelled') {
        paymentStatus = 'cancelled'
      }

      // 保存失败的支付记录
      await db.insert(stripePayments).values({
        id: nanoid(),
        userId: userId,
        stripeCustomerId: 'creem_customer',
        checkoutSessionId: checkoutSessionId,
        paymentStatus: paymentStatus,
        paymentType: 'points_purchase',
        amount: product ? product.price * 100 : 0,
        currency: 'usd',
        productName: product?.name || 'Unknown Product',
        productDescription: product?.description || '',
        pointsAmount: parseInt(points),
        pointsType: 'purchased',
        metadata: JSON.stringify({
          productId: productId,
          provider: 'creem',
          requestId: requestId,
          checkoutSessionId: checkoutSessionId,
          failureReason: eventType,
        }),
        webhookEventId: event.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log(`Payment ${paymentStatus} recorded for user ${userId}`)
    }

    // 可以在这里发送失败通知邮件等
    // TODO: 根据需要实现失败通知逻辑

  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

// 允许Creem webhook请求不受CORS限制
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
