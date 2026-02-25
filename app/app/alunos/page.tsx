"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/hooks/use-admin"
import { Search, GraduationCap } from "lucide-react"

type Aluno = {
  id: string
  name: string
  email: string
  partnership_plan: string | null
  created_at: string
}

export default function AlunosPage() {
  const router = useRouter()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Redirect non-admins
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/app/projects")
    }
  }, [adminLoading, isAdmin, router])

  const fetchAlunos = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : ""
      const res = await fetch(`/api/alunos${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAlunos(data)
    } catch {
      setAlunos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAlunos(debouncedSearch)
    }
  }, [isAdmin, debouncedSearch, fetchAlunos])

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
        <div>
          <h1 className="text-3xl lg:text-4xl font-black mb-2 gradient-text">Alunos</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Gerencie os alunos cadastrados na plataforma
          </p>
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
                    </tr>
                  ))
                ) : alunos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && alunos.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {alunos.length} aluno{alunos.length !== 1 ? "s" : ""} encontrado{alunos.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  )
}
