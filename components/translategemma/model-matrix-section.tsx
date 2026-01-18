"use client"

import { useLocale, useTranslations } from "next-intl"
import { Star } from "lucide-react"

export function ModelMatrixSection() {
  const locale = useLocale()
  const t = useTranslations("translategemma.modelMatrix")

  const models = [
    {
      id: "4b",
      recommended: false
    },
    {
      id: "12b",
      recommended: true
    },
    {
      id: "27b",
      recommended: false
    }
  ]

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "fill-primary text-primary" : "text-border"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <section id="models" className="relative py-16 md:py-24">
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

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {models.map((model) => {
            const modelKey = `models.${model.id}` as const
            const modelData = t.raw(modelKey) as any

            return (
              <div
                key={model.id}
                className={`relative bg-background border rounded-lg p-6 transition-all hover:shadow-md ${
                  model.recommended
                    ? "border-primary shadow-sm"
                    : "border-border"
                }`}
              >
                {/* Recommended Badge */}
                {model.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      {locale === "zh" ? "推荐" : "Recommended"}
                    </span>
                  </div>
                )}

                {/* Model Name */}
                <h3 className="text-xl font-bold text-foreground mb-2 mt-2">
                  {modelData.name}
                </h3>

                {/* Positioning */}
                <p className="text-sm text-primary mb-4 font-medium">
                  {modelData.positioning}
                </p>

                {/* Details Grid */}
                <div className="space-y-4 mb-6">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-1">
                      {t("comparisonTable.parameters")}
                    </dt>
                    <dd className="text-sm text-foreground">
                      {modelData.parameters}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-1">
                      {t("comparisonTable.scenarios")}
                    </dt>
                    <dd className="text-sm text-foreground leading-relaxed">
                      {modelData.scenarios}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-1">
                      {t("comparisonTable.hardware")}
                    </dt>
                    <dd className="text-sm text-foreground">
                      {modelData.hardware}
                    </dd>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground mb-1">
                        COMET
                      </dt>
                      <dd className="text-lg font-bold text-primary">
                        {modelData.comet}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground mb-1">
                        {t("comparisonTable.terminology")}
                      </dt>
                      <dd className="text-lg font-bold text-primary">
                        {modelData.terminology}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-1">
                      {t("comparisonTable.speed")}
                    </dt>
                    <dd className="text-sm text-foreground">
                      {modelData.speed}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-muted-foreground mb-1">
                      {t("comparisonTable.highlights")}
                    </dt>
                    <dd className="text-sm text-foreground leading-relaxed">
                      {modelData.highlights}
                    </dd>
                  </div>

                  {/* Rating */}
                  <div className="pt-2">
                    <dt className="text-xs font-medium text-muted-foreground mb-2">
                      {t("comparisonTable.rating")}
                    </dt>
                    <dd>{renderStars(modelData.rating)}</dd>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "所有模型均支持开源部署、LoRA微调和私有化部署。选择适合您需求的版本开始使用。"
              : "All models support open-source deployment, LoRA fine-tuning, and private deployment. Choose the version that suits your needs."}
          </p>
        </div>
      </div>
    </section>
  )
}
