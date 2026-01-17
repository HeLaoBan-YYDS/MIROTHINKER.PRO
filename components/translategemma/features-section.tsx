"use client"

import { useTranslations } from "next-intl"
import { Check, Zap, Globe, Camera, Laptop, Lock, Code } from "lucide-react"
import { useState, useEffect } from "react"

export function TranslateGemmaFeatures() {
  const t = useTranslations("translategemma.features")

  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Zap,
      title: t("performance.title"),
      description: t("performance.description"),
      highlights: [
        t("performance.highlight1"),
        t("performance.highlight2"),
        t("performance.highlight3"),
        t("performance.highlight4"),
      ],
    },
    {
      icon: Globe,
      title: t("languages.title"),
      description: t("languages.description"),
      highlights: [
        t("languages.highlight1"),
        t("languages.highlight2"),
        t("languages.highlight3"),
        t("languages.highlight4"),
      ],
    },
    {
      icon: Camera,
      title: t("multimodal.title"),
      description: t("multimodal.description"),
      highlights: [
        t("multimodal.highlight1"),
        t("multimodal.highlight2"),
        t("multimodal.highlight3"),
        t("multimodal.highlight4"),
      ],
    },
    {
      icon: Laptop,
      title: t("deployment.title"),
      description: t("deployment.description"),
      highlights: [
        t("deployment.highlight1"),
        t("deployment.highlight2"),
        t("deployment.highlight3"),
        t("deployment.highlight4"),
      ],
    },
    {
      icon: Lock,
      title: t("security.title"),
      description: t("security.description"),
      highlights: [
        t("security.highlight1"),
        t("security.highlight2"),
        t("security.highlight3"),
        t("security.highlight4"),
      ],
    },
    {
      icon: Code,
      title: t("opensource.title"),
      description: t("opensource.description"),
      highlights: [
        t("opensource.highlight1"),
        t("opensource.highlight2"),
        t("opensource.highlight3"),
        t("opensource.highlight4"),
      ],
    },
  ]

  // 自动播放功能
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [features.length])

  const IconComponent = features[activeFeature].icon

  return (
    <section id="features" className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 左侧功能列表 */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-6 p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                    activeFeature === index
                      ? "bg-secondary border-2 border-primary cyber-glow-subtle"
                      : "bg-secondary/50 border border-border hover:bg-secondary/70"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  {/* 图标 */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeFeature === index
                        ? "bg-primary text-primary-foreground cyber-glow"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 右侧详细展示 */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden cyber-glow-subtle bg-secondary/50 border border-primary/50 backdrop-blur-sm">
                <div className="p-8">
                  {/* 图标展示 */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="w-20 h-20 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cyber-glow">
                      <IconComponent className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
                    {features[activeFeature].title}
                  </h3>

                  {/* 描述 */}
                  <p className="text-base text-muted-foreground mb-6 text-center leading-relaxed">
                    {features[activeFeature].description}
                  </p>

                  {/* 亮点列表 */}
                  <div className="space-y-3">
                    {features[activeFeature].highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-background/50 rounded-lg p-3"
                      >
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 进度指示器 */}
              <div className="flex justify-center mt-6 gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeFeature === index
                        ? "w-8 bg-primary cyber-glow"
                        : "w-2 bg-secondary hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
