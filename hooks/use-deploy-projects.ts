"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type DeployProjectStatus = "created" | "detecting" | "detected" | "provisioning" | "provisioned" | "error"

export type DeployProject = {
  id: string
  name: string
  github_repo_owner: string
  github_repo_name: string
  framework_detected: string | null
  status: DeployProjectStatus
  domain: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<DeployProjectStatus, string> = {
  created: "Criado",
  detecting: "Detectando...",
  detected: "Stack Detectada",
  provisioning: "Provisionando...",
  provisioned: "Ativo",
  error: "Erro",
}

export const STATUS_COLORS: Record<DeployProjectStatus, string> = {
  created: "bg-gray-100 text-gray-700",
  detecting: "bg-blue-100 text-blue-700",
  detected: "bg-amber-100 text-amber-700",
  provisioning: "bg-blue-100 text-blue-700",
  provisioned: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
}

export function useDeployProjects() {
  const [projects, setProjects] = useState<DeployProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: queryError } = await supabase
        .from("deploy_projects")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

      if (queryError) throw queryError
      if (cancelled.current) return
      setProjects(data || [])
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Erro ao carregar projetos.")
      setProjects([])
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    cancelled.current = false
    load()
    return () => { cancelled.current = true }
  }, [load])

  return { projects, loading, error, reload: load }
}
