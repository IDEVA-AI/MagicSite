"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Download, Sparkles, MoreVertical, Trash2, Copy } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  {
    id: "4",
    name: "Clínica Odontológica Sorriso",
    segment: "Saúde",
    status: "completed",
    phase: 4,
    createdAt: "2024-01-10",
    creditsUsed: 20,
  },
  {
    id: "5",
    name: "Escola de Idiomas Global",
    segment: "Educação",
    status: "completed",
    phase: 4,
    createdAt: "2024-01-08",
    creditsUsed: 20,
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const storageKey = "magicsite-projects"

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as Project[]
    if (saved.length) {
      setProjects([...saved, ...defaultProjects])
    }
  }, [])

  const completedProjects = projects.filter((p) => p.status === "completed")
  const inProgressProjects = projects.filter((p) => p.status === "in-progress")

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge className="bg-[oklch(0.55_0.1_160)]/10 text-[oklch(0.55_0.1_160)] hover:bg-[oklch(0.55_0.1_160)]/20">
          Completo
        </Badge>
      )
    }
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Em Progresso</Badge>
  }

  const getPhaseLabel = (phase: number) => {
    const phases = ["Informações Básicas", "Análise Estratégica", "Criação de Conteúdo", "Download"]
    return phases[phase - 1]
  }

  const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => (
    <Card className="glow-border bg-background/50 backdrop-blur-sm hover:border-primary transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">{project.name}</h3>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-sm text-muted-foreground font-medium">{project.segment}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono mb-4">
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            {project.creditsUsed} créditos
          </span>
          <span>Fase {project.phase}/4</span>
          <span>{new Date(project.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>

        <div className="flex items-center gap-2">
          {project.status === "completed" ? (
            <Link href={`/app/projects/${project.id}/export`} className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent font-bold border-2">
                <Download className="w-4 h-4" />
                Baixar Site
              </Button>
            </Link>
          ) : (
            <Link href={`/app/projects/${project.id}`} className="flex-1">
              <Button className="w-full font-bold shadow-lg">Continuar - {getPhaseLabel(project.phase)}</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black mb-2">
              Meus <span className="gradient-text">Projetos</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">Gerencie todos os seus sites criados com IA</p>
          </div>

          <Link href="/app/projects/new">
            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all font-bold">
              <Plus className="w-5 h-5" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar projetos..." className="pl-10 font-medium" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="font-bold">
              Todos ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="font-bold">
              Em Progresso ({inProgressProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-bold">
              Completos ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {inProgressProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
