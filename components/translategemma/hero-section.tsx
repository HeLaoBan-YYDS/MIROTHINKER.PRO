"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Download, PlayCircle, CheckCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

export function TranslateGemmaHero() {
  const locale = useLocale()
  const t = useTranslations("translategemma.hero")

  return (
    <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* 顶部标签 */}
          <div className="flex justify-center mb-6">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium bg-secondary border-primary text-primary cyber-glow-subtle"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("badge")}
            </Badge>
          </div>

          {/* 主标题 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            {t("title")}
          </h1>

          {/* 副标题 */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            {t("subtitle")}
          </p>

          {/* 核心数据卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            {[
              { number: "55+", label: t("stats.languages") },
              { number: "500+", label: t("stats.languagePairs") },
              { number: "128k", label: t("stats.tokenContext") },
              { number: "100%", label: t("stats.openSource") },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-secondary/80 rounded-xl p-4 border border-primary/20 hover:border-primary/50 transition-colors cyber-glow-subtle"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              className="text-base cyber-glow"
            >
              <Download className="w-5 h-5 mr-2" />
              {t("cta.download")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {t("cta.demo")}
            </Button>
          </div>

          {/* 信任标识 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle, text: t("trust.official") },
              { icon: CheckCircle, text: t("trust.license") },
              { icon: CheckCircle, text: t("trust.offline") },
              { icon: CheckCircle, text: t("trust.community") },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
