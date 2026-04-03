"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Globe, FolderOpen } from "lucide-react"
import { toast } from "sonner"

type DomainInfo = {
  domain: string
  documentroot: string
  type: string
}

type SubdomainInfo = {
  subdomain: string
  domain: string
  fullDomain: string
  documentroot: string
}

export function SubdomainManager({ projectId, cpanelCredentialId }: { projectId: string; cpanelCredentialId: string | null }) {
  const [domains, setDomains] = useState<DomainInfo[]>([])
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [subdomains, setSubdomains] = useState<SubdomainInfo[]>([])
  const [loadingSubdomains, setLoadingSubdomains] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  // Load domains from cPanel
  useEffect(() => {
    if (!cpanelCredentialId) return
    async function loadDomains() {
      setLoadingDomains(true)
      try {
        const res = await fetch(`/api/deploy/cpanel/domains?credentialId=${cpanelCredentialId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setDomains(json.data || [])
      } catch (err: any) {
        toast.error(err.message || "Erro ao carregar domínios")
      } finally {
        setLoadingDomains(false)
      }
    }
    loadDomains()
  }, [cpanelCredentialId])

  // Load subdomains when domain selected
  const loadSubdomains = useCallback(async () => {
    if (!projectId) return
    setLoadingSubdomains(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSubdomains(json.data || [])
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar subdomínios")
    } finally {
      setLoadingSubdomains(false)
    }
  }, [projectId])

  useEffect(() => {
    if (selectedDomain) loadSubdomains()
  }, [selectedDomain, loadSubdomains])

  async function handleCreate() {
    if (!newName.trim() || !selectedDomain) return
    setCreating(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: newName.trim().toLowerCase(), domain: selectedDomain }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Subdomínio ${json.data.fullDomain} criado!`)
      setNewName("")
      loadSubdomains()
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar subdomínio")
    } finally {
      setCreating(false)
    }
  }

  if (!cpanelCredentialId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Servidor cPanel não configurado para este projeto.
        </CardContent>
      </Card>
    )
  }

  const filteredSubdomains = selectedDomain
    ? subdomains.filter((s) => s.domain === selectedDomain)
    : subdomains

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Subdomínios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domain selector */}
        {loadingDomains ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um domínio" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((d) => (
                <SelectItem key={d.domain} value={d.domain}>
                  {d.domain} ({d.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Create form */}
        {selectedDomain && (
          <>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">.{selectedDomain}</span>
              <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-1">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar
              </Button>
            </div>

            {/* List */}
            {loadingSubdomains ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSubdomains.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum subdomínio encontrado para {selectedDomain}.
              </p>
            ) : (
              <div className="divide-y">
                {filteredSubdomains.map((s) => (
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
