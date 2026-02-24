"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type ProjectStatus = "draft" | "briefing_complete" | "content_complete" | "ready"

export type ProjectForUI = {
  id: string
  name: string
  segment: string
  status: ProjectStatus
  phase: number
  createdAt: string
  updatedAt: string
}

export const STATUS_PHASE_MAP: Record<ProjectStatus, number> = {
  draft: 1,
  briefing_complete: 2,
  content_complete: 3,
  ready: 4,
}

export const STATUS_LABEL_MAP: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  briefing_complete: "Briefing Completo",
  content_complete: "Conteúdo Pronto",
  ready: "Pronto",
}

function mapProjectToUI(p: any): ProjectForUI {
  return {
    id: p.id,
    name: p.company_name || p.name,
    segment: p.custom_segment_name || p.segment || "Segmento não informado",
    status: p.status,
    phase: STATUS_PHASE_MAP[p.status as ProjectStatus] || 1,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectForUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const loadProjects = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: queryError } = await supabase
        .from("projects")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

      if (queryError) throw queryError
      if (cancelled.current) return

      setProjects((data || []).map(mapProjectToUI))
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Não foi possível carregar os projetos.")
      setProjects([])
    } finally {
      if (!cancelled.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    cancelled.current = false
    loadProjects()
    return () => {
      cancelled.current = true
    }
  }, [loadProjects])

  return { projects, loading, error, reload: loadProjects }
}
