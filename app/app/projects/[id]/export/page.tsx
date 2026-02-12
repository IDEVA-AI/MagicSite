"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Copy, Download, FileText } from "lucide-react"

type Project = {
  id: string
  name: string
  segment: string
  status: "completed" | "in-progress"
  phase: number
  createdAt: string
  creditsUsed: number
  data?: any
}

export default function ProjectExportPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [copied, setCopied] = useState(false)
  const storageKey = "magicsite-projects"
  const projectId = params?.id as string

  useEffect(() => {
    if (!projectId || typeof window === "undefined") return
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Project[]
    const found = saved.find((p) => p.id === projectId)
    if (found) {
      setProject(found)
      return
    }

    setProject({
      id: projectId,
      name: "Projeto em preparação",
      segment: "Segmento não informado",
      status: "in-progress",
      phase: 1,
      createdAt: new Date().toISOString(),
      creditsUsed: 0,
      data: {},
    })
  }, [projectId])

  const strategy = useMemo(() => project?.data || {}, [project])

  const resolvedDescription =
    strategy.detailedDescription ||
    strategy.businessDescription ||
    strategy.briefing?.offering ||
    strategy.description ||
    "Descrição não definida"

  const resolvedValueProposition =
    strategy.valueProposition || strategy.briefing?.finalPromise || "Proposta de valor não definida"

  const resolvedSiteObjective =
    strategy.siteObjective || strategy.briefing?.strategicObjective || "Objetivo não definido"

  const resolvedColors = {
    primary: strategy.briefing?.primaryColor || strategy.colors?.primary || "#1D4ED8",
    secondary: strategy.briefing?.secondaryColor || strategy.colors?.secondary || "#ff8800",
    accent: strategy.briefing?.accentColor || strategy.colors?.accent || "#1D4ED8",
  }

  const resolvedCtas = {
    primary: strategy.briefing?.ctaPrimary || strategy.ctas?.primary || "Entre em Contato",
    secondary: strategy.briefing?.ctaSecondary || strategy.ctas?.secondary || "Saiba Mais",
    alternative: strategy.briefing?.ctaAlternative || strategy.ctas?.alternative || "Fale Conosco",
  }

  const resolvedWireframe = strategy.wireframe || []

  const generateCompletePrompt = () => {
    return `Crie um site profissional completo para ${project?.name || "meu negócio"}.

## PROPOSTA DE VALOR
${resolvedValueProposition}

## DESCRIÇÃO DO NEGÓCIO
${resolvedDescription}

## OBJETIVO DO SITE
${resolvedSiteObjective}

## INFORMAÇÕES DE CONTATO
- WhatsApp: ${strategy.phone || "Não informado"}
- Endereço: ${strategy.address || "Não informado"}

## ESTRUTURA DO SITE
Crie as seguintes seções:

${
  resolvedWireframe
    ?.map(
      (section: any, index: number) => `
### ${index + 1}. ${section.title}
${section.instructions}
`,
    )
    .join("\n") || "Estrutura não definida"
}

## PALETA DE CORES
- Cor Primária: ${resolvedColors.primary}
- Cor Secundária: ${resolvedColors.secondary}
- Cor Accent: ${resolvedColors.accent}

## CHAMADAS PARA AÇÃO
- CTA Principal: ${resolvedCtas.primary}
- CTA Secundário: ${resolvedCtas.secondary}
- CTA Alternativo: ${resolvedCtas.alternative}

Crie um site moderno, responsivo e profissional seguindo todas essas diretrizes.`
  }

  const downloadContext = () => {
    const context = {
      ...project,
      data: {
        ...strategy,
        valueProposition: resolvedValueProposition,
        detailedDescription: resolvedDescription,
        siteObjective: resolvedSiteObjective,
        colors: resolvedColors,
        ctas: resolvedCtas,
        wireframe: resolvedWireframe,
      },
    }
    const blob = new Blob([JSON.stringify(context, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project?.name || "projeto"}-contexto.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyPrompt = () => {
    const prompt = generateCompletePrompt()
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!project) return null

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Exportar Projeto</p>
            <h1 className="text-3xl font-black gradient-text">{project.name}</h1>
            <p className="text-muted-foreground mt-2">{project.segment}</p>
          </div>

          <Button variant="outline" onClick={() => router.push(`/app/projects/${project.id}`)} className="bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="glow-border bg-background/70 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <p className="font-semibold">Prompt Completo</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 p-4 max-h-[520px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generateCompletePrompt()}</pre>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button onClick={copyPrompt} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copiar Prompt
                  </>
                )}
              </Button>
              <Button onClick={downloadContext} variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-5 w-5" />
                Baixar Contexto (.json)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
