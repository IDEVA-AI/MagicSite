"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Download,
  MoreVertical,
  Trash2,
  Copy,
  Loader2,
  Sparkles,
  Pencil,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useProjects,
  STATUS_LABEL_MAP,
  type ProjectStatus,
  type ProjectForUI,
} from "@/hooks/use-projects"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffMinutes < 1) return "agora mesmo"
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return "há 1 dia"
  if (diffDays < 30) return `há ${diffDays} dias`
  if (diffMonths === 1) return "há 1 mês"
  if (diffMonths < 12) return `há ${diffMonths} meses`
  if (diffYears === 1) return "há 1 ano"
  return `há ${diffYears} anos`
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "draft", label: "Rascunho" },
  { value: "briefing_complete", label: "Briefing Completo" },
  { value: "content_complete", label: "Conteúdo Pronto" },
  { value: "ready", label: "Pronto" },
]

export default function ProjectsPage() {
  const { projects, loading, error, reload } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectToDelete, setProjectToDelete] = useState<ProjectForUI | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setDeleting(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectToDelete.id)

    if (deleteError) {
      toast.error("Erro ao excluir projeto", { description: deleteError.message })
      setDeleting(false)
      return
    }

    toast.success("Projeto excluído com sucesso!")
    setProjectToDelete(null)
    setDeleting(false)
    reload()
  }

  const filteredProjects = useMemo(() => {
    let result = projects

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.segment.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter)
    }

    return result
  }, [projects, searchQuery, statusFilter])

  const getStatusBadgeStyle = (status: ProjectStatus) => {
    switch (status) {
      case "ready":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "content_complete":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "briefing_complete":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

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

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Banner CTA */}
        <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-xl font-bold mb-1">
                Pronto para criar algo incrível?
              </h2>
              <p className="text-muted-foreground text-sm">
                Inicie um novo projeto e deixe a IA criar um site profissional
                para você
              </p>
            </div>
            <Link href="/app/projects/new" className="shrink-0">
              <Button size="lg" className="gap-2 font-bold shadow-lg">
                <Sparkles className="w-5 h-5" />
                Criar Novo Projeto
              </Button>
            </Link>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do projeto ou cliente..."
              className="pl-10 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredProjects.length} de {projects.length} projetos
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create New Project Card */}
          <Link href="/app/projects/new" className="block">
            <Card className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all h-full cursor-pointer group">
              <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[240px]">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center mb-4 group-hover:border-primary/60 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Criar Novo Projeto</h3>
                <p className="text-sm text-muted-foreground">
                  Comece um novo projeto do zero
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Project Cards */}
          {filteredProjects.length === 0 && projects.length > 0 && (
            <div className="col-span-full py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum projeto encontrado
                {searchQuery.trim() && (
                  <>
                    {" "}
                    para &quot;{searchQuery}&quot;
                  </>
                )}
              </p>
            </div>
          )}

          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              statusBadgeStyle={getStatusBadgeStyle}
              onDelete={setProjectToDelete}
            />
          ))}
        </div>

        {/* Delete confirmation dialog */}
        <AlertDialog
          open={!!projectToDelete}
          onOpenChange={(open) => !open && setProjectToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o projeto{" "}
                <strong>&quot;{projectToDelete?.name}&quot;</strong>? Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  statusBadgeStyle,
  onDelete,
}: {
  project: ProjectForUI
  statusBadgeStyle: (status: ProjectStatus) => string
  onDelete: (project: ProjectForUI) => void
}) {
  const progressPercent = (project.phase / 4) * 100

  return (
    <Card className="bg-background/50 backdrop-blur-sm hover:border-primary/40 transition-all flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header: name + menu */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base leading-tight line-clamp-2">
            {project.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 -mt-1 -mr-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(project)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Segment */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {project.segment}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge
            variant="outline"
            className={statusBadgeStyle(project.status)}
          >
            {STATUS_LABEL_MAP[project.status]}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progresso</span>
            <span className="font-medium">{project.phase}/4</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span>Criado {formatRelativeDate(project.createdAt)}</span>
          <span>·</span>
          <span>Atualizado {formatRelativeDate(project.updatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {project.status === "ready" ? (
            <Link
              href={`/app/projects/${project.id}/prompt`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full gap-2 font-semibold"
                size="sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </Link>
          ) : (
            <Link href={`/app/projects/${project.id}`} className="flex-1">
              <Button className="w-full font-semibold" size="sm">
                Continuar
              </Button>
            </Link>
          )}
          <Link href={`/app/projects/${project.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
