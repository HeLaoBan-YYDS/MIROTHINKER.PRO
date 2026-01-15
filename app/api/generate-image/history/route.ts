import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageGenerationTasks } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 查询用户的历史记录
    const tasks = await db
      .select()
      .from(imageGenerationTasks)
      .where(eq(imageGenerationTasks.userId, session.user.id as string))
      .orderBy(desc(imageGenerationTasks.createdAt))
      .limit(limit)
      .offset(offset)

    // 转换数据格式
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      taskId: task.taskId,
      prompt: task.prompt,
      model: task.model,
      size: task.size,
      resolution: task.resolution,
      imageCount: task.imageCount,
      costPoints: task.costPoints,
      status: task.status,
      imageUrls: task.imageUrls ? JSON.parse(task.imageUrls) : [],
      errorMessage: task.errorMessage,
      refunded: task.refunded,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        tasks: formattedTasks,
        total: formattedTasks.length,
        limit,
        offset,
      },
    })

  } catch (error) {
    console.error('获取历史记录失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    )
  }
}
