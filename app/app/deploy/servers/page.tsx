"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Globe, FolderOpen, Server, ArrowLeft, Link as LinkIcon, User, KeyRound, Pencil, Trash2 } from "lucide-react"
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

  // Server form state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [serverForm, setServerForm] = useState({ url: "", username: "", token: "" })
  const [savingServer, setSavingServer] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function parseServerUrl(raw: string): { host: string; port: number } {
    let url = raw.trim()
    if (!url.startsWith("http")) url = `https://${url}`
    try {
      const parsed = new URL(url)
      return { host: parsed.hostname, port: parsed.port ? parseInt(parsed.port) : 2083 }
    } catch {
      const clean = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      const [host, portStr] = clean.split(":")
      return { host, port: portStr ? parseInt(portStr) : 2083 }
    }
  }

  function openAddDialog() {
    setEditingId(null)
    setServerForm({ url: "", username: "", token: "" })
    setDialogOpen(true)
  }

  function openEditDialog(cred: Credential) {
    setEditingId(cred.id)
    setServerForm({ url: `https://${cred.host}:${cred.port}`, username: cred.username, token: "" })
    setDialogOpen(true)
  }

  async function handleDeleteServer(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/deploy/cpanel/connect?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir.")
      toast.success("Servidor removido.")
      setCredentials((prev) => prev.filter((c) => c.id !== id))
      if (selectedCred === id) setSelectedCred("")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaveServer(e: React.FormEvent) {
    e.preventDefault()
    setSavingServer(true)
    try {
      const { host, port } = parseServerUrl(serverForm.url)
      if (!host) throw new Error("URL do servidor inválida.")

      if (editingId) {
        const res = await fetch("/api/deploy/cpanel/connect", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            host,
            port,
            username: serverForm.username,
            ...(serverForm.token ? { password: serverForm.token } : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast.success("Servidor atualizado!")
        setCredentials((prev) =>
          prev.map((c) => c.id === editingId ? { ...c, host, port, label: host, username: serverForm.username } : c)
        )
      } else {
        const res = await fetch("/api/deploy/cpanel/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: host, host, port, username: serverForm.username, password: serverForm.token }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast.success("Servidor adicionado!")
        setCredentials((prev) => [data, ...prev])
      }

      setDialogOpen(false)
      setEditingId(null)
      setServerForm({ url: "", username: "", token: "" })
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar servidor.")
    } finally {
      setSavingServer(false)
    }
  }

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="w-4 h-4" />
            Servidor cPanel
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1" onClick={openAddDialog}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Servidor" : "Adicionar Servidor"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveServer} className="space-y-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" />URL do Servidor</Label>
                  <Input placeholder="https://servidor.com:2083" value={serverForm.url} onChange={(e) => setServerForm({ ...serverForm, url: e.target.value })} required />
                  <p className="text-xs text-muted-foreground">Cole o link completo do cPanel (a porta será extraída automaticamente)</p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Usuário</Label>
                  <Input placeholder="usuario" value={serverForm.username} onChange={(e) => setServerForm({ ...serverForm, username: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Token de Acesso</Label>
                  <Input type="password" placeholder={editingId ? "Deixe vazio para manter o atual" : "Token da API do cPanel"} value={serverForm.token} onChange={(e) => setServerForm({ ...serverForm, token: e.target.value })} required={!editingId} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" disabled={savingServer} className="flex-1 gap-2">
                    {savingServer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                    {editingId ? "Salvar" : "Conectar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-muted-foreground">Nenhum servidor cadastrado.</p>
              <p className="text-xs text-muted-foreground">Clique em "Adicionar" para conectar seu primeiro servidor cPanel.</p>
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
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-3 gap-4 text-sm flex-1">
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
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(selectedCredObj)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteServer(selectedCredObj.id)}
                      disabled={deletingId === selectedCredObj.id}
                    >
                      {deletingId === selectedCredObj.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
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
