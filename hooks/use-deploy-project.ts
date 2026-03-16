"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type DeployRun = {
  id: number
  status: string
  conclusion: string | null
  html_url: string
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
        fetch(`/api/deploy/projects/${id}/deploys`).then(r => r.json()),
      ])

      if (projectRes.error) throw projectRes.error
      if (cancelled.current) return

      setProject(projectRes.data)
      setDeploys(deploysRes.runs || [])
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
