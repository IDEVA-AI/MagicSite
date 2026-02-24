"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Download, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useProject } from "@/hooks/use-project"
import { STATUS_LABEL_MAP } from "@/hooks/use-projects"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const { project, loading, error } = useProject(projectId)

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

  const valueProposition = project.businessProposal || project.briefing?.finalPromise || "Proposta de valor não disponível"
  const siteObjective = project.siteObjectives || project.briefing?.strategicObjective || "Objetivo ainda não definido"
  const detailedDescription = project.businessDescription || project.briefing?.offering || "Descrição ainda não definida"
  const wireframe = project.wireframe || []

  const statusLabel = STATUS_LABEL_MAP[project.status] || project.status
  const isReady = project.status === "ready"
  const phase = { draft: 1, briefing_complete: 2, content_complete: 3, ready: 4 }[project.status] || 1

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black">
              <span className="gradient-text">{project.companyName}</span>
            </h1>
            <p className="text-muted-foreground mt-2">{project.segment}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/app/projects/${project.id}/prompt`}>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </Link>
            <Button variant="outline" onClick={() => router.push("/app/projects")} className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 glow-border bg-background/70 backdrop-blur">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {isReady ? (
                  <Badge className="bg-[oklch(0.55_0.1_160)]/10 text-[oklch(0.55_0.1_160)] border-[oklch(0.55_0.1_160)]/30">
                    {statusLabel}
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/30">{statusLabel}</Badge>
                )}
                <Badge variant="outline" className="bg-transparent border-border/60">
                  Fase {phase}/4
                </Badge>
                <Badge variant="outline" className="bg-transparent border-border/60">
                  {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Proposta de Valor</p>
                  <p className="text-sm leading-relaxed">{valueProposition}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Objetivo do Site</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{siteObjective}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Descrição Estratégica</p>
                  <p className="text-sm leading-relaxed">{detailedDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-border bg-background/70 backdrop-blur">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-semibold">Próximos passos</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Revise as seções abaixo e exporte o contexto para implementar o site ou continuar iterando.
              </p>
              <Button asChild className="w-full">
                <Link href={`/app/projects/${project.id}/prompt`} className="gap-2">
                  Continuar para Exportar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Wireframe</h2>
          {wireframe.length === 0 ? (
            <Card className="p-6 border-dashed border-2 border-border/60">
              <p className="text-muted-foreground text-sm">Wireframe ainda não gerado para este projeto.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {wireframe.map((section: any, index: number) => (
                <Card key={section.id || index} className="p-5 hover:shadow-md transition-shadow">
                  <p className="text-xs text-muted-foreground mb-1">Seção {index + 1}</p>
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.instructions}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
