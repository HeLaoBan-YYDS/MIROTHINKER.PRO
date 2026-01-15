import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, pointsHistory, imageGenerationTasks } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import {
  IMAGE_GENERATOR_CONFIG,
  calculateImageCost,
  validateGenerateImageRequest,
} from '@/lib/image-generator-config'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 解析请求参数
    const body = await request.json()
    const {
      prompt,
      size = IMAGE_GENERATOR_CONFIG.DEFAULT_SIZE,
      resolution = IMAGE_GENERATOR_CONFIG.DEFAULT_RESOLUTION,
      n = IMAGE_GENERATOR_CONFIG.DEFAULT_N,
      image_urls,
      optimize_prompt_options,
      watermark = false,
    } = body

    // 3. 验证参数
    try {
      validateGenerateImageRequest({ prompt, resolution, size, n })
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : '参数验证失败' },
        { status: 400 }
      )
    }

    // 4. 计算所需积分
    const costPoints = calculateImageCost(resolution, n)

    // 5. 查找用户并检查积分
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        points: users.points,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    const user = userList[0]
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 6. 检查积分是否足够
    const userPoints = user.points || 0
    if (userPoints < costPoints) {
      return NextResponse.json(
        { 
          success: false, 
          error: '积分不足',
          data: {
            required: costPoints,
            current: userPoints,
            missing: costPoints - userPoints,
          }
        },
        { status: 403 }
      )
    }

    // 7. 扣除积分
    const newPoints = userPoints - costPoints
    await db
      .update(users)
      .set({
        points: newPoints,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // 8. 记录积分扣除历史
    const historyId = nanoid()
    await db.insert(pointsHistory).values({
      id: historyId,
      userId: user.id,
      points: -costPoints,
      pointsType: 'purchased',
      action: 'image_generation',
      description: `图像生成 - ${resolution} ${size} x${n}张`,
      createdAt: new Date(),
    })

    // 9. 调用第三方API生成图片
    let apiResponse
    let apiError = null
    
    try {
      const apiPayload: any = {
        model: IMAGE_GENERATOR_CONFIG.MODEL,
        prompt,
        size,
        resolution,
        n,
        optimize_prompt_options: {
          mode: optimize_prompt_options?.mode || IMAGE_GENERATOR_CONFIG.DEFAULT_OPTIMIZE_MODE,
        },
        watermark,
      }

      // 如果提供了参考图片，添加到请求中
      if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
        apiPayload.image_urls = image_urls
      }

      const apiKey = process.env.APIMART_API_KEY
      if (!apiKey) {
        throw new Error('API密钥未配置')
      }

      const response = await fetch(IMAGE_GENERATOR_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      })

      apiResponse = await response.json()

      // 检查API响应
      if (!response.ok) {
        apiError = apiResponse.error?.message || 'API调用失败'
        throw new Error(apiError)
      }

      if (!apiResponse.data || !apiResponse.data[0]?.task_id) {
        apiError = '未获取到任务ID'
        throw new Error(apiError)
      }

    } catch (error) {
      // API调用失败，返还积分
      console.error('图像生成API调用失败:', error)
      
      // 返还积分
      await db
        .update(users)
        .set({
          points: userPoints, // 恢复原来的积分
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      // 记录退还积分的历史
      await db.insert(pointsHistory).values({
        id: nanoid(),
        userId: user.id,
        points: costPoints, // 正数表示增加
        pointsType: 'purchased',
        action: 'refund_image_generation',
        description: `图像生成失败退款 - ${error instanceof Error ? error.message : '未知错误'}`,
        createdAt: new Date(),
      })

      return NextResponse.json(
        { 
          success: false, 
          error: apiError || 'API调用失败，积分已退还',
          refunded: true,
        },
        { status: 500 }
      )
    }

    // 10. 创建任务记录
    const taskRecord = apiResponse.data[0]
    const taskId = nanoid()
    
    await db.insert(imageGenerationTasks).values({
      id: taskId,
      userId: user.id,
      taskId: taskRecord.task_id,
      prompt,
      model: IMAGE_GENERATOR_CONFIG.MODEL,
      size,
      resolution,
      imageCount: n,
      costPoints,
      status: taskRecord.status || 'submitted',
      createdAt: new Date(),
    })

    // 11. 返回成功响应
    return NextResponse.json({
      success: true,
      message: '图像生成任务已提交',
      data: {
        task_id: taskRecord.task_id,
        status: taskRecord.status,
        costPoints,
        remainingPoints: newPoints,
      },
    })

  } catch (error) {
    console.error('图像生成失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    )
  }
}
