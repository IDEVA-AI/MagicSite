"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Server, CheckCircle2, Link, User, KeyRound } from "lucide-react"
import { toast } from "sonner"

type CpanelCredential = {
  id: string
  label: string
  host: string
  username: string
}

function parseServerUrl(raw: string): { host: string; port: number } {
  let url = raw.trim()
  // Add protocol if missing so URL parser works
  if (!url.startsWith("http")) url = `https://${url}`
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    const port = parsed.port ? parseInt(parsed.port) : 2083
    return { host, port }
  } catch {
    // Fallback: try to extract host:port manually
    const clean = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    const [host, portStr] = clean.split(":")
    return { host, port: portStr ? parseInt(portStr) : 2083 }
  }
}

export function CpanelForm({
  onConnected,
  existingCredentials,
}: {
  onConnected: (credential: CpanelCredential) => void
  existingCredentials: CpanelCredential[]
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ url: "", username: "", token: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { host, port } = parseServerUrl(form.url)
      if (!host) throw new Error("URL do servidor inválida.")

      const res = await fetch("/api/deploy/cpanel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: host,
          host,
          port,
          username: form.username,
          password: form.token,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success("Servidor conectado!")
      onConnected(data)
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
            <button
              key={cred.id}
              onClick={() => onConnected(cred)}
              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <Server className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{cred.label}</p>
                <p className="text-xs text-muted-foreground">{cred.username}@{cred.host}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            </button>
          ))}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou adicione novo</span></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" />URL do Servidor</Label>
          <Input
            placeholder="https://servidor.com:2083"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">Cole o link completo do cPanel (a porta será extraída automaticamente)</p>
        </div>
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Usuário</Label>
          <Input placeholder="usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Token de Acesso</Label>
          <Input type="password" placeholder="Token da API do cPanel" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required />
        </div>
        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
          Conectar
        </Button>
      </form>
    </div>
  )
}
