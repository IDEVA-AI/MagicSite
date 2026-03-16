"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function DomainSelector({
  credentialId,
  value,
  onChange,
}: {
  credentialId: string
  value: string
  onChange: (domain: string, path: string) => void
}) {
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deployPath, setDeployPath] = useState("/public_html")

  useEffect(() => {
    if (!credentialId) return
    setLoading(true)
    fetch(`/api/deploy/cpanel/domains?credentialId=${credentialId}`)
      .then((r) => r.json())
      .then((json) => setDomains(json.data || []))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false))
  }, [credentialId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando domínios...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Domínio</Label>
        <Select value={value} onValueChange={(v) => onChange(v, deployPath)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o domínio" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Pasta de deploy</Label>
        <Input
          value={deployPath}
          onChange={(e) => {
            setDeployPath(e.target.value)
            if (value) onChange(value, e.target.value)
          }}
          placeholder="/public_html"
        />
        <p className="text-xs text-muted-foreground">Diretório no servidor onde os arquivos serão publicados</p>
      </div>
    </div>
  )
}
