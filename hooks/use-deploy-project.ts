"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type DeployRun = {
  id: string
  github_run_id: number
  status: string
  conclusion: string | null
  head_sha: string | null
  commit_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export function useDeployProject(id: string) {
  const [project, setProject] = useState<any>(null)
  const [deploys, setDeploys] = useState<DeployRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()

      const [projectRes, deploysRes] = await Promise.all([
        supabase.from("deploy_projects").select("*").eq("id", id).single(),
        supabase.from("deploy_runs").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(20),
      ])

      if (projectRes.error) throw projectRes.error
      if (cancelled.current) return

      setProject(projectRes.data)
      setDeploys(deploysRes.data || [])
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Erro ao carregar projeto.")
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    cancelled.current = false
    load()
    return () => { cancelled.current = true }
  }, [load])

  return { project, deploys, loading, error, reload: load }
}
