"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Globe, FolderOpen } from "lucide-react"
import { toast } from "sonner"

type SubdomainInfo = {
  subdomain: string
  domain: string
  fullDomain: string
  documentroot: string
}

export function SubdomainManager({ projectId, domain }: { projectId: string; domain: string | null }) {
  const [subdomains, setSubdomains] = useState<SubdomainInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSubdomains(json.data || [])
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar subdomínios")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: newName.trim().toLowerCase() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Subdomínio ${json.data.fullDomain} criado!`)
      setNewName("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar subdomínio")
    } finally {
      setCreating(false)
    }
  }

  if (!domain) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Domínio não configurado para este projeto.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subdomínios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="max-w-[200px]"
          />
          <span className="text-sm text-muted-foreground">.{domain}</span>
          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-1">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : subdomains.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum subdomínio encontrado no servidor.
          </p>
        ) : (
          <div className="divide-y">
            {subdomains.map((s) => (
              <div key={s.fullDomain} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.fullDomain}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {s.documentroot}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
