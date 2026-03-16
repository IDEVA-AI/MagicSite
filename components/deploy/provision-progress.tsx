"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Server, Key, GitBranch, Rocket } from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { key: "ftp", label: "Criando conta FTP", icon: Server },
  { key: "secrets", label: "Configurando secrets no GitHub", icon: Key },
  { key: "workflow", label: "Adicionando workflow de deploy", icon: GitBranch },
]

export function ProvisionProgress({
  projectId,
  onComplete,
}: {
  projectId: string
  onComplete: () => void
}) {
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const provision = async () => {
    setRunning(true)
    setError(null)
    setCurrentStep(0)

    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/provision`, { method: "POST" })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setCurrentStep(3)
      setDone(true)
      toast.success("Projeto provisionado com sucesso!")
      onComplete()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || "Erro no provisionamento.")
    } finally {
      setRunning(false)
    }
  }

  if (!running && !done && !error) {
    return (
      <Button onClick={provision} className="w-full gap-2">
        <Rocket className="w-4 h-4" />
        Provisionar Deploy Automático
      </Button>
    )
  }

  return (
    <div className="space-y-3 border rounded-lg p-4">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3">
          {done || i < currentStep ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : i === currentStep && running ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
          ) : error && i === currentStep ? (
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-muted shrink-0" />
          )}
          <step.icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm">{step.label}</span>
        </div>
      ))}

      {error && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={provision}>Tentar novamente</Button>
        </div>
      )}
    </div>
  )
}
