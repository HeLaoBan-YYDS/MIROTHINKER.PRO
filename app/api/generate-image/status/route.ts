import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageGenerationTasks } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { IMAGE_GENERATOR_CONFIG } from '@/lib/image-generator-config'

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 获取 task_id 参数
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get('task_id')

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少 task_id 参数' },
        { status: 400 }
      )
    }

    // 3. 查询任务记录
    const taskRecords = await db
      .select()
      .from(imageGenerationTasks)
      .where(eq(imageGenerationTasks.taskId, taskId))
      .limit(1)

    const taskRecord = taskRecords[0]
    if (!taskRecord) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      )
    }

    // 4. 如果任务已完成或失败，直接返回缓存的结果
    if (taskRecord.status === 'completed' || taskRecord.status === 'failed') {
      return NextResponse.json({
        success: true,
        data: {
          task_id: taskRecord.taskId,
          status: taskRecord.status,
          imageUrls: taskRecord.imageUrls ? JSON.parse(taskRecord.imageUrls) : null,
          errorMessage: taskRecord.errorMessage,
          completedAt: taskRecord.completedAt,
        },
      })
    }

    // 5. 查询第三方API获取最新状态
    const apiKey = process.env.APIMART_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API密钥未配置' },
        { status: 500 }
      )
    }

    const statusUrl = `${IMAGE_GENERATOR_CONFIG.API_STATUS_URL}/${taskId}`
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error?.message || '查询任务状态失败',
        },
        { status: response.status }
      )
    }

    const apiData = await response.json()

    // 6. 更新数据库中的任务状态
    if (apiData.data) {
      const taskData = apiData.data
      const updateData: any = {
        status: taskData.status || taskRecord.status,
      }

      // 如果任务完成，保存图片URLs
      if (taskData.status === 'completed' && taskData.image_urls) {
        updateData.imageUrls = JSON.stringify(taskData.image_urls)
        updateData.completedAt = new Date()
      }

      // 如果任务失败，保存错误信息
      if (taskData.status === 'failed') {
        updateData.errorMessage = taskData.error_message || '生成失败'
        updateData.completedAt = new Date()
      }

      // 更新数据库
      await db
        .update(imageGenerationTasks)
        .set(updateData)
        .where(eq(imageGenerationTasks.taskId, taskId))
    }

    // 7. 返回最新状态
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        status: apiData.data?.status || taskRecord.status,
        imageUrls: apiData.data?.image_urls || null,
        errorMessage: apiData.data?.error_message || null,
        progress: apiData.data?.progress || null,
      },
    })

  } catch (error) {
    console.error('查询任务状态失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    )
  }
}
