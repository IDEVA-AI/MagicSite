"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StepFour } from "@/components/create/step-four"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"

export default function ProjectPromptPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const [projectData, setProjectData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return

    const loadProject = async () => {
      const supabase = createClient()
      
      // Buscar projeto
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectError || !project) {
        console.error("Error loading project:", projectError)
        router.push("/dashboard")
        return
      }

      // Buscar briefing associado
      const { data: briefing, error: briefingError } = await supabase
        .from("briefings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle()

      // Montar projectData completo
      const resolvedSegment = project.custom_segment_name || project.segment || "Segmento não informado"
      
      const fullProjectData = {
        businessName: project.company_name || project.name,
        phone: project.whatsapp || "",
        email: project.email || "",
        address: project.location || "",
        segment: resolvedSegment,
        segmentKey: project.segment || "outro",
        customSegment: project.custom_segment_name || "",
        description: project.business_description || "",
        instagram: project.instagram || "",
        businessHours: project.business_hours || "",
        valueProposition: project.business_proposal || "",
        detailedDescription: project.business_description || "",
        siteObjective: project.site_objectives || "",
        briefing: briefing?.strategic_variables_json || {},
      }

      // Se o briefing tem dados estruturados, mesclar
      if (briefing) {
        const strategicVars = briefing.strategic_variables_json || {}
        fullProjectData.briefing = {
          ...strategicVars,
          // Garantir que campos do briefing estejam disponíveis
          offering: strategicVars.offering || briefing.what_i_offer || "",
          sector: strategicVars.sector || briefing.business_sector || "",
          differential: strategicVars.differential || briefing.competitive_differential || "",
          targetAudience: strategicVars.targetAudience || briefing.target_audience || "",
          audienceChallenges: strategicVars.audienceChallenges || briefing.audience_challenges || "",
          audienceAspirations: strategicVars.audienceAspirations || briefing.audience_aspirations || "",
          toneOfVoice: strategicVars.toneOfVoice || briefing.brand_voice || "",
          strategicObjective: strategicVars.strategicObjective || briefing.strategic_objective || "",
          corePhilosophy: strategicVars.corePhilosophy || briefing.core_philosophy || "",
          deliveryModel: strategicVars.deliveryModel || briefing.delivery_model || "",
          socialProof: strategicVars.socialProof || briefing.social_proof || "",
          nonNegotiableValues: strategicVars.nonNegotiableValues || briefing.non_negotiable_values || "",
          marketContext: strategicVars.marketContext || briefing.market_context || "",
          finalPromise: strategicVars.finalPromise || briefing.final_promise || "",
          commonObjections: strategicVars.commonObjections || briefing.common_objections || "",
          desiredEmotion: strategicVars.desiredEmotion || briefing.desired_emotion || "",
          additionalService: strategicVars.additionalService || briefing.additional_service || "",
          averageTicket: strategicVars.averageTicket || briefing.average_ticket || "",
          ctaPrimary: strategicVars.ctaPrimary || strategicVars.ctas?.primary || "",
          ctaSecondary: strategicVars.ctaSecondary || strategicVars.ctas?.secondary || "",
          ctaAlternative: strategicVars.ctaAlternative || strategicVars.ctas?.alternative || "",
          primaryColor: strategicVars.primaryColor || strategicVars.colors?.primary || "#1D4ED8",
          secondaryColor: strategicVars.secondaryColor || strategicVars.colors?.secondary || "#ff8800",
          theme: strategicVars.theme || "light",
          // Contexto adicional
          services: strategicVars.services || "",
          brandHistory: strategicVars.brandHistory || "",
          workProcess: strategicVars.workProcess || "",
          team: strategicVars.team || "",
          certifications: strategicVars.certifications || "",
          faq: strategicVars.faq || "",
        }
        
        // Wireframe se existir
        if (strategicVars.wireframe) {
          fullProjectData.wireframe = strategicVars.wireframe
        }
      }

      setProjectData(fullProjectData)
      setLoading(false)
    }

    loadProject()
  }, [projectId, router])

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg tech-grid flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen gradient-bg tech-grid flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Projeto não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg tech-grid">
      <div className="container max-w-6xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <StepFour 
          onBack={() => router.push("/dashboard")} 
          projectData={{ ...projectData, id: projectId }} 
        />
      </div>
    </div>
  )
}

