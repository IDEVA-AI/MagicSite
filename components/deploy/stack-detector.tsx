"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, CheckCircle2, Pencil } from "lucide-react"
import { toast } from "sonner"

type DetectResult = {
  framework_detected: string
  build_command: string
  output_dir: string
  install_command: string
}

export function StackDetector({
  projectId,
  initialData,
  onDetected,
}: {
  projectId: string
  initialData?: DetectResult | null
  onDetected: (data: DetectResult) => void
}) {
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectResult | null>(initialData || null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    build_command: initialData?.build_command || "",
    output_dir: initialData?.output_dir || "",
    install_command: initialData?.install_command || "npm install",
  })

  const detect = async () => {
    setDetecting(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/detect`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data)
      setForm({ build_command: data.build_command, output_dir: data.output_dir, install_command: data.install_command })
      onDetected(data)
      toast.success(`Framework detectado: ${data.framework_detected}`)
    } catch (err: any) {
      toast.error(err.message || "Erro ao detectar framework.")
    } finally {
      setDetecting(false)
    }
  }

  if (!result) {
    return (
      <Button onClick={detect} disabled={detecting} className="w-full">
        {detecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
        Detectar Stack
      </Button>
    )
  }

  return (
    <div className="space-y-3 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-medium">{result.framework_detected}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="w-4 h-4" />
        </Button>
      </div>

      {editing && (
        <div className="space-y-2 pt-2 border-t">
          <div className="space-y-1">
            <Label className="text-xs">Comando de build</Label>
            <Input value={form.build_command} onChange={(e) => setForm({ ...form, build_command: e.target.value })} placeholder="npm run build" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pasta de saída</Label>
            <Input value={form.output_dir} onChange={(e) => setForm({ ...form, output_dir: e.target.value })} placeholder="dist" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Comando de instalação</Label>
            <Input value={form.install_command} onChange={(e) => setForm({ ...form, install_command: e.target.value })} placeholder="npm install" />
          </div>
          <Button
            size="sm"
            onClick={() => {
              onDetected({ ...result, ...form })
              setEditing(false)
            }}
          >
            Salvar ajustes
          </Button>
        </div>
      )}
    </div>
  )
}
