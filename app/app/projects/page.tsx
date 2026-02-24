"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Download, MoreVertical, Trash2, Copy, FolderKanban, Loader2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useProjects, STATUS_LABEL_MAP, STATUS_PHASE_MAP, type ProjectStatus, type ProjectForUI } from "@/hooks/use-projects"

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.segment.toLowerCase().includes(q),
    )
  }, [projects, searchQuery])

  const completedProjects = filteredProjects.filter((p) => p.status === "ready")
  const inProgressProjects = filteredProjects.filter((p) => p.status !== "ready")

  const getStatusBadge = (status: ProjectStatus) => {
    if (status === "ready") {
      return (
        <Badge className="bg-[oklch(0.55_0.1_160)]/10 text-[oklch(0.55_0.1_160)] hover:bg-[oklch(0.55_0.1_160)]/20">
          Pronto
        </Badge>
      )
    }
    return (
      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
        {STATUS_LABEL_MAP[status] || "Em Progresso"}
      </Badge>
    )
  }

  const getPhaseLabel = (phase: number) => {
    const phases = ["Informações Básicas", "Análise Estratégica", "Criação de Conteúdo", "Download"]
    return phases[phase - 1]
  }

  const ProjectCard = ({ project }: { project: ProjectForUI }) => (
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
          <span>Fase {project.phase}/4</span>
          <span>{new Date(project.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>

        <div className="flex items-center gap-2">
          {project.status === "ready" ? (
            <Link href={`/app/projects/${project.id}/prompt`} className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent font-bold border-2">
                <Download className="w-4 h-4" />
                Exportar Prompt
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

  const EmptyProjectsList = () => (
    <Card className="border-dashed border-2 border-border/50 col-span-2">
      <CardContent className="p-12 text-center">
        <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
        <p className="text-muted-foreground mb-6">Crie seu primeiro site com IA em minutos</p>
        <Link href="/app/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  const EmptySearchResult = () => (
    <div className="col-span-2 py-12 text-center">
      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">
        Nenhum projeto encontrado para &quot;{searchQuery}&quot;
      </p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    )
  }

  const renderProjectGrid = (list: ProjectForUI[]) => (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.length === 0 ? (
        <EmptyProjectsList />
      ) : list.length === 0 && searchQuery.trim() ? (
        <EmptySearchResult />
      ) : list.length === 0 ? (
        <p className="col-span-2 text-center py-8 text-muted-foreground">Nenhum projeto nesta categoria</p>
      ) : (
        list.map((project) => <ProjectCard key={project.id} project={project} />)
      )}
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 space-y-6">
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            className="pl-10 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="font-bold">
              Todos ({filteredProjects.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="font-bold">
              Em Progresso ({inProgressProjects.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-bold">
              Completos ({completedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderProjectGrid(filteredProjects)}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {renderProjectGrid(inProgressProjects)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderProjectGrid(completedProjects)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
