"use client"

import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, ArrowLeft, Info, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export function PaymentError() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const t = useTranslations('payment')

  const getErrorMessage = (error: string | null) => {
    if (!error) return t('error_default')
    
    // 检查是否有对应的错误翻译键
    const errorKey = `error_${error}` as any
    try {
      return t(errorKey)
    } catch {
      return t('error_default')
    }
  }

  const getErrorDetails = (error: string | null) => {
    if (!error) return null
    
    const errorDetails: { [key: string]: string } = {
      'signature_invalid': locale === 'zh' ? 
        '签名验证失败，可能的原因：\n1. 支付回调数据被篡改\n2. API密钥配置错误\n3. 网络传输过程中数据损坏' :
        'Signature verification failed, possible reasons:\n1. Payment callback data was tampered\n2. API key configuration error\n3. Data corrupted during network transmission',
      'payment_failed': locale === 'zh' ?
        '支付失败，可能的原因：\n1. 余额不足\n2. 银行卡信息错误\n3. 支付网关拒绝\n4. 网络连接问题' :
        'Payment failed, possible reasons:\n1. Insufficient balance\n2. Incorrect card information\n3. Payment gateway rejected\n4. Network connection issue',
      'payment_cancelled': locale === 'zh' ?
        '支付已取消，您可以：\n1. 重新尝试支付\n2. 选择其他支付方式\n3. 联系客服获取帮助' :
        'Payment cancelled, you can:\n1. Try payment again\n2. Choose another payment method\n3. Contact customer service for help',
      'payment_expired': locale === 'zh' ?
        '支付会话已过期，可能的原因：\n1. 支付页面停留时间过长\n2. 网络连接中断\n3. 支付会话超时' :
        'Payment session expired, possible reasons:\n1. Stayed on payment page too long\n2. Network connection interrupted\n3. Payment session timeout',
      'processing_failed': locale === 'zh' ?
        '支付处理失败，可能的原因：\n1. 服务器繁忙\n2. 数据库连接问题\n3. 系统维护中' :
        'Payment processing failed, possible reasons:\n1. Server busy\n2. Database connection issue\n3. System maintenance',
      'user_not_found': locale === 'zh' ?
        '用户信息未找到，可能的原因：\n1. 未登录或登录已过期\n2. 账户被删除\n3. 会话信息丢失' :
        'User information not found, possible reasons:\n1. Not logged in or session expired\n2. Account deleted\n3. Session information lost',
    }
    
    return errorDetails[error] || null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-secondary/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center">
            <AlertCircle className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {t('error_title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('error_description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-500/30 bg-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {message || getErrorMessage(error)}
            </AlertDescription>
          </Alert>

          {/* 开发环境下显示详细错误信息 */}
          {process.env.NODE_ENV === 'development' && error && (
            <Alert className="border-primary/30 bg-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary/80">
                <div className="space-y-2">
                  <div className="font-semibold">{locale === 'zh' ? '错误类型' : 'Error Type'}: {error}</div>
                  {getErrorDetails(error) && (
                    <div className="text-sm whitespace-pre-line">
                      {getErrorDetails(error)}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={`/${locale}/profile`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('error_retry_payment')}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full border-border bg-secondary/50 text-foreground hover:bg-primary/20 hover:text-primary">
              <Link href={`/${locale}`}>
                <Home className="mr-2 h-4 w-4" />
                {t('error_back_to_home')}
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {t('error_contact_support')}{' '}
            <Link href="mailto:app@itusi.cn" className="text-primary hover:text-primary/80">
              {t('error_technical_support')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
