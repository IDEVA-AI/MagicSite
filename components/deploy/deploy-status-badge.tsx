"use client"

import { cn } from "@/lib/utils"

const BADGE_MAP: Record<string, { label: string; className: string }> = {
  created: { label: "Criado", className: "bg-gray-100 text-gray-700" },
  detecting: { label: "Detectando...", className: "bg-blue-100 text-blue-700 animate-pulse" },
  detected: { label: "Stack Detectada", className: "bg-amber-100 text-amber-700" },
  provisioning: { label: "Provisionando...", className: "bg-blue-100 text-blue-700 animate-pulse" },
  provisioned: { label: "Ativo", className: "bg-emerald-100 text-emerald-700" },
  error: { label: "Erro", className: "bg-red-100 text-red-700" },
  queued: { label: "Na fila", className: "bg-gray-100 text-gray-700" },
  in_progress: { label: "Em andamento", className: "bg-blue-100 text-blue-700 animate-pulse" },
  completed: { label: "Sucesso", className: "bg-emerald-100 text-emerald-700" },
  failure: { label: "Falhou", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-700" },
}

export function DeployStatusBadge({ status }: { status: string }) {
  const badge = BADGE_MAP[status] || { label: status, className: "bg-gray-100 text-gray-700" }
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", badge.className)}>
      {badge.label}
    </span>
  )
}
