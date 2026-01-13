import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, pointsHistory, stripePayments } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { getCreemProductByPoints } from '@/lib/creem'
import { verifyWebhookSignature } from '@/app/api/creem/signature'
import { nanoid } from 'nanoid'

/**
 * Creem Webhook处理
 * 根据 Creem 官方文档实现
 * https://docs.creem.io/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    // 获取原始请求体（用于签名验证）
    const body = await req.text()
    const signature = req.headers.get('creem-signature') || ''

    console.log('=== Creem Webhook 开始处理 ===')
    console.log('签名:', signature ? '已提供' : '未提供')

    // 验证 webhook 签名
    if (signature) {
      const isValid = verifyWebhookSignature(body, signature)
      
      if (!isValid) {
        console.error('❌ 签名验证失败')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      
      console.log('✅ 签名验证成功')
    } else {
      console.warn('⚠️ 未提供签名，跳过签名验证（仅用于测试）')
    }

    // 解析 JSON
    let event: any
    try {
      event = JSON.parse(body)
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('Webhook原始数据:', JSON.stringify(event, null, 2))

    // 提取事件类型（根据 Creem 文档）
    const eventType = event.eventType
    const eventId = event.id
    const eventObject = event.object

    console.log('事件ID:', eventId)
    console.log('事件类型:', eventType)

    if (!eventType) {
      console.error('❌ 缺少事件类型')
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    // 根据事件类型处理
    switch (eventType) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event)
        break
      
      case 'subscription.paid':
        await handleSubscriptionPaid(event)
        break
      
      case 'subscription.active':
        console.log('ℹ️ 订阅激活事件（用于同步）')
        // 通常不需要处理，因为 checkout.completed 已经处理了
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event)
        break
      
      case 'subscription.expired':
        await handleSubscriptionExpired(event)
        break
      
      case 'refund.created':
        await handleRefundCreated(event)
        break
      
      default:
        console.log('⚠️ 未处理的事件类型:', eventType)
    }

    console.log('=== Creem Webhook 处理完成 ===')
    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('❌ Webhook处理失败:', error)
    console.error('错误堆栈:', error.stack)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * 处理结账完成事件
 * 这是最重要的事件，在用户完成支付后触发
 */
