import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'payment' })
  
  return {
    title: t('error_page_title'),
    description: t('error_page_description'),
  }
}

export default function PaymentErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
