"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderKanban, CheckCircle2, Clock, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

type Project = {
  id: string
  name: string
  segment: string
  status: "completed" | "in-progress"
  phase: number
  createdAt: string
  creditsUsed: number
}

const defaultProjects: Project[] = [
  {
    id: "1",
    name: "Consultoria Financeira Silva",
    segment: "Serviços Financeiros",
    status: "completed",
    phase: 4,
    createdAt: "2024-01-15",
    creditsUsed: 20,
  },
  {
    id: "2",
    name: "Academia Fitness Pro",
    segment: "Saúde e Bem-estar",
    status: "in-progress",
    phase: 2,
    createdAt: "2024-01-18",
    creditsUsed: 15,
  },
  {
    id: "3",
    name: "Advocacia Oliveira & Associados",
    segment: "Serviços Jurídicos",
    status: "in-progress",
    phase: 3,
    createdAt: "2024-01-20",
    creditsUsed: 15,
  },
]

export default function AppDashboard() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const storageKey = "magicsite-projects"

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Project[]
    if (saved.length) {
      setProjects([...saved, ...defaultProjects])
    }
  }, [])

  const stats = useMemo(() => {
    const completed = projects.filter((p) => p.status === "completed").length
    return [
      {
        label: "Projetos",
        value: `${projects.length}`,
        icon: FolderKanban,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        label: "Completos",
        value: `${completed}`,
        icon: CheckCircle2,
        gradient: "from-emerald-500 to-teal-500",
      },
      {
        label: "Tempo Médio",
        value: "8min",
        icon: Clock,
        gradient: "from-violet-500 to-purple-500",
      },
      {
        label: "Economia",
        value: "R$ 24k",
        icon: TrendingUp,
        gradient: "from-amber-500 to-orange-500",
      },
    ]
  }, [projects])

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge className="bg-[oklch(0.55_0.1_160)]/10 text-[oklch(0.55_0.1_160)] hover:bg-[oklch(0.55_0.1_160)]/20 border-[oklch(0.55_0.1_160)]/20">
          Completo
        </Badge>
      )
    }
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Em Progresso</Badge>
  }

  const getPhaseLabel = (phase: number) => {
    const phases = ["Informações Básicas", "Análise Estratégica", "Criação de Conteúdo", "Download"]
    return phases[phase - 1]
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl p-6 lg:p-12 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-border/50">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
              Meus <span className="gradient-text">Projetos</span>
            </h1>
            <p className="text-muted-foreground text-lg">Gerencie e acompanhe seus sites em desenvolvimento</p>
          </div>

          <Link href="/app/projects/new">
            <Button size="lg" className="gap-2 h-12 px-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-[oklch(0.7_0.19_32)]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Novo Projeto</span>
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-border/50 hover:border-border/80 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                    <stat.icon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recentes</h2>
            <Link href="/app/projects">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        {getStatusBadge(project.status)}
                      </div>

                      <p className="text-sm text-muted-foreground">{project.segment}</p>

                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {project.creditsUsed} créditos
                        </span>
                        <span>Fase {project.phase}/4</span>
                        <span>{new Date(project.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div>
                      {project.status === "completed" ? (
                        <Link href={`/app/projects/${project.id}/export`}>
                          <Button variant="outline" className="gap-2 bg-transparent hover:bg-primary/5">
                            Exportar
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/app/projects/${project.id}`}>
                          <Button className="gap-2">
                            Continuar
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {project.status === "in-progress" && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-[oklch(0.7_0.19_32)] rounded-full transition-all"
                          style={{ width: `${(project.phase / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
