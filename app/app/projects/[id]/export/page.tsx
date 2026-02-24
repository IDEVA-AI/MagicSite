"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Copy, Download, FileText, Loader2 } from "lucide-react"
import { useProject } from "@/hooks/use-project"

export default function ProjectExportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const { project, loading, error } = useProject(projectId)
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "Projeto não encontrado"}</p>
          <Button variant="outline" onClick={() => router.push("/app/projects")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Projetos
          </Button>
        </div>
      </div>
    )
  }

  const briefing = project.briefing || {}

  const resolvedDescription =
    project.businessDescription || briefing.offering || "Descrição não definida"

  const resolvedValueProposition =
    project.businessProposal || briefing.finalPromise || "Proposta de valor não definida"

  const resolvedSiteObjective =
    project.siteObjectives || briefing.strategicObjective || "Objetivo não definido"

  const resolvedColors = {
    primary: briefing.primaryColor || briefing.colors?.primary || "#1D4ED8",
    secondary: briefing.secondaryColor || briefing.colors?.secondary || "#ff8800",
    accent: briefing.accentColor || briefing.colors?.accent || "#1D4ED8",
  }

  const resolvedCtas = {
    primary: briefing.ctaPrimary || briefing.ctas?.primary || "Entre em Contato",
    secondary: briefing.ctaSecondary || briefing.ctas?.secondary || "Saiba Mais",
    alternative: briefing.ctaAlternative || briefing.ctas?.alternative || "Fale Conosco",
  }

  const resolvedWireframe = project.wireframe || []

  const generateCompletePrompt = () => {
    return `Crie um site profissional completo para ${project.companyName}.

## PROPOSTA DE VALOR
${resolvedValueProposition}

## DESCRIÇÃO DO NEGÓCIO
${resolvedDescription}

## OBJETIVO DO SITE
${resolvedSiteObjective}

## INFORMAÇÕES DE CONTATO
- WhatsApp: ${project.whatsapp || "Não informado"}
- E-mail: ${project.email || "Não informado"}
- Endereço: ${project.location || "Não informado"}

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
      id: project.id,
      name: project.companyName,
      segment: project.segment,
      status: project.status,
      whatsapp: project.whatsapp,
      email: project.email,
      location: project.location,
      valueProposition: resolvedValueProposition,
      description: resolvedDescription,
      siteObjective: resolvedSiteObjective,
      colors: resolvedColors,
      ctas: resolvedCtas,
      wireframe: resolvedWireframe,
      briefing,
    }
    const blob = new Blob([JSON.stringify(context, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.companyName}-contexto.json`
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

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Exportar Projeto</p>
            <h1 className="text-3xl font-black gradient-text">{project.companyName}</h1>
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
