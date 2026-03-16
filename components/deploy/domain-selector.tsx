"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Globe, FolderOpen } from "lucide-react"

type DomainInfo = {
  domain: string
  documentroot: string
  type: string
}

export function DomainSelector({
  credentialId,
  value,
  onChange,
}: {
  credentialId: string
  value: string
  onChange: (domain: string, path: string) => void
}) {
  const [domains, setDomains] = useState<DomainInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!credentialId) return
    setLoading(true)
    fetch(`/api/deploy/cpanel/domains?credentialId=${credentialId}`)
      .then((r) => r.json())
      .then((json) => setDomains(json.data || []))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false))
  }, [credentialId])

  const selectedDomain = domains.find((d) => d.domain === value)

  const handleSelect = (domain: string) => {
    const dom = domains.find((d) => d.domain === domain)
    onChange(domain, dom?.documentroot || "/public_html")
  }

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
        <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Domínio</Label>
        <Select value={value} onValueChange={handleSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o domínio" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem key={d.domain} value={d.domain}>
                <span>{d.domain}</span>
                <span className="ml-2 text-xs text-muted-foreground">({d.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedDomain && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
          <FolderOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Pasta: <code className="font-mono text-xs">{selectedDomain.documentroot}</code></span>
        </div>
      )}
    </div>
  )
}
