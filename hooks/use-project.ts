"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { ProjectStatus } from "./use-projects"

export type ProjectWithBriefing = {
  id: string
  name: string
  companyName: string
  segment: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  whatsapp: string
  email: string
  location: string
  instagram: string
  businessHours: string
  businessDescription: string
  businessProposal: string
  siteObjectives: string
  briefing: Record<string, any>
  finalPromise: string
  strategicObjective: string
  wireframe: any[]
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectWithBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const loadProject = useCallback(async () => {
    if (!projectId) return
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: proj, error: projErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projErr || !proj) throw projErr || new Error("Projeto não encontrado")

      const { data: briefing } = await supabase
        .from("briefings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle()

      if (cancelled.current) return

      const vars = briefing?.strategic_variables_json || {}

      setProject({
        id: proj.id,
        name: proj.name,
        companyName: proj.company_name || proj.name,
        segment: proj.custom_segment_name || proj.segment || "Segmento não informado",
        status: proj.status,
        createdAt: proj.created_at,
        updatedAt: proj.updated_at,
        whatsapp: proj.whatsapp || "",
        email: proj.email || "",
        location: proj.location || "",
        instagram: proj.instagram || "",
        businessHours: proj.business_hours || "",
        businessDescription: proj.business_description || "",
        businessProposal: proj.business_proposal || "",
        siteObjectives: proj.site_objectives || "",
        briefing: vars,
        finalPromise: briefing?.final_promise || vars.finalPromise || "",
        strategicObjective: briefing?.strategic_objective || vars.strategicObjective || "",
        wireframe: vars.wireframe || [],
      })
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Não foi possível carregar o projeto.")
      setProject(null)
    } finally {
      if (!cancelled.current) {
        setLoading(false)
      }
    }
  }, [projectId])

  useEffect(() => {
    cancelled.current = false
    loadProject()
    return () => {
      cancelled.current = true
    }
  }, [loadProject])

  return { project, loading, error, reload: loadProject }
}
