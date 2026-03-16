"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Server, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type CpanelCredential = {
  id: string
  label: string
  host: string
  username: string
}

export function CpanelForm({
  onConnected,
  existingCredentials,
}: {
  onConnected: (credential: CpanelCredential) => void
  existingCredentials: CpanelCredential[]
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ label: "", host: "", port: "2083", username: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/deploy/cpanel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label || form.host,
          host: form.host,
          port: parseInt(form.port),
          username: form.username,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success("cPanel conectado!")
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Host</Label>
            <Input placeholder="meusite.com" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>Porta</Label>
            <Input placeholder="2083" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Usuário</Label>
          <Input placeholder="usuario_cpanel" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Senha</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Apelido (opcional)</Label>
          <Input placeholder="Meu servidor" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Conectar
        </Button>
      </form>
    </div>
  )
}
