"use client"

import { useLocale, useTranslations } from "next-intl"
import { ShoppingCart, Scale, GraduationCap, Code2, Tv, Smartphone } from "lucide-react"

export function UseCasesSection() {
  const locale = useLocale()
  const t = useTranslations("translategemma.useCases")

  const cases = [
    {
      id: "crossBorder",
      icon: ShoppingCart,
      iconColor: "text-blue-500"
    },
    {
      id: "legal",
      icon: Scale,
      iconColor: "text-amber-500"
    },
    {
      id: "academic",
      icon: GraduationCap,
      iconColor: "text-green-500"
    },
    {
      id: "developer",
      icon: Code2,
      iconColor: "text-purple-500"
    },
    {
      id: "content",
      icon: Tv,
      iconColor: "text-pink-500"
    },
    {
      id: "localization",
      icon: Smartphone,
      iconColor: "text-cyan-500"
    }
  ]

  return (
    <section id="use-cases" className="relative py-16 md:py-24">
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

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {cases.map((useCase) => {
            const caseKey = `cases.${useCase.id}` as const
            const caseData = t.raw(caseKey) as any
            const Icon = useCase.icon

            return (
              <div
                key={useCase.id}
                className="bg-background border border-border rounded-lg p-6 transition-all hover:shadow-md hover:border-primary/50"
              >
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${useCase.iconColor}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {caseData.title}
                </h3>

                {/* Value Proposition */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {caseData.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {locale === "zh"
              ? "不止于此，TranslateGemma 可应用于更多场景。"
              : "And more... TranslateGemma can be applied to many more scenarios."}
          </p>
        </div>
      </div>
    </section>
  )
}
