import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckout, getCreemProductByPoints } from '@/lib/creem'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    console.log('Request body:1111111111111111111111111111111111111')
    // 验证用户登录状态
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    // 获取请求参数
    const body = await req.json()
    const { points } = body

    if (!points || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Invalid points parameter' },
        { status: 400 }
      )
    }

    // 根据积分数量获取对应的产品配置
    const product = getCreemProductByPoints(points)

    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      )
    }

    if (!product.productId) {
      return NextResponse.json(
        { error: 'Product ID not configured in environment variables' },
        { status: 500 }
      )
    }

    // 生成唯一的请求ID
    const requestId = nanoid()

    // 获取应用的基础URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.NEXTAUTH_URL ||
                    req.nextUrl.origin

    // 创建Creem结账会话
    const checkoutSession = await createCheckout({
      productId: product.productId,
      requestId: requestId,
      successUrl: `${baseUrl}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/profile?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
        points: points,
        productId: product.id,
        requestId: requestId,
      },
    })

    return NextResponse.json({
      url: checkoutSession.checkout_url,
      sessionId: checkoutSession.id,
    })

  } catch (error: any) {
    console.error('Error creating Creem checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
