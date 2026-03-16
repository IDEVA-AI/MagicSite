"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, GitBranch, Lock, Globe, Loader2 } from "lucide-react"

type Repo = {
  id: number
  name: string
  full_name: string
  owner: string
  private: boolean
  default_branch: string
  language: string | null
  updated_at: string
}

export function RepoSelector({ onSelect }: { onSelect: (repo: Repo) => void }) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const fetchRepos = async (q?: string) => {
    setLoading(true)
    try {
      const url = q ? `/api/deploy/github/repos?q=${encodeURIComponent(q)}` : "/api/deploy/github/repos"
      const res = await fetch(url)
      const json = await res.json()
      setRepos(json.data || [])
    } catch {
      setRepos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => fetchRepos(value || undefined), 400))
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar repositório..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[300px] border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : repos.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Nenhum repositório encontrado.
          </div>
        ) : (
          <div className="divide-y">
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => onSelect(repo)}
                className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{repo.full_name}</span>
                    {repo.private ? (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Globe className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {repo.language && <span>{repo.language}</span>}
                    <span>{repo.default_branch}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Selecionar</Button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
