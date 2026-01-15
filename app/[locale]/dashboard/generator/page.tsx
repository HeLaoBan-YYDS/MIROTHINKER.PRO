import { ImageGenerator } from '@/components/dashboard/image-generator'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PageBackground } from '@/components/page-background'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: '图像生成器 - AI 图像生成',
  description: '使用 Seedream-4.5 模型生成高质量 AI 图像',
}

export default async function ImageGeneratorPage() {
  // 服务端鉴权
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // 获取用户积分
  let userPoints = 0
  try {
    const userList = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
    
    userPoints = userList[0]?.points || 0
  } catch (error) {
    console.error('获取用户积分失败:', error)
  }

  return (
    <PageBackground>
      <Navbar />
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">AI 图像生成器</h1>
            <p className="text-muted-foreground">
              使用先进的 Seedream-4.5 模型，将您的想象变为现实
            </p>
          </div>
          
          <ImageGenerator initialPoints={userPoints} />
        </div>
      </main>
      <Footer />
    </PageBackground>
  )
}
