import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, pointsHistory } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCreemProductByPoints } from '@/lib/creem'

/**
 * Creem Webhook处理
 * 处理支付成功、失败等事件
 */
export async function POST(req: NextRequest) {
  try {
    // 获取webhook数据
    const body = await req.text()
    const signature = req.headers.get('x-creem-signature') || ''

    // TODO: 验证webhook签名
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

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

    // 更新用户积分
    const [user] = await db
      .update(users)
      .set({
        points: db.$increment('points', parseInt(points)),
        purchasedPoints: db.$increment('purchasedPoints', parseInt(points)),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!user) {
      console.error('User not found:', userId)
      return
    }

    // 记录积分历史
    await db.insert(pointsHistory).values({
      userId: userId,
      points: parseInt(points),
      type: 'purchase',
      description: `购买积分套餐: ${product.name} ($${product.price})`,
      metadata: {
        productId: productId,
        amount: product.price,
        provider: 'creem',
        requestId: requestId,
        checkoutSessionId: event.data?.id || event.id,
      },
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
    const { userId, requestId } = metadata

    console.log('Payment failed for user:', userId, 'requestId:', requestId)

    // 可以在这里记录失败日志或发送通知
    // TODO: 根据需要实现失败处理逻辑

  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

// 允许Creem webhook请求不受CORS限制
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
