"use client"

import { useEffect } from "react"

import { Navbar } from "@/components/navbar"
import { TranslateGemmaHero } from "@/components/translategemma/hero-section"
import { ModelMatrixSection } from "@/components/translategemma/model-matrix-section"
import { CoreAdvantagesSection } from "@/components/translategemma/core-advantages-section"
import { UseCasesSection } from "@/components/translategemma/use-cases-section"
import { DeveloperSection } from "@/components/translategemma/developer-section"
import { TranslateGemmaFAQ } from "@/components/translategemma/faq-section"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"

export default function TranslateGemmaPage() {
  useEffect(() => {
    // 处理URL中的锚点
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      // 延迟滚动，确保页面完全加载
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }, [])

  return (
    <PageBackground>
      <Navbar />
      <main>
        <TranslateGemmaHero />
        <ModelMatrixSection />
        <CoreAdvantagesSection />
        <UseCasesSection />
        <DeveloperSection />
        <TranslateGemmaFAQ />
      </main>
      <Footer />
    </PageBackground>
  )
}
