import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageGenerationTasks } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// 类型定义
interface APIErrorResponse {
  error: {
    code: number
    message: string
    type: string
  }
}

interface APISuccessResponse {
  code: number
  data: {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    progress: number
    result?: {
      images?: Array<{
        url: string[]
        expires_at: number
      }>
      videos?: Array<{
        url: string[]
        expires_at: number
      }>
      thumbnail_url?: string
    }
    created: number
    completed?: number
    estimated_time: number
    actual_time?: number
    error?: {
      code: number
      message: string
      type: string
    }
  }
}

// 错误类型映射
function getErrorType(statusCode: number): string {
  const errorTypes: Record<number, string> = {
    400: 'invalid_request_error',
    401: 'authentication_error',
    402: 'payment_required',
    403: 'permission_error',
    404: 'not_found_error',
    429: 'rate_limit_error',
    500: 'server_error',
    502: 'bad_gateway',
  }
  return errorTypes[statusCode] || 'unknown_error'
}

// 创建错误响应
function createErrorResponse(code: number, message: string, type?: string): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        type: type || getErrorType(code),
      },
    },
    { status: code }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> }
) {
  try {
    // 解包 params (Next.js 15 要求)
    const { task_id: taskId } = await params

    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(401, '身份验证失败，请先登录', 'authentication_error')
    }

    // 2. 验证 task_id
    if (!taskId) {
      return createErrorResponse(400, '无效的任务ID', 'invalid_request_error')
    }

    // 3. 从查询参数获取 language（可选）
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get('language') || 'en'

    // 验证 language 参数
    const validLanguages = ['zh', 'en', 'ko', 'ja']
    if (!validLanguages.includes(language)) {
      return createErrorResponse(400, `不支持的语言参数: ${language}`, 'invalid_request_error')
    }

    // 4. 查询任务记录
    const taskRecords = await db
      .select()
      .from(imageGenerationTasks)
      .where(eq(imageGenerationTasks.taskId, taskId))
      .limit(1)

    const taskRecord = taskRecords[0]
    if (!taskRecord) {
      return createErrorResponse(404, '任务不存在', 'not_found_error')
    }

    // 5. 验证任务所属用户
    if (taskRecord.userId !== session.user.id) {
      return createErrorResponse(403, '访问被禁止，您没有权限访问此资源', 'permission_error')
    }

    // 6. 如果任务已完成或失败，直接返回缓存的结果
    if (taskRecord.status === 'completed' || taskRecord.status === 'failed') {
      const responseData: APISuccessResponse['data'] = {
        id: taskRecord.taskId,
        status: taskRecord.status,
        progress: taskRecord.status === 'completed' ? 100 : 0,
        created: Math.floor((taskRecord.createdAt?.getTime() || Date.now()) / 1000),
        estimated_time: 60,
      }

      // 添加完成时间
      if (taskRecord.completedAt) {
        responseData.completed = Math.floor(taskRecord.completedAt.getTime() / 1000)
        responseData.actual_time = responseData.completed - responseData.created
      }

      // 添加结果或错误信息
      if (taskRecord.status === 'completed' && taskRecord.imageUrls) {
        try {
          const imageUrls = JSON.parse(taskRecord.imageUrls)
          responseData.result = {
            images: Array.isArray(imageUrls) 
              ? imageUrls.map((url: string) => ({
                  url: [url],
                  expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天后过期
                }))
              : [],
          }
        } catch (e) {
          console.error('解析图片URLs失败:', e)
        }
      } else if (taskRecord.status === 'failed') {
        responseData.error = {
          code: 500,
          message: taskRecord.errorMessage || '生成失败',
          type: 'generation_error',
        }
      }

      return NextResponse.json<APISuccessResponse>({
        code: 200,
        data: responseData,
      })
    }

    // 7. 查询第三方API获取最新状态
    const apiKey = process.env.APIMART_API_KEY
    if (!apiKey) {
      return createErrorResponse(500, 'API密钥未配置', 'server_error')
    }

    // 使用正确的 API 端点
    const statusUrl = `https://api.apimart.ai/v1/tasks/${taskId}?language=${language}`
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    // 处理 API 错误响应
    if (!response.ok) {
      try {
        const errorData = await response.json()
        if (errorData.error) {
          return NextResponse.json<APIErrorResponse>(
            { error: errorData.error },
            { status: response.status }
          )
        }
      } catch (e) {
        // 如果无法解析错误响应，返回通用错误
        return createErrorResponse(
          response.status,
          `API 请求失败: ${response.statusText}`,
          getErrorType(response.status)
        )
      }
    }

    const apiData: APISuccessResponse = await response.json()

    // 8. 更新数据库中的任务状态
    if (apiData.data) {
      const taskData = apiData.data
      const updateData: any = {
        status: taskData.status || taskRecord.status,
      }

      // 如果任务完成，保存完整的结果
      if (taskData.status === 'completed' && taskData.result?.images) {
        // 提取所有图片 URL
        const imageUrls = taskData.result.images.flatMap(img => img.url)
        updateData.imageUrls = JSON.stringify(imageUrls)
        updateData.completedAt = new Date()
      }

      // 如果任务失败，保存错误信息
      if (taskData.status === 'failed' && taskData.error) {
        updateData.errorMessage = taskData.error.message || '生成失败'
        updateData.completedAt = new Date()
      }

      // 更新数据库
      await db
        .update(imageGenerationTasks)
        .set(updateData)
        .where(eq(imageGenerationTasks.taskId, taskId))
    }

    // 9. 返回官方 API 格式的响应
    return NextResponse.json<APISuccessResponse>(apiData)

  } catch (error) {
    console.error('查询任务状态失败:', error)
    return createErrorResponse(
      500,
      error instanceof Error ? error.message : '服务器内部错误',
      'server_error'
    )
  }
}
