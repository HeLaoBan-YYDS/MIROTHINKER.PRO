// 图像生成器配置
export const IMAGE_GENERATOR_CONFIG = {
  // API配置
  API_URL: 'https://api.apimart.ai/v1/images/generations',
  API_STATUS_URL: 'https://api.apimart.ai/v1/images/generations',
  
  // 模型配置
  MODEL: 'doubao-seedance-4-5',
  
  // 默认参数
  DEFAULT_SIZE: '1:1',
  DEFAULT_RESOLUTION: '2K',
  DEFAULT_N: 1,
  DEFAULT_OPTIMIZE_MODE: 'standard',
  
  // 积分计费规则
  PRICING: {
    '2K': 10,  // 2K分辨率每张图片消耗10积分
    '4K': 20,  // 4K分辨率每张图片消耗20积分
  },
  
  // 支持的分辨率
  RESOLUTIONS: ['2K', '4K'] as const,
  
  // 支持的宽高比
  SIZES: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9', '9:21'] as const,
  
  // 图片数量限制
  MAX_IMAGES: 15,
  MIN_IMAGES: 1,
  
  // 轮询配置
  POLLING_INTERVAL: 3000, // 3秒
  MAX_POLLING_ATTEMPTS: 100, // 最多轮询100次（5分钟）
}

// 计算生成图片的积分消耗
export function calculateImageCost(resolution: string, imageCount: number = 1): number {
  const pricePerImage = IMAGE_GENERATOR_CONFIG.PRICING[resolution as keyof typeof IMAGE_GENERATOR_CONFIG.PRICING]
  if (!pricePerImage) {
    throw new Error(`Unsupported resolution: ${resolution}`)
  }
  return pricePerImage * imageCount
}

// 验证请求参数
export function validateGenerateImageRequest(params: {
  prompt: string
  resolution: string
  size: string
  n: number
}) {
  const { prompt, resolution, size, n } = params

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('提示词不能为空')
  }

  if (!IMAGE_GENERATOR_CONFIG.RESOLUTIONS.includes(resolution as any)) {
    throw new Error(`不支持的分辨率: ${resolution}`)
  }

  if (!IMAGE_GENERATOR_CONFIG.SIZES.includes(size as any)) {
    throw new Error(`不支持的宽高比: ${size}`)
  }

  if (n < IMAGE_GENERATOR_CONFIG.MIN_IMAGES || n > IMAGE_GENERATOR_CONFIG.MAX_IMAGES) {
    throw new Error(`图片数量必须在 ${IMAGE_GENERATOR_CONFIG.MIN_IMAGES} 到 ${IMAGE_GENERATOR_CONFIG.MAX_IMAGES} 之间`)
  }
}
