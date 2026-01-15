'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Image as ImageIcon, Download, AlertCircle, Coins, Clock, CheckCircle, XCircle } from 'lucide-react'
import { IMAGE_GENERATOR_CONFIG } from '@/lib/image-generator-config'

interface ImageGeneratorProps {
  initialPoints?: number
}

interface HistoryTask {
  id: string
  taskId: string
  prompt: string
  model: string
  size: string
  resolution: string
  imageCount: number
  costPoints: number
  status: string
  imageUrls: string[]
  errorMessage: string | null
  refunded: boolean
  createdAt: string
  completedAt: string | null
}

export function ImageGenerator({ initialPoints = 0 }: ImageGeneratorProps) {
  const { data: session, status } = useSession()
  const [userPoints, setUserPoints] = useState(initialPoints)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  
  // 表单状态
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<string>(IMAGE_GENERATOR_CONFIG.DEFAULT_SIZE)
  const [resolution, setResolution] = useState<string>(IMAGE_GENERATOR_CONFIG.DEFAULT_RESOLUTION)
  const [imageCount, setImageCount] = useState(1)
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  
  // 任务状态
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<string>('')
  const [taskProgress, setTaskProgress] = useState<number>(0)
  const [estimatedTime, setEstimatedTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // 历史记录状态
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // 计算预计消耗的积分
  const estimatedCost = IMAGE_GENERATOR_CONFIG.PRICING[resolution as keyof typeof IMAGE_GENERATOR_CONFIG.PRICING] * imageCount

  // 获取用户积分和历史记录
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPoints()
      fetchHistory()
    }
  }, [session])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points')
      const data = await response.json()
      if (data.success) {
        setUserPoints(data.data.points || 0)
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
    }
  }

  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/generate-image/history?limit=10')
      const data = await response.json()
      if (data.success) {
        setHistoryTasks(data.data.tasks || [])
      }
    } catch (error) {
      console.error('获取历史记录失败:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 处理图片上传转Base64
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // 验证文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB')
      return
    }

    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('只支持 JPEG 和 PNG 格式的图片')
      return
    }

    // 转换为Base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setReferenceImages([...referenceImages, base64String])
      toast.success('图片上传成功')
    }
    reader.onerror = () => {
      toast.error('图片读取失败')
    }
    reader.readAsDataURL(file)
  }

  // 删除参考图片
  const removeReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index))
  }

  // 提交生成请求
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入图像描述')
      return
    }

    if (userPoints < estimatedCost) {
      toast.error(`积分不足！需要 ${estimatedCost} 积分，当前仅有 ${userPoints} 积分`)
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setGeneratedImages([])
    setTaskStatus('')
    setTaskProgress(0)
    setEstimatedTime(0)
    setElapsedTime(0)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          resolution,
          n: imageCount,
          image_urls: referenceImages.length > 0 ? referenceImages : undefined,
          optimize_prompt_options: {
            mode: 'standard',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '生成失败')
      }

      toast.success('任务已提交，正在生成图片...')
      setTaskId(data.data.task_id)
      setTaskStatus(data.data.status)
      setUserPoints(data.data.remainingPoints)
      
      // 刷新历史记录，显示新提交的任务
      fetchHistory()
      
      // 开始轮询任务状态
      startPolling(data.data.task_id)

    } catch (error) {
      console.error('图像生成失败:', error)
      setErrorMessage(error instanceof Error ? error.message : '生成失败')
      toast.error(error instanceof Error ? error.message : '生成失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 轮询任务状态
  const startPolling = async (taskIdToCheck: string) => {
    setIsPolling(true)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/generate-image/status/${taskIdToCheck}`)
        const data = await response.json()

        // 处理新的 API 响应格式
        if (!response.ok) {
          // 错误响应格式: { error: { code, message, type } }
          const errorMessage = data.error?.message || '查询失败'
          throw new Error(errorMessage)
        }

        // 成功响应格式: { code: 200, data: { ... } }
        if (data.code !== 200) {
          throw new Error('查询失败')
        }

        setTaskStatus(data.data.status)
        setTaskProgress(data.data.progress || 0)

        // 计算时间信息
        if (data.data.created) {
          const elapsed = Math.floor(Date.now() / 1000) - data.data.created
          setElapsedTime(elapsed)
        }
        if (data.data.estimated_time) {
          setEstimatedTime(data.data.estimated_time)
        }

        if (data.data.status === 'completed') {
          // 从 result.images 数组中提取所有图片 URL
          const imageUrls = data.data.result?.images?.flatMap((img: any) => img.url) || []
          setGeneratedImages(imageUrls)
          toast.success('图片生成完成！')
          setIsPolling(false)
          // 刷新历史记录
          fetchHistory()
          return
        }

        if (data.data.status === 'failed') {
          const errorMessage = data.data.error?.message || '生成失败'
          setErrorMessage(errorMessage)
          toast.error('图片生成失败')
          setIsPolling(false)
          // 刷新历史记录
          fetchHistory()
          return
        }

        // 继续轮询
        attempts++
        if (attempts < IMAGE_GENERATOR_CONFIG.MAX_POLLING_ATTEMPTS) {
          setTimeout(poll, IMAGE_GENERATOR_CONFIG.POLLING_INTERVAL)
        } else {
          toast.error('查询超时，请稍后手动刷新')
          setIsPolling(false)
        }

      } catch (error) {
        console.error('查询任务状态失败:', error)
        setErrorMessage(error instanceof Error ? error.message : '查询失败')
        setIsPolling(false)
      }
    }

    poll()
  }

  // 下载图片
  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const urlObject = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlObject
      link.download = `generated-image-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlObject)
      toast.success('图片下载成功')
    } catch (error) {
      toast.error('图片下载失败')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>需要登录</CardTitle>
          <CardDescription>请先登录以使用图像生成功能</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 积分显示卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            当前积分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{userPoints}</p>
              <p className="text-sm text-muted-foreground mt-1">
                本次生成预计消耗: <span className="font-semibold text-yellow-600">{estimatedCost}</span> 积分
              </p>
            </div>
            {userPoints < estimatedCost && (
              <Alert className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>积分不足，请先充值</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 图像生成表单 */}
      <Card>
        <CardHeader>
          <CardTitle>图像生成器</CardTitle>
          <CardDescription>使用 Seedream-4.5 模型生成高质量图像</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 提示词输入 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">图像描述 *</Label>
            <Textarea
              id="prompt"
              placeholder="请详细描述你想生成的图像，例如：一只可爱的熊猫在竹林中玩耍，阳光明媚..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isLoading || isPolling}
            />
          </div>

          {/* 参考图片上传 */}
          <div className="space-y-2">
            <Label htmlFor="reference-image">参考图片（可选，用于图生图）</Label>
            <Input
              id="reference-image"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              disabled={isLoading || isPolling || referenceImages.length >= 10}
            />
            {referenceImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {referenceImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`参考图${index + 1}`} className="h-20 w-20 object-cover rounded" />
                    <button
                      onClick={() => removeReferenceImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      disabled={isLoading || isPolling}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 宽高比选择 */}
            <div className="space-y-2">
              <Label htmlFor="size">宽高比</Label>
              <Select value={size} onValueChange={setSize} disabled={isLoading || isPolling}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_GENERATOR_CONFIG.SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 分辨率选择 */}
            <div className="space-y-2">
              <Label htmlFor="resolution">分辨率</Label>
              <Select value={resolution} onValueChange={setResolution} disabled={isLoading || isPolling}>
                <SelectTrigger id="resolution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_GENERATOR_CONFIG.RESOLUTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r} ({IMAGE_GENERATOR_CONFIG.PRICING[r as keyof typeof IMAGE_GENERATOR_CONFIG.PRICING]} 积分/张)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 生成数量 */}
            <div className="space-y-2">
              <Label htmlFor="count">生成数量</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={15}
                value={imageCount}
                onChange={(e) => setImageCount(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                disabled={isLoading || isPolling}
              />
            </div>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || isPolling || !prompt.trim() || userPoints < estimatedCost}
            className="w-full"
            size="lg"
          >
            {isLoading || isPolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLoading ? '提交中...' : '生成中...'}
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                生成图像（消耗 {estimatedCost} 积分）
              </>
            )}
          </Button>

          {/* 任务状态和进度 */}
          {taskStatus && (
            <div className="space-y-3">
              {/* 状态标题 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">任务状态:</span>
                <span className="font-medium">
                  {taskStatus === 'submitted' && '已提交'}
                  {taskStatus === 'pending' && '排队中'}
                  {taskStatus === 'processing' && '生成中'}
                  {taskStatus === 'completed' && '已完成'}
                  {taskStatus === 'failed' && '失败'}
                </span>
              </div>
              
              {/* 进度条和时间信息 */}
              {isPolling && (
                <>
                  <div className="space-y-2">
                    <Progress value={taskProgress} className="w-full" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{taskProgress}% 完成</span>
                      {estimatedTime > 0 && (
                        <span>
                          {elapsedTime < estimatedTime ? (
                            <>预计剩余: {Math.max(0, estimatedTime - elapsedTime)}秒</>
                          ) : (
                            <>已用时: {elapsedTime}秒</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 状态提示 */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {(taskStatus === 'submitted' || taskStatus === 'pending') && '正在排队，请稍候...'}
                      {taskStatus === 'processing' && taskProgress < 30 && '正在初始化生成环境...'}
                      {taskStatus === 'processing' && taskProgress >= 30 && taskProgress < 70 && '正在生成图片，这可能需要一些时间...'}
                      {taskStatus === 'processing' && taskProgress >= 70 && '即将完成，正在优化图片质量...'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 生成的图片展示 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>图片链接有效期为24小时，请及时下载保存</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={url}
                      alt={`生成的图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={() => downloadImage(url, index)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载图片 {index + 1}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      <Card>
        <CardHeader>
          <CardTitle>生成历史</CardTitle>
          <CardDescription>查看您之前生成的所有图片</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : historyTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>暂无生成记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  {/* 任务信息头部 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium line-clamp-2">{task.prompt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(task.createdAt).toLocaleString('zh-CN')}
                        </span>
                        <span>{task.resolution} • {task.size} • {task.imageCount}张</span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {task.costPoints} 积分
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {task.status === 'completed' && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle className="h-3 w-3" />
                          已完成
                        </span>
                      )}
                      {task.status === 'failed' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          <XCircle className="h-3 w-3" />
                          失败
                        </span>
                      )}
                      {(task.status === 'processing' || task.status === 'submitted' || task.status === 'pending') && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          生成中
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 图片展示 */}
                  {task.status === 'completed' && task.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {task.imageUrls.map((url, index) => (
                        <div key={index} className="space-y-1">
                          <div className="relative aspect-square overflow-hidden rounded border">
                            <img
                              src={url}
                              alt={`${task.prompt} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            onClick={() => downloadImage(url, index)}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            下载
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 错误信息 */}
                  {task.status === 'failed' && task.errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{task.errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
