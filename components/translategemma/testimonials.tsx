"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, TrendingUp, Users, Download } from "lucide-react"
import { useTranslations } from "next-intl"

export function TranslateGemmaTestimonials() {
  const t = useTranslations("translategemma.testimonials")
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: t("user1.name"),
      title: t("user1.title"),
      content: t("user1.content"),
      rating: 5,
    },
    {
      id: 2,
      name: t("user2.name"),
      title: t("user2.title"),
      content: t("user2.content"),
      rating: 5,
    },
    {
      id: 3,
      name: t("user3.name"),
      title: t("user3.title"),
      content: t("user3.content"),
      rating: 5,
    },
    {
      id: 4,
      name: t("user4.name"),
      title: t("user4.title"),
      content: t("user4.content"),
      rating: 5,
    },
    {
      id: 5,
      name: t("user5.name"),
      title: t("user5.title"),
      content: t("user5.content"),
      rating: 5,
    },
  ]

  const stats = [
    { icon: Users, value: "55", label: t("stats.languages") },
    { icon: TrendingUp, value: "50%", label: t("stats.efficiency") },
    { icon: Download, value: "500K+", label: t("stats.downloads") },
    { icon: Star, value: "25K+", label: t("stats.githubStars") },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* 核心数据展示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-secondary/80 rounded-xl p-6 text-center border border-primary/20 hover:border-primary/50 transition-colors cyber-glow-subtle"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 用户评价轮播 */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-secondary/90 backdrop-blur-sm border-0 shadow-2xl ring-1 ring-primary/50 cyber-glow-subtle">
            <CardContent className="p-8 md:p-12">
              {/* 星级评分 */}
              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-primary fill-current"
                  />
                ))}
              </div>

              {/* 评价内容 */}
              <blockquote className="text-center mb-8">
                <p className="text-xl md:text-2xl text-foreground leading-relaxed font-medium">
                  "{currentTestimonial.content}"
                </p>
              </blockquote>

              {/* 用户信息 */}
              <div className="flex items-center justify-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 cyber-glow">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-lg">
                      {currentTestimonial.name.substring(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-foreground">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-primary font-medium">{currentTestimonial.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 导航控件 */}
          <div className="flex items-center justify-center mt-8 space-x-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full w-12 h-12 border-primary/50 bg-secondary/50 hover:bg-secondary text-primary backdrop-blur-sm transition-all duration-300 cyber-glow-subtle"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* 指示器 */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary scale-125 cyber-glow"
                      : "bg-secondary hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full w-12 h-12 border-primary/50 bg-secondary/50 hover:bg-secondary text-primary backdrop-blur-sm transition-all duration-300 cyber-glow-subtle"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 权威认可 */}
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-foreground mb-4">
            {t("authority.title")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span>{t("authority.githubStars")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <span>{t("authority.downloads")}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>{t("authority.rating")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
