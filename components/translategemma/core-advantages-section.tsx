"use client"

import { useLocale, useTranslations } from "next-intl"
import { Target, Layers, Lock, Globe2 } from "lucide-react"

export function CoreAdvantagesSection() {
  const locale = useLocale()
  const t = useTranslations("translategemma.coreAdvantages")

  const advantages = [
    {
      id: "precision",
      icon: Target,
      iconColor: "text-primary"
    },
    {
      id: "multimodal",
      icon: Layers,
      iconColor: "text-primary"
    },
    {
      id: "opensource",
      icon: Lock,
      iconColor: "text-primary"
    },
    {
      id: "lowResource",
      icon: Globe2,
      iconColor: "text-primary"
    }
  ]

  return (
    <section id="advantages" className="relative py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {advantages.map((advantage) => {
            const advKey = `advantages.${advantage.id}` as const
            const advData = t.raw(advKey) as any
            const Icon = advantage.icon

            return (
              <div
                key={advantage.id}
                className="bg-background border border-border rounded-lg p-6 transition-all hover:shadow-md hover:border-primary/50"
              >
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${advantage.iconColor}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {advData.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advData.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom Note */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "TranslateGemma 不仅是翻译工具，更是您的全球化合作伙伴。"
              : "TranslateGemma is not just a translation tool, it's your globalization partner."}
          </p>
        </div>
      </div>
    </section>
  )
}
