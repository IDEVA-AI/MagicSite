"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Globe, FolderOpen, Server, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type Credential = {
  id: string
  label: string
  host: string
  port: number
  username: string
}

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

export default function ServersPage() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCred, setSelectedCred] = useState<string>("")
  const [domains, setDomains] = useState<DomainInfo[]>([])
  const [loadingDomains, setLoadingDomains] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [subdomains, setSubdomains] = useState<SubdomainInfo[]>([])
  const [loadingSubdomains, setLoadingSubdomains] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  // Load credentials
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/deploy/cpanel/connect")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCredentials(json.data || [])
      } catch (err: any) {
        toast.error(err.message || "Erro ao carregar servidores")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load domains when server selected
  useEffect(() => {
    if (!selectedCred) {
      setDomains([])
      setSelectedDomain("")
      return
    }
    async function loadDomains() {
      setLoadingDomains(true)
      setSelectedDomain("")
      setSubdomains([])
      try {
        const res = await fetch(`/api/deploy/cpanel/domains?credentialId=${selectedCred}`)
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
  }, [selectedCred])

  // Load subdomains when domain selected
  const loadSubdomains = useCallback(async () => {
    if (!selectedCred) return
    setLoadingSubdomains(true)
    try {
      const res = await fetch(`/api/deploy/cpanel/subdomains?credentialId=${selectedCred}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSubdomains(json.data || [])
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar subdomínios")
    } finally {
      setLoadingSubdomains(false)
    }
  }, [selectedCred])

  useEffect(() => {
    if (selectedDomain) loadSubdomains()
  }, [selectedDomain, loadSubdomains])

  async function handleCreate() {
    if (!newName.trim() || !selectedDomain || !selectedCred) return
    setCreating(true)
    try {
      const res = await fetch("/api/deploy/cpanel/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: selectedCred,
          subdomain: newName.trim().toLowerCase(),
          domain: selectedDomain,
        }),
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

  const selectedCredObj = credentials.find((c) => c.id === selectedCred)
  const filteredSubdomains = selectedDomain
    ? subdomains.filter((s) => s.domain === selectedDomain)
    : subdomains

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/deploy">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Servidores</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus servidores cPanel e subdomínios</p>
        </div>
      </div>

      {/* Server Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="w-4 h-4" />
            Servidor cPanel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-muted-foreground">Nenhum servidor cadastrado.</p>
              <Link href="/app/deploy/new">
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Adicionar no wizard de deploy
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Select value={selectedCred} onValueChange={setSelectedCred}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {credentials.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.username}@{c.host}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCredObj && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Host</p>
                    <p className="font-medium">{selectedCredObj.host}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Porta</p>
                    <p className="font-medium">{selectedCredObj.port}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usuário</p>
                    <p className="font-medium">{selectedCredObj.username}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain + Subdomains */}
      {selectedCred && (
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

            {/* Create subdomain form */}
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
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="gap-1"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar
                  </Button>
                </div>

                {/* Subdomain list */}
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
      )}
    </div>
  )
}
