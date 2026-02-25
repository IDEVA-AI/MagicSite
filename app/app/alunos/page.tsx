"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/hooks/use-admin"
import {
  Search,
  GraduationCap,
  Plus,
  ShieldCheck,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlunoFormDialog } from "@/components/admin/aluno-form-dialog"
import { AlunoDeleteDialog } from "@/components/admin/aluno-delete-dialog"
import { PromoteDialog } from "@/components/admin/promote-dialog"

type Aluno = {
  id: string
  name: string
  email: string
  partnership_plan: string | null
  created_at: string
}

const PAGE_SIZE = 10

export default function AlunosPage() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [editAluno, setEditAluno] = useState<Aluno | null>(null)
  const [deleteAluno, setDeleteAluno] = useState<Aluno | null>(null)
  const [promoteOpen, setPromoteOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Redirect non-admins
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/app/projects")
    }
  }, [adminLoading, isAdmin, router])

  const fetchAlunos = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
      if (q) params.set("q", q)
      const res = await fetch(`/api/alunos?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setAlunos(json.data)
      setTotal(json.total)
    } catch {
      setAlunos([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAlunos(debouncedSearch, page)
    }
  }, [isAdmin, debouncedSearch, page, fetchAlunos])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleEdit(aluno: Aluno) {
    setEditAluno(aluno)
    setFormOpen(true)
  }

  function handleNewAluno() {
    setEditAluno(null)
    setFormOpen(true)
  }

  function handleSuccess() {
    fetchAlunos(debouncedSearch, page)
  }

  if (adminLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black mb-2 gradient-text">Alunos</h1>
            <p className="text-lg text-muted-foreground font-medium">
              Gerencie os alunos cadastrados na plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPromoteOpen(true)}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Promover Admin
            </Button>
            <Button onClick={handleNewAluno}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Plano</th>
                  <th className="text-left px-4 py-3 font-semibold">Cadastro</th>
                  <th className="text-right px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-40 bg-muted animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-muted animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : alunos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Nenhum aluno encontrado
                    </td>
                  </tr>
                ) : (
                  alunos.map((aluno) => (
                    <tr key={aluno.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{aluno.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{aluno.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={aluno.partnership_plan ? "default" : "secondary"}>
                          {aluno.partnership_plan ?? "Nenhum"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(aluno.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(aluno)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteAluno(aluno)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} aluno{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AlunoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        aluno={editAluno}
        onSuccess={handleSuccess}
      />
      <AlunoDeleteDialog
        open={!!deleteAluno}
        onOpenChange={(open) => { if (!open) setDeleteAluno(null) }}
        aluno={deleteAluno}
        onSuccess={handleSuccess}
      />
      <PromoteDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
      />
    </div>
  )
}
