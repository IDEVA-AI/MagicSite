"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, Search, Server, Key, GitBranch, Rocket, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const STEPS = [
  { key: "detect", label: "Detectando stack do projeto", icon: Search },
  { key: "ftp", label: "Criando conta FTP", icon: Server },
  { key: "secrets", label: "Configurando secrets no GitHub", icon: Key },
  { key: "workflow", label: "Adicionando workflow de deploy", icon: GitBranch },
]

type WorkflowRun = {
  id: number
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
}

export function ProvisionProgress({
  projectId,
  repoFullName,
  domain,
  onComplete,
}: {
  projectId: string
  repoFullName?: string
  domain?: string
  onComplete: () => void
}) {
  const [running, setRunning] = useState(false)
  const [stepStatuses, setStepStatuses] = useState<Record<string, "pending" | "running" | "done" | "error">>({
    detect: "pending", ftp: "pending", secrets: "pending", workflow: "pending",
  })
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const updateStep = (key: string, status: "running" | "done" | "error") => {
    setStepStatuses((prev) => ({ ...prev, [key]: status }))
  }

  const pollWorkflowRun = () => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deploy/projects/${projectId}/deploys`)
        if (!res.ok) return
        const data = await res.json()
        const runs: WorkflowRun[] = data.runs || []
        if (runs.length === 0) return

        const latest = runs[0]
        setWorkflowRun(latest)

        if (latest.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {}
    }, 5000)
  }

  const provision = async () => {
    setRunning(true)
    setError(null)
    setWorkflowRun(null)
    setStepStatuses({ detect: "running", ftp: "pending", secrets: "pending", workflow: "pending" })

    try {
      // Step 1: Detect stack
      const detectRes = await fetch(`/api/deploy/projects/${projectId}/detect`, { method: "POST" })
      if (!detectRes.ok) {
        const d = await detectRes.json()
        throw new Error(d.error || "Erro ao detectar stack.")
      }
      updateStep("detect", "done")
      updateStep("ftp", "running")

      // Steps 2-4: Provision (FTP + secrets + workflow)
      const provRes = await fetch(`/api/deploy/projects/${projectId}/provision`, { method: "POST" })
      if (!provRes.ok) {
        const d = await provRes.json()
        throw new Error(d.error || "Erro no provisionamento.")
      }

      updateStep("ftp", "done")
      updateStep("secrets", "done")
      updateStep("workflow", "done")
      setDone(true)
      toast.success("Deploy configurado! Workflow em execução...")
      onComplete()
      pollWorkflowRun()
    } catch (err: any) {
      setError(err.message)
      // Mark current running step as error
      setStepStatuses((prev) => {
        const updated = { ...prev }
        for (const key of Object.keys(updated)) {
          if (updated[key] === "running") updated[key] = "error"
        }
        return updated
      })
      toast.error(err.message || "Erro no provisionamento.")
    } finally {
      setRunning(false)
    }
  }

  if (!running && !done && !error) {
    return (
      <Button onClick={provision} className="w-full gap-2">
        <Rocket className="w-4 h-4" />
        Iniciar Deploy Automático
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 border rounded-lg p-4">
        {STEPS.map((step) => {
          const status = stepStatuses[step.key]
          return (
            <div key={step.key} className="flex items-center gap-3">
              {status === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : status === "running" ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
              ) : status === "error" ? (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted shrink-0" />
              )}
              <step.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{step.label}</span>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={provision}>Tentar novamente</Button>
        </div>
      )}

      {done && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">GitHub Actions</p>

          {!workflowRun ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Aguardando início do workflow...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {workflowRun.status === "completed" && workflowRun.conclusion === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : workflowRun.status === "completed" && workflowRun.conclusion === "failure" ? (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {workflowRun.status === "completed"
                    ? workflowRun.conclusion === "success"
                      ? "Deploy realizado com sucesso!"
                      : "Falha no deploy"
                    : "Deploy em andamento..."}
                </p>
                <p className="text-xs text-muted-foreground">Run #{workflowRun.id}</p>
              </div>
              <a href={workflowRun.html_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          )}

          {workflowRun?.status === "completed" && workflowRun.conclusion === "success" && domain && (
            <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Visitar {domain}
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
