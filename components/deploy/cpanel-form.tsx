"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Server, CheckCircle2, Link, User, KeyRound, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

type CpanelCredential = {
  id: string
  label: string
  host: string
  username: string
}

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

export function CpanelForm({
  onConnected,
  existingCredentials,
  onCredentialsChange,
}: {
  onConnected: (credential: CpanelCredential) => void
  existingCredentials: CpanelCredential[]
  onCredentialsChange?: (credentials: CpanelCredential[]) => void
}) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(existingCredentials.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ url: "", username: "", token: "" })

  const startEdit = (cred: CpanelCredential) => {
    setEditingId(cred.id)
    setForm({ url: `https://${cred.host}:2083`, username: cred.username, token: "" })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/deploy/cpanel/connect?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir.")
      toast.success("Servidor removido.")
      const updated = existingCredentials.filter((c) => c.id !== id)
      onCredentialsChange?.(updated)
      if (updated.length === 0) setShowForm(true)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { host, port } = parseServerUrl(form.url)
      if (!host) throw new Error("URL do servidor inválida.")

      if (editingId) {
        const res = await fetch("/api/deploy/cpanel/connect", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            host,
            port,
            username: form.username,
            ...(form.token ? { password: form.token } : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast.success("Servidor atualizado!")
        const updated = existingCredentials.map((c) => c.id === editingId ? { ...c, host, label: host, username: form.username } : c)
        onCredentialsChange?.(updated)
      } else {
        const res = await fetch("/api/deploy/cpanel/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: host, host, port, username: form.username, password: form.token }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        toast.success("Servidor conectado!")
        onCredentialsChange?.([data, ...existingCredentials])
        onConnected(data)
      }

      setShowForm(false)
      setEditingId(null)
      setForm({ url: "", username: "", token: "" })
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {existingCredentials.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Servidores salvos</p>
          {existingCredentials.map((cred) => (
            <div key={cred.id} className="flex items-center gap-2">
              <button
                onClick={() => onConnected(cred)}
                className="flex-1 text-left px-4 py-3 border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
              >
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{cred.label}</p>
                  <p className="text-xs text-muted-foreground">{cred.username}@{cred.host}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
              </button>
              <Button variant="ghost" size="icon" onClick={() => startEdit(cred)} className="shrink-0 h-9 w-9">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(cred.id)}
                disabled={deleting === cred.id}
                className="shrink-0 h-9 w-9 text-destructive hover:text-destructive"
              >
                {deleting === cred.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <Button variant="outline" onClick={() => { setEditingId(null); setForm({ url: "", username: "", token: "" }); setShowForm(true) }} className="w-full gap-2 text-muted-foreground">
          <Server className="w-4 h-4" />
          Adicionar novo servidor
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {existingCredentials.length > 0 && (
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{editingId ? "editar servidor" : "novo servidor"}</span>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" />URL do Servidor</Label>
            <Input placeholder="https://servidor.com:2083" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <p className="text-xs text-muted-foreground">Cole o link completo do cPanel (a porta será extraída automaticamente)</p>
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Usuário</Label>
            <Input placeholder="usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Token de Acesso</Label>
            <Input type="password" placeholder={editingId ? "Deixe vazio para manter o atual" : "Token da API do cPanel"} value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required={!editingId} />
          </div>
          <div className="flex gap-2">
            {existingCredentials.length > 0 && (
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null) }} className="flex-1">Cancelar</Button>
            )}
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
              {editingId ? "Salvar" : "Conectar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
