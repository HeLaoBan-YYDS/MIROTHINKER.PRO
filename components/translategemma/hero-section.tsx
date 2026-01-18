"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ArrowRight, CheckCircle } from "lucide-react"

export function TranslateGemmaHero() {
  const locale = useLocale()
  const t = useTranslations("translategemma.hero")
  const [sourceText, setSourceText] = useState("")
  const [selectedModel, setSelectedModel] = useState("12b")
  const [targetLanguage, setTargetLanguage] = useState("en")

  const examples = [
    {
      key: "medical",
      text: t("examples.medical")
    },
    {
      key: "legal",
      text: t("examples.legal")
    },
    {
      key: "ecommerce",
      text: t("examples.ecommerce")
    }
  ]

  const handleExampleClick = (exampleText: string) => {
    setSourceText(exampleText)
  }

  return (
    <section id="home" className="relative pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-block mb-6">
            <span className="text-sm font-medium text-primary bg-secondary px-4 py-2 rounded-full border border-border">
              {t("badge")}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            {t("title")}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Translation Interface */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-secondary/30 border border-border rounded-lg p-6 md:p-8">
            {/* Model Selector & Target Language */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("modelSelectorLabel")}
                </label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue placeholder={t("modelSelectorLabel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4b">{t("modelOptions.4b")}</SelectItem>
                    <SelectItem value="12b">{t("modelOptions.12b")}</SelectItem>
                    <SelectItem value="27b">{t("modelOptions.27b")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("targetLanguageLabel")}
                </label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue placeholder={t("targetLanguageLabel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Translation Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Source Text */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {locale === "zh" ? "原文" : "Source Text"}
                </label>
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={t("inputPlaceholder")}
                  className="min-h-[200px] bg-background border-border resize-none focus:border-primary"
                />
              </div>
              
              {/* Target Text */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {locale === "zh" ? "译文" : "Translation"}
                </label>
                <div className="min-h-[200px] bg-background border border-border rounded-md p-3 text-muted-foreground">
                  {locale === "zh" ? "翻译结果将在此处显示..." : "Translation will appear here..."}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                {t("translateButton")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-border hover:bg-secondary transition-colors"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t("uploadButton")}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {t("uploadHint")}
            </p>
          </div>

          {/* Example Buttons */}
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3 text-center">
              {t("examplesTitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {examples.map((example) => (
                <button
                  key={example.key}
                  onClick={() => handleExampleClick(example.text)}
                  className="text-left p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-primary/50 transition-colors text-sm text-muted-foreground line-clamp-2"
                >
                  {example.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{t("trustBanner.opensource")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{t("trustBanner.dataPrivacy")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{t("trustBanner.freeCredits")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
