"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Download, 
  Info,
  Briefcase,
  Target,
  Users,
  Heart,
  Megaphone,
  Palette,
  Phone,
  Mail,
  MapPin,
  Building2,
  Zap,
  TrendingUp,
  Shield,
  Award as AwardIcon,
  Lightbulb,
  DollarSign,
  MessageSquare,
  Sparkles as SparklesIcon,
  Clock,
  Sun,
  Moon,
  BookOpen,
  Settings,
  HelpCircle,
  List
} from "lucide-react"
// jsPDF is dynamically imported in downloadBriefingPdf to avoid 830KB static bundle
import { Progress } from "@/components/ui/progress"

const autoResize = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

const downloadBriefingPdf = async (briefing: any) => {
  if (typeof window === "undefined") return

  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  const addSection = (title: string, content: string | undefined) => {
    const safeContent = (content || "Não informado").toString().trim() || "Não informado"
    const splitText = doc.splitTextToSize(safeContent, contentWidth)
    const blockHeight = splitText.length * 5 + 12

    if (yPosition + blockHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(title, margin, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(splitText, margin, yPosition)
    yPosition += splitText.length * 5 + 5
  }

  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text("Briefing Estratégico", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  const sections: Array<[string, string | undefined]> = [
    ["O que eu ofereço", briefing.offering],
    ["Setor de Atuação", briefing.sector],
    ["Diferencial Competitivo", briefing.differential],
    ["Público-Alvo", briefing.targetAudience],
    ["Desafios do Público", briefing.audienceChallenges],
    ["Aspirações do Público", briefing.audienceAspirations],
    ["Tom de Voz", briefing.toneOfVoice],
    ["Objetivo Estratégico", briefing.strategicObjective],
    ["Filosofia Central", briefing.corePhilosophy],
    ["Modelo de Entrega", briefing.deliveryModel],
    ["Prova Social", briefing.socialProof],
    ["Valores Inegociáveis", briefing.nonNegotiableValues],
    ["Contexto de Mercado", briefing.marketContext],
    ["Promessa Final", briefing.finalPromise],
    ["Objeções Comuns", briefing.commonObjections],
    ["Emoção Desejada", briefing.desiredEmotion],
    ["Serviço Adicional", briefing.additionalService],
    ["Ticket Médio", briefing.averageTicket],
    ["CTA Principal", briefing.ctaPrimary],
    ["CTA Secundário", briefing.ctaSecondary],
    ["CTA Alternativo", briefing.ctaAlternative],
    [
      "Cores",
      `Primária: ${briefing.primaryColor || "N/D"}, Secundária: ${briefing.secondaryColor || "N/D"}, Tema: ${briefing.theme || "light"}`,
    ],
  ]

  sections.forEach(([title, value]) => addSection(title, value))

  // Contexto Adicional - Sempre incluído no PDF
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("CONTEXTO ADICIONAL", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 10

  const contextSections: Array<[string, string | undefined]> = [
    ["Serviços/Produtos Detalhados", briefing.services],
    ["História da Marca", briefing.brandHistory],
    ["Processo de Trabalho", briefing.workProcess],
    ["Equipe", briefing.team],
    ["Certificações e Diferenciais Técnicos", briefing.certifications],
    ["Perguntas Frequentes (FAQ)", briefing.faq],
  ]

  contextSections.forEach(([title, value]) => {
    // Sempre adiciona a seção, mesmo se vazia (mostra "Não informado")
    addSection(title, value)
  })

  const pdfBuffer = doc.output("arraybuffer")
  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" })
  const url = URL.createObjectURL(pdfBlob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "briefing-estrategico.pdf"
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

interface BriefingReviewProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

const BRIEFING_DRAFT_KEY = "magicsite-briefing-draft"

function loadBriefingDraft(): any | null {
  try {
    const raw = localStorage.getItem(BRIEFING_DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveBriefingDraft(briefing: any) {
  try {
    localStorage.setItem(BRIEFING_DRAFT_KEY, JSON.stringify(briefing))
  } catch {
    // localStorage may be full
  }
}

export function clearBriefingDraft() {
  try {
    localStorage.removeItem(BRIEFING_DRAFT_KEY)
  } catch {
    // ignore
  }
}

export function BriefingReview({ onNext, onBack, initialData }: BriefingReviewProps) {
  const hasExistingBriefing = initialData?.briefing && Object.keys(initialData.briefing).length > 0

  const hasDraft = !hasExistingBriefing && !!loadBriefingDraft()
  const [isGenerating, setIsGenerating] = useState(!hasExistingBriefing && !hasDraft)
  const [progress, setProgress] = useState(0)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const generateBriefing = useCallback(() => {
    const businessName = initialData?.businessName || "Sua Empresa"
    const segment =
      initialData?.customSegment || initialData?.segment || initialData?.segmentKey || "seu segmento"
    const address = initialData?.address || "sua região"
    const description = initialData?.description || ""

    return {
      offering: `${businessName} é uma empresa especializada em ${segment}, localizada em ${address}. ${description}`,
      sector: segment,
      differential: "Atendimento personalizado com foco em resultados e expertise especializada no segmento",
      targetAudience: "Empresas e profissionais que buscam qualidade e profissionalismo",
      audienceChallenges: "Dificuldade em encontrar serviços de qualidade e confiança no mercado",
      audienceAspirations: "Alcançar seus objetivos com suporte especializado e resultados garantidos",
      toneOfVoice: "Profissional, confiável e focado em resultados",
      strategicObjective: `Ser referência em ${segment} na região, reconhecida pela qualidade técnica e atendimento diferenciado`,
      corePhilosophy: "Qualidade e relacionamento duradouro são fundamentais para o sucesso",
      deliveryModel: "Atendimento personalizado com acompanhamento próximo e foco na satisfação do cliente",
      socialProof: "Experiência comprovada no mercado, casos de sucesso e clientes satisfeitos",
      nonNegotiableValues: "Nunca comprometemos a qualidade técnica ou ética profissional por questões comerciais",
      marketContext: `Crescimento da demanda por serviços especializados de ${segment} no mercado atual`,
      finalPromise: "Entregar resultados excepcionais que superam expectativas e geram valor real",
      commonObjections: "Preocupação com custos, dúvidas sobre prazo de entrega, receio com a qualidade do serviço",
      desiredEmotion: "Confiança e segurança na escolha profissional",
      additionalService: "Consultoria especializada e orientação estratégica",
      averageTicket: "Sob consulta",
      ctaPrimary: "Quero Falar com Especialista",
      ctaSecondary: "Quero Agendar uma Consulta",
      ctaAlternative: "Quero Tirar Dúvidas",
      primaryColor: "#1D4ED8",
      secondaryColor: "#ff8800",
      theme: "light",
      // Contexto Adicional
      services: "",
      brandHistory: "",
      team: "",
      workProcess: "",
      faq: "",
      certifications: "",
    }
  }, [
    initialData?.address,
    initialData?.businessName,
    initialData?.customSegment,
    initialData?.description,
    initialData?.segment,
    initialData?.segmentKey,
  ])

  const savedDraft = useRef(loadBriefingDraft())
  const [briefing, setBriefing] = useState(
    hasExistingBriefing ? initialData.briefing : savedDraft.current ?? generateBriefing(),
  )

  useEffect(() => {
    if (hasExistingBriefing || hasDraft) return

    let cancelled = false
    setIsGenerating(true)
    setGenerationError(null)
    setProgress(15)

    const timer = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 90) return prev
        return prev + 5
      })
    }, 250)

    const generate = async () => {
      try {
        const response = await fetch("/api/agents/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            businessName: initialData?.businessName || "",
            segment: initialData?.segment || "",
            segmentKey: initialData?.segmentKey || "",
            customSegment: initialData?.customSegment || "",
            location: initialData?.address || "",
            description: initialData?.description || "",
            valueProposition: initialData?.valueProposition || initialData?.businessProposal || "",
            detailedDescription: initialData?.detailedDescription || initialData?.businessDescription || "",
            siteObjective: initialData?.siteObjective || initialData?.siteObjectives || "",
          }),
        })

        if (response.status === 402) {
          const payload = await response.json().catch(() => ({}))
          if (cancelled) return
          setBriefing(generateBriefing())
          setGenerationError(payload.error || "Créditos insuficientes para gerar o briefing.")
          toast.error("Créditos insuficientes para gerar o briefing com IA.")
          const { dispatchCreditsChanged } = await import("@/lib/credits-event")
          dispatchCreditsChanged()
          return
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || "Não foi possível gerar o briefing.")
        }

        const data = await response.json()
        if (cancelled) return
        // Merge AI response with fallback defaults so missing fields get filled
        const aiBriefing = data.briefing || data
        const merged = { ...generateBriefing(), ...aiBriefing }
        setBriefing(merged)
        saveBriefingDraft(merged)
        setProgress(100)
        const { dispatchCreditsChanged } = await import("@/lib/credits-event")
        dispatchCreditsChanged()
      } catch (err: unknown) {
        console.error("Erro ao gerar briefing", err)
        if (cancelled) return
        setBriefing(generateBriefing())
        setGenerationError("A IA não respondeu. Usamos um modelo padrão — você pode editar tudo abaixo.")
        toast.warning("Usamos dados padrão porque a IA não respondeu. Revise e ajuste os campos.")
      } finally {
        if (!cancelled) {
          setIsGenerating(false)
          clearInterval(timer)
        }
      }
    }

    generate()

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [
    generateBriefing,
    hasExistingBriefing,
    initialData?.address,
    initialData?.businessDescription,
    initialData?.businessName,
    initialData?.businessProposal,
    initialData?.customSegment,
    initialData?.description,
    initialData?.detailedDescription,
    initialData?.segment,
    initialData?.segmentKey,
    initialData?.siteObjective,
    initialData?.siteObjectives,
    initialData?.valueProposition,
  ])

  const handleFieldChange = (field: string, value: string) => {
    setBriefing((prev: any) => {
      const updated = { ...prev, [field]: value }
      saveBriefingDraft(updated)
      return updated
    })
  }

  const handleNext = () => {
    clearBriefingDraft()
    onNext({ briefing })
  }

  const handleDownloadPDF = () => {
    try {
      downloadBriefingPdf(briefing)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Erro ao gerar PDF. Tente novamente.")
    }
  }

  const handleDownloadContextMd = () => {
    const businessName = initialData?.businessName || "Empresa"

    const section = (title: string, content: string | undefined) => {
      if (!content?.trim()) return ""
      return `## ${title}\n\n${content.trim()}\n\n`
    }

    const md = [
      `# Contexto Adicional — ${businessName}\n\n`,
      section("Serviços/Produtos Detalhados", briefing.services),
      section("História da Marca", briefing.brandHistory),
      section("Processo de Trabalho", briefing.workProcess),
      section("Equipe", briefing.team),
      section("Certificações e Diferenciais Técnicos", briefing.certifications),
      section("Perguntas Frequentes (FAQ)", briefing.faq),
    ]
      .filter(Boolean)
      .join("")

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contexto-adicional.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const fieldIcons: Record<string, React.ReactNode> = {
    offering: <Briefcase className="h-4 w-4" />,
    sector: <Building2 className="h-4 w-4" />,
    differential: <Zap className="h-4 w-4" />,
    targetAudience: <Users className="h-4 w-4" />,
    audienceChallenges: <Heart className="h-4 w-4" />,
    audienceAspirations: <Target className="h-4 w-4" />,
    toneOfVoice: <Megaphone className="h-4 w-4" />,
    strategicObjective: <TrendingUp className="h-4 w-4" />,
    corePhilosophy: <Lightbulb className="h-4 w-4" />,
    deliveryModel: <SparklesIcon className="h-4 w-4" />,
    socialProof: <AwardIcon className="h-4 w-4" />,
    nonNegotiableValues: <Shield className="h-4 w-4" />,
    marketContext: <TrendingUp className="h-4 w-4" />,
    finalPromise: <Heart className="h-4 w-4" />,
    commonObjections: <Info className="h-4 w-4" />,
    desiredEmotion: <Heart className="h-4 w-4" />,
    additionalService: <SparklesIcon className="h-4 w-4" />,
    averageTicket: <DollarSign className="h-4 w-4" />,
    ctaPrimary: <MessageSquare className="h-4 w-4" />,
    ctaSecondary: <MessageSquare className="h-4 w-4" />,
    ctaAlternative: <MessageSquare className="h-4 w-4" />,
  }

  // Cores da marca: Teal/Cyan (primary) e Coral (accent)
  // Aplicando cores específicas por bloco
  const fieldColors: Record<string, string> = {
    // Core Business - Teal/Cyan (primary da marca)
    offering: "text-cyan-600",
    sector: "text-teal-600",
    differential: "text-cyan-500",
    targetAudience: "text-teal-500",
    audienceChallenges: "text-cyan-700",
    audienceAspirations: "text-teal-700",
    // Branding - Coral (accent da marca)
    toneOfVoice: "text-orange-500",
    strategicObjective: "text-orange-600",
    corePhilosophy: "text-orange-400",
    deliveryModel: "text-orange-500",
    socialProof: "text-orange-600",
    nonNegotiableValues: "text-orange-700",
    // Marketing - Cores específicas conforme design
    marketContext: "text-purple-600",
    finalPromise: "text-pink-500",
    commonObjections: "text-orange-600",
    desiredEmotion: "text-pink-500",
    additionalService: "text-red-500",
    averageTicket: "text-green-600",
    // CTAs - Coral (accent)
    ctaPrimary: "text-orange-600",
    ctaSecondary: "text-orange-500",
    ctaAlternative: "text-orange-400",
  }

  const friendlyLabels: Record<string, string> = {
    offering: "O que você oferece?",
    sector: "Qual é o seu setor?",
    differential: "O que te diferencia da concorrência?",
    targetAudience: "Quem é o seu cliente ideal?",
    audienceChallenges: "Quais problemas seus clientes enfrentam?",
    audienceAspirations: "O que seus clientes desejam alcançar?",
    toneOfVoice: "Como sua marca conversa com os clientes?",
    strategicObjective: "Qual o principal objetivo do seu negócio?",
    corePhilosophy: "Qual a filosofia do seu trabalho?",
    deliveryModel: "Como funciona o seu atendimento?",
    socialProof: "Por que as pessoas confiam em você?",
    nonNegotiableValues: "O que você nunca abre mão?",
    marketContext: "Como está o mercado hoje?",
    finalPromise: "Qual resultado você garante ao cliente?",
    commonObjections: "O que impede as pessoas de comprar de você?",
    desiredEmotion: "Como o visitante deve se sentir no site?",
    additionalService: "Você oferece algum serviço extra?",
    averageTicket: "Qual o valor médio dos seus serviços?",
    ctaPrimary: "Botão principal do site",
    ctaSecondary: "Botão secundário",
    ctaAlternative: "Botão alternativo",
  }

  const requiredFields = new Set([
    "offering", "sector", "differential", "targetAudience",
    "toneOfVoice", "finalPromise", "ctaPrimary",
  ])

  const EditableField = ({
    label,
    field,
    value,
    multiline = false,
  }: {
    label: string
    field: string
    value: string
    multiline?: boolean
  }) => {
    const Icon = fieldIcons[field]
    const colorClass = fieldColors[field] || "text-foreground/90"
    const friendlyLabel = friendlyLabels[field] || label
    const isRequired = requiredFields.has(field)

    return (
      <div className="space-y-2">
        <label className={`text-sm font-semibold flex items-center gap-2 ${colorClass}`}>
          {Icon}
          {friendlyLabel}
          {isRequired ? (
            <span className="text-red-500 text-xs">*</span>
          ) : (
            <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
          )}
        </label>
        <textarea
          defaultValue={value}
          onBlur={(e) => handleFieldChange(field, e.target.value)}
          onInput={(e) => autoResize(e.currentTarget)}
          ref={(el) => autoResize(el)}
          rows={multiline ? 2 : 1}
          className={`
            w-full rounded-md border border-border/40 bg-background/50 px-3 py-2
            text-sm transition-all resize-none overflow-hidden
            hover:bg-primary/5 hover:border-primary/30
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
            ${multiline ? "min-h-[50px]" : "min-h-[40px]"}
          `}
        />
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Análise Estratégica em Andamento</h2>
            <p className="text-muted-foreground">
              A IA está analisando suas informações e gerando o briefing estratégico completo...
            </p>
          </div>
        </div>

        <Card className="p-8 bg-secondary/20">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-lg font-semibold mb-3">Gerando 18 variáveis estratégicas</p>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% completo</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 pt-4">
              {[
                "Análise de público-alvo",
                "Definição de diferenciais",
                "Tom de voz estratégico",
                "Objetivos de negócio",
                "Contexto de mercado",
                "Proposta de valor",
                "Paleta de cores",
                "CTAs otimizados",
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-opacity ${progress > index * 12 ? "opacity-100" : "opacity-30"
                    }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${progress > index * 12 ? "bg-primary" : "bg-muted-foreground"}`}
                  />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Briefing Estratégico</h2>
          <p className="text-muted-foreground">
            Revise e ajuste as informações geradas pela IA. Clique em qualquer campo para editar diretamente.
          </p>
          {generationError && <p className="text-sm text-destructive mt-2">{generationError}</p>}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["business", "branding", "marketing", "colors", "contact", "context", "ctas"]} className="space-y-5">
        {/* Core Business */}
        <AccordionItem value="business" className="border-0">
          <Card className="p-6 glow-border border-cyan-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-600">
                  <Briefcase className="h-5 w-5 text-cyan-600" />
                  Sobre Seu Negócio
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  O que você faz, para quem e o que te diferencia.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="grid md:grid-cols-2 gap-5">
                <EditableField label="O que eu ofereço" field="offering" value={briefing.offering} multiline />
                <EditableField label="Setor de Atuação" field="sector" value={briefing.sector} multiline />
                <EditableField label="Diferencial Competitivo" field="differential" value={briefing.differential} multiline />
                <EditableField label="Público-Alvo" field="targetAudience" value={briefing.targetAudience} multiline />
                <EditableField label="Desafios do Público" field="audienceChallenges" value={briefing.audienceChallenges} multiline />
                <EditableField label="Aspirações do Público" field="audienceAspirations" value={briefing.audienceAspirations} multiline />
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Branding */}
        <AccordionItem value="branding" className="border-0">
          <Card className="p-6 glow-border border-orange-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
                  <Palette className="h-5 w-5 text-orange-600" />
                  Identidade da Sua Marca
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Como sua marca se comunica e o que valoriza.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="grid md:grid-cols-2 gap-5">
                <EditableField label="Tom de Voz" field="toneOfVoice" value={briefing.toneOfVoice} multiline />
                <EditableField label="Objetivo Estratégico" field="strategicObjective" value={briefing.strategicObjective} multiline />
                <EditableField label="Filosofia Central" field="corePhilosophy" value={briefing.corePhilosophy} multiline />
                <EditableField label="Modelo de Entrega" field="deliveryModel" value={briefing.deliveryModel} multiline />
                <EditableField label="Prova Social" field="socialProof" value={briefing.socialProof} multiline />
                <EditableField label="Valores Inegociáveis" field="nonNegotiableValues" value={briefing.nonNegotiableValues} multiline />
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Marketing */}
        <AccordionItem value="marketing" className="border-0">
          <Card className="p-6 glow-border border-indigo-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
                  <Megaphone className="h-5 w-5 text-indigo-600" />
                  Estratégia de Vendas
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Mercado, promessa ao cliente e objeções de compra.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="grid md:grid-cols-2 gap-5">
                <EditableField label="Contexto de Mercado" field="marketContext" value={briefing.marketContext} multiline />
                <EditableField label="Promessa Final" field="finalPromise" value={briefing.finalPromise} multiline />
                <EditableField label="Objeções Comuns" field="commonObjections" value={briefing.commonObjections} multiline />
                <EditableField label="Emoção Desejada" field="desiredEmotion" value={briefing.desiredEmotion} multiline />
                <EditableField label="Serviço Adicional" field="additionalService" value={briefing.additionalService} multiline />
                <EditableField label="Investimento Médio" field="averageTicket" value={briefing.averageTicket} multiline />
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Paleta de Cores */}
        <AccordionItem value="colors" className="border-0">
          <Card className="p-6 glow-border border-rose-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-rose-600">
                  <Palette className="h-5 w-5 text-rose-600" />
                  Paleta de Cores
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Cores primária, secundária e tema do site.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <Alert className="bg-primary/5 border-primary/20 mb-5">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-sm font-semibold text-foreground mb-2">
                  Como cada cor é utilizada no site gerado:
                </AlertTitle>
                <AlertDescription className="text-sm text-muted-foreground space-y-1.5">
                  <p>
                    <strong className="text-foreground">Cor Primária:</strong> Botões principais (CTAs), links, destaques de navegação e títulos.
                  </p>
                  <p>
                    <strong className="text-foreground">Cor Secundária:</strong> Botões secundários, elementos complementares e hover states.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/90">Cor Primária</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={briefing.primaryColor}
                      onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={briefing.primaryColor}
                      onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/90">Cor Secundária</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={briefing.secondaryColor}
                      onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={briefing.secondaryColor}
                      onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Tema do Site
                  </label>
                  <Select
                    value={briefing.theme || "light"}
                    onValueChange={(value) => handleFieldChange("theme", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro (Light)</SelectItem>
                      <SelectItem value="dark">Escuro (Dark)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Informações de Contato */}
        <AccordionItem value="contact" className="border-0">
          <Card className="p-6 glow-border border-emerald-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  Informações de Contato
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Dados de contato utilizados no site gerado.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </label>
                  <div className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm">
                    {initialData?.phone || "Não informado"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </label>
                  <div className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm">
                    {initialData?.email || "Não informado"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                    Localização
                  </label>
                  <div className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm">
                    {initialData?.address || "Não informado"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <FileText className="h-4 w-4" />
                    Instagram
                  </label>
                  <div className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm">
                    {initialData?.instagram || "Não informado"}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-emerald-600">
                    <Clock className="h-4 w-4" />
                    Horário de Funcionamento
                  </label>
                  <div className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm">
                    {initialData?.businessHours || "Não informado"}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Contexto Adicional */}
        <AccordionItem value="context" className="border-0">
          <Card className="p-6 glow-border border-blue-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Contexto Adicional
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Informações complementares que enriquecerão o conteúdo do site.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleDownloadContextMd}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Contexto (.md)
                </Button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                    <List className="h-4 w-4" />
                    Serviços/Produtos Detalhados
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Liste todos os serviços ou produtos oferecidos, com descrições breves.
                  </p>
                  <textarea
                    defaultValue={briefing.services || ""}
                    onBlur={(e) => handleFieldChange("services", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    ref={(el) => autoResize(el)}
                    rows={4}
                    placeholder={"Ex: Consultoria Empresarial - Análise estratégica e planejamento...\nGestão de Projetos - Acompanhamento e execução...\nTreinamento - Capacitação de equipes..."}
                    className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[120px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                    <BookOpen className="h-4 w-4" />
                    História da Marca
                    <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Como a empresa começou, missão, visão, valores e o que torna a marca única.
                  </p>
                  <textarea
                    defaultValue={briefing.brandHistory || ""}
                    onBlur={(e) => handleFieldChange("brandHistory", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    ref={(el) => autoResize(el)}
                    rows={3}
                    placeholder="Conte a história da sua marca, quando começou, qual foi a motivação, missão e valores..."
                    className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                    <Settings className="h-4 w-4" />
                    Processo de Trabalho
                    <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Como funciona o atendimento, etapas do processo, metodologia utilizada.
                  </p>
                  <textarea
                    defaultValue={briefing.workProcess || ""}
                    onBlur={(e) => handleFieldChange("workProcess", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    ref={(el) => autoResize(el)}
                    rows={3}
                    placeholder="Descreva como funciona seu processo: etapas, metodologia, tempo de entrega..."
                    className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                      <Users className="h-4 w-4" />
                      Equipe
                      <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Informações sobre a equipe, profissionais principais, experiência.
                    </p>
                    <textarea
                      defaultValue={briefing.team || ""}
                      onBlur={(e) => handleFieldChange("team", e.target.value)}
                      onInput={(e) => autoResize(e.currentTarget)}
                      ref={(el) => autoResize(el)}
                      rows={2}
                      placeholder="Descreva sua equipe, profissionais principais, experiência..."
                      className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[80px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                      <AwardIcon className="h-4 w-4" />
                      Certificações e Diferenciais Técnicos
                      <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Certificações, prêmios, diferenciais técnicos, tecnologias utilizadas.
                    </p>
                    <textarea
                      defaultValue={briefing.certifications || ""}
                      onBlur={(e) => handleFieldChange("certifications", e.target.value)}
                      onInput={(e) => autoResize(e.currentTarget)}
                      ref={(el) => autoResize(el)}
                      rows={2}
                      placeholder="Liste certificações, prêmios, tecnologias, diferenciais técnicos..."
                      className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[80px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                    <HelpCircle className="h-4 w-4" />
                    Perguntas Frequentes (FAQ)
                    <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Perguntas e respostas comuns dos clientes. Formato: Pergunta - Resposta (uma por linha).
                  </p>
                  <textarea
                    defaultValue={briefing.faq || ""}
                    onBlur={(e) => handleFieldChange("faq", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    ref={(el) => autoResize(el)}
                    rows={3}
                    placeholder={"P: Qual o prazo de entrega?\nR: O prazo varia conforme o projeto...\n\nP: Como funciona o pagamento?\nR: Aceitamos diversas formas..."}
                    className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all resize-none overflow-hidden hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Chamadas para Ação */}
        <AccordionItem value="ctas" className="border-0">
          <Card className="p-6 glow-border border-orange-200/50">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Chamadas para Ação (CTAs)
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-left">
                  Textos dos botões que guiarão os visitantes.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-5 pb-0">
              <div className="grid md:grid-cols-3 gap-5">
                <EditableField label="CTA Principal" field="ctaPrimary" value={briefing.ctaPrimary} />
                <EditableField label="CTA Secundário" field="ctaSecondary" value={briefing.ctaSecondary} />
                <EditableField label="CTA Alternativo" field="ctaAlternative" value={briefing.ctaAlternative} />
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-5 w-5" />
            Baixar PDF
          </Button>
          <Button size="lg" onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Aprovar e Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
