import { createHash } from 'crypto';

/**
 * 生成Creem签名
 * @param params 参数对象
 * @param apiKey API密钥
 * @returns 生成的签名
 */
export function generateSignature(params: Record<string, string>, apiKey: string): string {
  // 创建格式为 "key1=value1|key2=value2|...|salt=apiKey" 的数据字符串
  // 重要：不要对键进行排序 - 按照提供的顺序使用
  const data = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`)
    .join('|');

  // 使用SHA-256哈希算法生成签名
  const hash = createHash('sha256').update(data).digest('hex');
  return hash;
}

export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

/**
 * 验证Creem签名
 * @param params 重定向参数
 * @param signature 要验证的签名
 * @returns 签名是否有效
 */
export function verifySignature(params: Record<string, string>, signature: string): boolean {
  try {
    const API_KEY = process.env.CREEM_API_KEY_webhook || '';

    if (!API_KEY) {
      console.error('CREEM_API_KEY_webhook is not configured');
      return false;
    }

    // 过滤掉null/undefined值，并移除signature参数（如果存在）
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'signature') {
        filteredParams[key] = value;
      }
    });

    // 使用Creem提供的方法生成签名
    const computedSignature = generateSignature(filteredParams, API_KEY);

    // 比较计算的签名与接收到的签名
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
