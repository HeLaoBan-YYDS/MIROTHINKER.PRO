"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Laptop, Code2, Video, CheckCircle2 } from "lucide-react"

export function TranslateGemmaDemo() {
  const t = useTranslations("translategemma.demo")

  const demos = [
    {
      icon: Smartphone,
      title: t("mobile.title"),
      description: t("mobile.description"),
      videoUrl: "https://youtu.be/7tQZcUY2X7k",
      highlights: [
        t("mobile.highlight1"),
        t("mobile.highlight2"),
        t("mobile.highlight3"),
        t("mobile.highlight4"),
      ],
    },
    {
      icon: Laptop,
      title: t("desktop.title"),
      description: t("desktop.description"),
      videoUrl: "https://youtu.be/5FzH8cF4t7E",
      highlights: [
        t("desktop.highlight1"),
        t("desktop.highlight2"),
        t("desktop.highlight3"),
        t("desktop.highlight4"),
      ],
    },
    {
      icon: Code2,
      title: t("developer.title"),
      description: t("developer.description"),
      videoUrl: "https://youtu.be/3G6c5JZ7x9E",
      highlights: [
        t("developer.highlight1"),
        t("developer.highlight2"),
        t("developer.highlight3"),
        t("developer.highlight4"),
      ],
    },
    {
      icon: Video,
      title: t("official.title"),
      description: t("official.description"),
      videoUrl: "https://youtu.be/8Z6xZ4c8x9A",
      highlights: [
        t("official.highlight1"),
        t("official.highlight2"),
        t("official.highlight3"),
        t("official.highlight4"),
      ],
    },
  ]

  return (
    <section id="demo" className="relative py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {demos.map((demo, index) => (
            <Card
              key={index}
              className="bg-secondary/90 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all duration-300 cyber-glow-subtle"
            >
              <CardContent className="p-6">
                {/* 图标和标题 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center cyber-glow flex-shrink-0">
                    <demo.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {demo.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {demo.description}
                    </p>
                  </div>
                </div>

                {/* 视频占位符 */}
                <div className="relative rounded-lg overflow-hidden bg-background/50 border border-border mb-4 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t("videoPlaceholder")}
                    </p>
                    <a
                      href={demo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {t("watchOnYoutube")}
                    </a>
                  </div>
                </div>

                {/* 亮点列表 */}
                <div className="space-y-2">
                  {demo.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
