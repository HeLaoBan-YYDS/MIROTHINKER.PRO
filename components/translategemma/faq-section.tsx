"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTranslations } from "next-intl"
import { Package, Settings, Wrench, DollarSign, Lock, Zap } from "lucide-react"

export function TranslateGemmaFAQ() {
  const t = useTranslations("translategemma.faq")

  const categories = [
    {
      title: t("installation.title"),
      icon: Package,
      questions: [
        {
          question: t("installation.q1.question"),
          answer: t("installation.q1.answer"),
        },
        {
          question: t("installation.q2.question"),
          answer: t("installation.q2.answer"),
        },
        {
          question: t("installation.q3.question"),
          answer: t("installation.q3.answer"),
        },
        {
          question: t("installation.q4.question"),
          answer: t("installation.q4.answer"),
        },
      ],
    },
    {
      title: t("usage.title"),
      icon: Settings,
      questions: [
        {
          question: t("usage.q1.question"),
          answer: t("usage.q1.answer"),
        },
        {
          question: t("usage.q2.question"),
          answer: t("usage.q2.answer"),
        },
        {
          question: t("usage.q3.question"),
          answer: t("usage.q3.answer"),
        },
        {
          question: t("usage.q4.question"),
          answer: t("usage.q4.answer"),
        },
        {
          question: t("usage.q5.question"),
          answer: t("usage.q5.answer"),
        },
      ],
    },
    {
      title: t("technical.title"),
      icon: Wrench,
      questions: [
        {
          question: t("technical.q1.question"),
          answer: t("technical.q1.answer"),
        },
        {
          question: t("technical.q2.question"),
          answer: t("technical.q2.answer"),
        },
        {
          question: t("technical.q3.question"),
          answer: t("technical.q3.answer"),
        },
        {
          question: t("technical.q4.question"),
          answer: t("technical.q4.answer"),
        },
        {
          question: t("technical.q5.question"),
          answer: t("technical.q5.answer"),
        },
      ],
    },
    {
      title: t("commercial.title"),
      icon: DollarSign,
      questions: [
        {
          question: t("commercial.q1.question"),
          answer: t("commercial.q1.answer"),
        },
        {
          question: t("commercial.q2.question"),
          answer: t("commercial.q2.answer"),
        },
        {
          question: t("commercial.q3.question"),
          answer: t("commercial.q3.answer"),
        },
        {
          question: t("commercial.q4.question"),
          answer: t("commercial.q4.answer"),
        },
      ],
    },
    {
      title: t("security.title"),
      icon: Lock,
      questions: [
        {
          question: t("security.q1.question"),
          answer: t("security.q1.answer"),
        },
        {
          question: t("security.q2.question"),
          answer: t("security.q2.answer"),
        },
        {
          question: t("security.q3.question"),
          answer: t("security.q3.answer"),
        },
      ],
    },
    {
      title: t("performance.title"),
      icon: Zap,
      questions: [
        {
          question: t("performance.q1.question"),
          answer: t("performance.q1.answer"),
        },
        {
          question: t("performance.q2.question"),
          answer: t("performance.q2.answer"),
        },
        {
          question: t("performance.q3.question"),
          answer: t("performance.q3.answer"),
        },
      ],
    },
  ]

  return (
    <section id="faq" className="relative py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {categories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-secondary/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary/30 shadow-lg cyber-glow-subtle"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cyber-glow">
                  <category.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">{category.title}</h3>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="border border-border rounded-xl px-4 md:px-6 bg-background/30 hover:bg-background/50 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-4 text-sm md:text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4 text-sm md:text-base whitespace-pre-line">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
