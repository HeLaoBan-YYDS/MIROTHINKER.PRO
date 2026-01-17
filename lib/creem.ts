import axios from 'axios'

// Creem API 配置
const CREEM_API_URL = process.env.CREEM_API_URL || 'https://test-api.creem.io'
const CREEM_API_KEY = process.env.CREEM_API_KEY || ''

// 获取格式化的API基础URL（确保没有尾部斜杠）
function getBaseUrl(): string {
  return CREEM_API_URL.endsWith('/') ? CREEM_API_URL.slice(0, -1) : CREEM_API_URL
}

// 创建结账会话参数接口
export interface CreateCheckoutParams {
  productId: string
  requestId?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, any>
}

// 创建结账会话响应接口
export interface CreateCheckoutResponse {
  checkout_url: string
  id?: string
  [key: string]: any
}

/**
 * 创建Creem结账会话
 * @param params 结账参数
 * @returns 包含结账URL的响应
 */
export async function createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResponse> {
  try {
    if (!CREEM_API_KEY) {
      throw new Error('CREEM_API_KEY is not configured')
    }

    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/v1/checkouts`

    const response = await axios.post(
      apiUrl,
      {
        product_id: params.productId,
        request_id: params.requestId,
        success_url: params.successUrl,
        // cancel_url: params.cancelUrl,
        metadata: params.metadata,
      },
      {
        headers: {
          'x-api-key': CREEM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.data || !response.data.checkout_url) {
      throw new Error('API response does not contain checkout_url')
    }

    return response.data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    if (axios.isAxiosError(error) && error.response) {
      console.error('API error response:', error.response.data)
      throw new Error(error.response.data?.message || 'Failed to create checkout session')
    }
    throw error
  }
}

/**
 * 验证Creem webhook签名
 * @param payload webhook请求体
 * @param signature webhook签名
 * @returns 是否验证通过
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // TODO: 实现webhook签名验证逻辑
  // 这取决于Creem的webhook签名机制
  return true
}

// 积分购买产品配置 - 对应Creem的产品ID
export const CREEM_PRODUCTS = {
  popular: {
    id: 'popular',
    name: '积分套餐',
    points: 300,
    price: 10,
    productId: process.env.CREEM_PRODUCT_POPULAR_ID || '',
    description: '10美金300积分',
    popular: true,
  },
} as const

export type CreemProductType = keyof typeof CREEM_PRODUCTS

// 根据积分数量获取对应的产品配置
export function getCreemProductByPoints(points: number) {
  return Object.values(CREEM_PRODUCTS).find(product => product.points === points)
}

// 根据产品ID获取产品配置
export function getCreemProductById(productId: string) {
  return Object.values(CREEM_PRODUCTS).find(product => product.productId === productId)
}