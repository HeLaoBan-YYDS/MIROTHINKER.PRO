import { createHmac } from 'crypto';

/**
 * 生成Creem Webhook签名
 * 使用 HMAC-SHA256 算法
 * @param payload 请求体字符串
 * @param secret Webhook密钥
 * @returns 生成的签名
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const computedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return computedSignature;
}

/**
 * 验证Creem Webhook签名
 * @param payload 原始请求体字符串
 * @param signature 接收到的签名
 * @param secret Webhook密钥（可选，默认从环境变量读取）
 * @returns 签名是否有效
 */
export function verifyWebhookSignature(
  payload: string, 
  signature: string,
  secret?: string
): boolean {
  try {
    const webhookSecret = secret || process.env.CREEM_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET is not configured');
      return false;
    }

    // 生成签名
    const computedSignature = generateWebhookSignature(payload, webhookSecret);

    // 比较签名
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}
