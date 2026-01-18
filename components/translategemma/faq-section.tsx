"use client"

import { useLocale, useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function TranslateGemmaFAQ() {
  const locale = useLocale()
  const t = useTranslations("translategemma.faq")

  const questions = [
    { id: "free", key: "questions.free" },
    { id: "difference", key: "questions.difference" },
    { id: "security", key: "questions.security" },
    { id: "languages", key: "questions.languages" },
    { id: "terminology", key: "questions.terminology" },
    { id: "billing", key: "questions.billing" }
  ]

  return (
    <section id="faq" className="relative py-16 md:py-24">
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

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="multiple" defaultValue={["item-0", "item-1", "item-2"]} className="space-y-4">
            {questions.map((q, index) => {
              const questionData = t.raw(q.key) as any

              return (
                <AccordionItem
                  key={q.id}
                  value={`item-${index}`}
                  className="bg-background border border-border rounded-lg px-6 data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-base md:text-lg font-medium text-foreground pr-4">
                      {questionData.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {questionData.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        {/* Bottom Note */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "没有找到您的问题？欢迎通过邮件或 Discord 社区联系我们。"
              : "Can't find your question? Feel free to contact us via email or Discord community."}
          </p>
        </div>
      </div>
    </section>
  )
}
