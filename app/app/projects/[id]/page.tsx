"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Download, Sparkles } from "lucide-react"
import Link from "next/link"

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

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
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

    // fallback minimal mock so a direct access não quebra layout
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

  if (!project) return null

  const strategy = project.data || {}
  const valueProposition = strategy.valueProposition || "Proposta de valor não disponível"
  const siteObjective = strategy.siteObjective || "Objetivo ainda não definido"
  const detailedDescription = strategy.detailedDescription || "Descrição ainda não definida"
  const wireframe = strategy.wireframe || []

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Projeto #{project.id}</p>
            <h1 className="text-3xl lg:text-4xl font-black">
              <span className="gradient-text">{project.name}</span>
            </h1>
            <p className="text-muted-foreground mt-2">{project.segment}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/app/projects/${project.id}/export`}>
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
                <Badge className="bg-primary/10 text-primary border-primary/30 capitalize">{project.status}</Badge>
                <Badge variant="outline" className="bg-transparent border-border/60">
                  Fase {project.phase}/4
                </Badge>
                <Badge variant="outline" className="bg-transparent border-border/60">
                  {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                </Badge>
                <Badge className="bg-[oklch(0.55_0.1_160)]/10 text-[oklch(0.55_0.1_160)] border-[oklch(0.55_0.1_160)]/20">
                  {project.creditsUsed} créditos
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
                <Link href={`/app/projects/${project.id}/export`} className="gap-2">
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