async function handleCheckoutCompleted(event: any) {
  console.log('--- 处理结账完成事件 ---')
  
  try {
    const eventObject = event.object
    if (!eventObject) {
      console.error('❌ 缺少 object 字段')
      return
    }

    // 提取数据（根据 Creem 文档结构）
    const checkoutId = eventObject.id
    const requestId = eventObject.request_id
    const order = eventObject.order
    const product = eventObject.product
    const customer = eventObject.customer
    const subscription = eventObject.subscription
    const metadata = eventObject.metadata || {}

    console.log('结账信息:', {
      checkoutId,
      requestId,
      orderId: order?.id,
      productId: product?.id,
      customerId: customer?.id,
      metadata
    })

    // 从 metadata 中提取用户信息
    const userId = metadata.userId || metadata.user_id || metadata.internal_customer_id
    const points = metadata.points ? parseInt(metadata.points) : null

    console.log('提取的用户信息:', {
      userId,
      points,
      customerEmail: customer?.email
    })

    if (!userId) {
      console.error('❌ metadata 中缺少 userId')
      console.error('完整 metadata:', JSON.stringify(metadata, null, 2))
      return
    }

    if (!points) {
      console.error('❌ metadata 中缺少 points')
      console.error('完整 metadata:', JSON.stringify(metadata, null, 2))
      return
    }

    // 获取产品配置
    const productConfig = getCreemProductByPoints(points)
    
    if (!productConfig) {
      console.error('❌ 无效的积分数量:', points)
      return
    }

    console.log('找到产品配置:', {
      name: productConfig.name,
      points: productConfig.points,
      price: productConfig.price
    })

    // 检查是否已处理（防重复）
    if (checkoutId) {
      const existingPayment = await db
        .select()
        .from(stripePayments)
        .where(eq(stripePayments.checkoutSessionId, checkoutId))
        .limit(1)

      if (existingPayment.length > 0) {
        console.log('⚠️ 支付已处理过，跳过:', checkoutId)
        return
      }
    }

    console.log(`💰 准备为用户 ${userId} 增加 ${points} 积分`)

    // 更新用户积分
    const updatedUsers = await db
      .update(users)
      .set({
        points: sql`${users.points} + ${points}`,
        purchasedPoints: sql`${users.purchasedPoints} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUsers || updatedUsers.length === 0) {
      console.error('❌ 用户不存在:', userId)
      return
    }

    const user = updatedUsers[0]
    console.log('✅ 用户积分更新成功:', {
      userId: user.id,
      newPoints: user.points,
      newPurchasedPoints: user.purchasedPoints
    })

    // 记录积分历史
    const historyId = nanoid()
    await db.insert(pointsHistory).values({
      id: historyId,
      userId: userId,
      points: points,
      pointsType: 'purchased',
      action: 'purchase',
      description: `购买积分套餐: ${productConfig.name} (${product?.currency || 'USD'} ${(order?.amount || 0) / 100})`,
      createdAt: new Date(),
    })

    console.log('✅ 积分历史记录成功:', historyId)

    // 保存支付记录
    const paymentId = nanoid()
    await db.insert(stripePayments).values({
      id: paymentId,
      userId: userId,
      stripeCustomerId: customer?.id || 'creem_customer',
      checkoutSessionId: checkoutId,
      paymentStatus: 'succeeded',
      paymentType: 'points_purchase',
      amount: order?.amount || productConfig.price * 100,
      currency: order?.currency?.toLowerCase() || 'usd',
      productName: product?.name || productConfig.name,
      productDescription: product?.description || productConfig.description,
      pointsAmount: points,
      pointsType: 'purchased',
      metadata: JSON.stringify({
        provider: 'creem',
        requestId: requestId,
        checkoutId: checkoutId,
        orderId: order?.id,
        customerId: customer?.id,
        subscriptionId: subscription?.id,
        productId: product?.id,
        originalMetadata: metadata,
      }),
      webhookEventId: event.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('✅ 支付记录保存成功:', paymentId)
    console.log(`🎉 成功为用户 ${userId} 增加 ${points} 积分`)

  } catch (error) {
    console.error('❌ 处理结账完成事件失败:', error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : error)
    throw error
  }
}

/**
 * 处理订阅支付事件
 * 用于订阅的续费支付
 */
async function handleSubscriptionPaid(event: any) {
  console.log('--- 处理订阅支付事件 ---')
  
  try {
    const subscription = event.object
    if (!subscription) {
      console.error('❌ 缺少 subscription 对象')
      return
    }

    const metadata = subscription.metadata || {}
    const userId = metadata.userId || metadata.user_id || metadata.internal_customer_id

    console.log('订阅支付:', {
      subscriptionId: subscription.id,
      userId,
      status: subscription.status,
      lastTransactionDate: subscription.last_transaction_date
    })

    // 如果是订阅续费，可以在这里处理赠送积分等逻辑
    // 根据您的业务需求实现

  } catch (error) {
    console.error('❌ 处理订阅支付事件失败:', error)
  }
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCanceled(event: any) {
  console.log('--- 处理订阅取消事件 ---')
  
  try {
    const subscription = event.object
    if (!subscription) {
      console.error('❌ 缺少 subscription 对象')
      return
    }

    const metadata = subscription.metadata || {}
    const userId = metadata.userId || metadata.user_id || metadata.internal_customer_id

    console.log('订阅已取消:', {
      subscriptionId: subscription.id,
      userId,
      canceledAt: subscription.canceled_at
    })

    // 根据需要处理订阅取消逻辑

  } catch (error) {
    console.error('❌ 处理订阅取消事件失败:', error)
  }
}

/**
 * 处理订阅过期事件
 */
async function handleSubscriptionExpired(event: any) {
  console.log('--- 处理订阅过期事件 ---')
  
  try {
    const subscription = event.object
    if (!subscription) {
      console.error('❌ 缺少 subscription 对象')
      return
    }

    const metadata = subscription.metadata || {}
    const userId = metadata.userId || metadata.user_id || metadata.internal_customer_id

    console.log('订阅已过期:', {
      subscriptionId: subscription.id,
      userId,
      status: subscription.status
    })

    // 根据需要处理订阅过期逻辑

  } catch (error) {
    console.error('❌ 处理订阅过期事件失败:', error)
  }
}

/**
 * 处理退款创建事件
 */
async function handleRefundCreated(event: any) {
  console.log('--- 处理退款创建事件 ---')
  
  try {
    const refund = event.object
    if (!refund) {
      console.error('❌ 缺少 refund 对象')
      return
    }

    console.log('退款已创建:', {
      refundId: refund.id,
      amount: refund.refund_amount,
      currency: refund.refund_currency,
      status: refund.status,
      reason: refund.reason
    })

    // 根据需要处理退款逻辑
    // 例如：扣除用户积分等

  } catch (error) {
    console.error('❌ 处理退款创建事件失败:', error)
  }
}

// 允许 Creem webhook 请求不受 CORS 限制
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
