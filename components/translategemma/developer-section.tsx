"use client"

import { useLocale, useTranslations } from "next-intl"
import { Github, Download, Terminal, Cloud, Smartphone, ExternalLink, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeveloperSection() {
  const locale = useLocale()
  const t = useTranslations("translategemma.developer")

  const opensourceData = t.raw("opensource") as any
  const deploymentData = t.raw("deployment") as any
  const apiData = t.raw("api") as any

  return (
    <section id="developer" className="relative py-16 md:py-24 bg-secondary/30">
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

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Open Source Resources */}
          <div className="bg-background border border-border rounded-lg p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Github className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {opensourceData.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {opensourceData.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-border hover:bg-secondary" asChild>
                <a href="https://huggingface.co/google" target="_blank" rel="noopener noreferrer">
                  {opensourceData.links.huggingface}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="border-border hover:bg-secondary" asChild>
                <a href="https://github.com/google" target="_blank" rel="noopener noreferrer">
                  {opensourceData.links.github}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="border-border hover:bg-secondary" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  {opensourceData.links.weights}
                  <Download className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Deployment Guide */}
          <div className="bg-background border border-border rounded-lg p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {deploymentData.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Local Deployment */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Terminal className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground">
                    {deploymentData.local.title}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {deploymentData.local.description}
                </p>
                <div className="bg-secondary/50 rounded p-3 font-mono text-xs text-foreground overflow-x-auto">
                  {deploymentData.local.command}
                </div>
              </div>

              {/* Enterprise Deployment */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground">
                    {deploymentData.enterprise.title}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deploymentData.enterprise.description}
                </p>
              </div>

              {/* Edge Deployment */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground">
                    {deploymentData.edge.title}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deploymentData.edge.description}
                </p>
              </div>
            </div>
          </div>

          {/* API Preview */}
          <div className="bg-background border border-border rounded-lg p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {apiData.title}
                </h3>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-secondary/50 rounded-lg p-4 md:p-6 overflow-x-auto mb-4">
              <pre className="text-sm text-foreground font-mono">
                <code>{apiData.code}</code>
              </pre>
            </div>

            <p className="text-sm text-muted-foreground">
              {apiData.hint}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "更多开发者资源和文档，请访问官方开发者中心。"
              : "For more developer resources and documentation, visit the official developer center."}
          </p>
        </div>
      </div>
    </section>
  )
}
