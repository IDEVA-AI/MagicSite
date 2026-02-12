"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { jsPDF } from "jspdf"
import { Progress } from "@/components/ui/progress"

const downloadBriefingPdf = (briefing: any) => {
  if (typeof window === "undefined") return

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

export function BriefingReview({ onNext, onBack, initialData }: BriefingReviewProps) {
  const hasExistingBriefing = initialData?.briefing && Object.keys(initialData.briefing).length > 0

  const [isGenerating, setIsGenerating] = useState(!hasExistingBriefing)
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

  const [briefing, setBriefing] = useState(hasExistingBriefing ? initialData.briefing : generateBriefing())

  useEffect(() => {
    if (hasExistingBriefing) return

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

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || "Não foi possível gerar o briefing.")
        }

        const data = await response.json()
        if (cancelled) return
        // Merge AI response with fallback defaults so missing fields get filled
        const aiBriefing = data.briefing || data
        setBriefing({ ...generateBriefing(), ...aiBriefing })
        setProgress(100)
      } catch (err: any) {
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
    setBriefing((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
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

    return (
      <div className="space-y-2">
        <label className={`text-sm font-semibold flex items-center gap-2 ${colorClass}`}>
          {Icon}
          {friendlyLabel}
        </label>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFieldChange(field, e.currentTarget.textContent || "")}
          onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
          className={`
            w-full rounded-md border border-border/40 bg-background/50 px-3 py-2
            text-sm transition-all cursor-text
            hover:bg-primary/5 hover:border-primary/30
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
            ${multiline ? "min-h-[50px]" : "min-h-[40px]"}
          `}
        >
          {value}
        </div>
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

      <div className="space-y-5">
        {/* Core Business */}
        <Card className="p-6 space-y-5 glow-border border-cyan-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-600">
            <Briefcase className="h-5 w-5 text-cyan-600" />
            Sobre Seu Negócio
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            O que você faz, para quem e o que te diferencia. Esses são os dados mais importantes.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <EditableField label="O que eu ofereço" field="offering" value={briefing.offering} multiline />
            <EditableField label="Setor de Atuação" field="sector" value={briefing.sector} multiline />
            <EditableField
              label="Diferencial Competitivo"
              field="differential"
              value={briefing.differential}
              multiline
            />
            <EditableField label="Público-Alvo" field="targetAudience" value={briefing.targetAudience} multiline />
            <EditableField
              label="Desafios do Público"
              field="audienceChallenges"
              value={briefing.audienceChallenges}
              multiline
            />
            <EditableField
              label="Aspirações do Público"
              field="audienceAspirations"
              value={briefing.audienceAspirations}
              multiline
            />
          </div>
        </Card>

        {/* Branding */}
        <Card className="p-6 space-y-5 glow-border border-orange-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
            <Palette className="h-5 w-5 text-orange-600" />
            Identidade da Sua Marca
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Como sua marca se comunica, o que valoriza e como entrega seus serviços.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <EditableField label="Tom de Voz" field="toneOfVoice" value={briefing.toneOfVoice} multiline />
            <EditableField
              label="Objetivo Estratégico"
              field="strategicObjective"
              value={briefing.strategicObjective}
              multiline
            />
            <EditableField
              label="Filosofia Central"
              field="corePhilosophy"
              value={briefing.corePhilosophy}
              multiline
            />
            <EditableField label="Modelo de Entrega" field="deliveryModel" value={briefing.deliveryModel} multiline />
            <EditableField label="Prova Social" field="socialProof" value={briefing.socialProof} multiline />
            <EditableField
              label="Valores Inegociáveis"
              field="nonNegotiableValues"
              value={briefing.nonNegotiableValues}
              multiline
            />
          </div>
        </Card>

        {/* Marketing */}
        <Card className="p-6 space-y-5 glow-border border-indigo-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
            <Megaphone className="h-5 w-5 text-indigo-600" />
            Estratégia de Vendas
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Como está o mercado, o que você promete ao cliente e o que pode impedir a compra.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <EditableField label="Contexto de Mercado" field="marketContext" value={briefing.marketContext} multiline />
            <EditableField label="Promessa Final" field="finalPromise" value={briefing.finalPromise} multiline />
            <EditableField
              label="Objeções Comuns"
              field="commonObjections"
              value={briefing.commonObjections}
              multiline
            />
            <EditableField label="Emoção Desejada" field="desiredEmotion" value={briefing.desiredEmotion} multiline />
            <EditableField
              label="Serviço Adicional"
              field="additionalService"
              value={briefing.additionalService}
              multiline
            />
            <EditableField label="Investimento Médio" field="averageTicket" value={briefing.averageTicket} multiline />
          </div>
        </Card>

        {/* Paleta de Cores */}
        <Card className="p-6 space-y-5 glow-border border-rose-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-rose-600">
            <Palette className="h-5 w-5 text-rose-600" />
            Paleta de Cores
          </h3>

          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-semibold text-foreground mb-2">
              Como cada cor é utilizada no site gerado:
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground space-y-1.5">
              <p>
                <strong className="text-foreground">Cor Primária:</strong> Utilizada nos botões principais (CTAs), links importantes, 
                destaques de navegação, títulos principais e elementos de destaque que precisam chamar atenção.
              </p>
              <p>
                <strong className="text-foreground">Cor Secundária:</strong> Usada em botões secundários, elementos complementares, 
                hover states, badges, e para criar contraste visual com a cor primária.
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
                  <SelectItem value="light" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Claro (Light)</span>
                  </SelectItem>
                  <SelectItem value="dark" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Escuro (Dark)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Informações de Contato */}
        <Card className="p-6 space-y-5 glow-border border-emerald-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600">
            <Phone className="h-5 w-5 text-emerald-600" />
            Informações de Contato
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Dados de contato que serão utilizados no site gerado.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Primeira linha: 3 campos */}
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
            {/* Segunda linha: Instagram e Horário */}
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
        </Card>

        {/* Contexto Adicional */}
        <Card className="p-6 space-y-5 glow-border border-blue-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Contexto Adicional
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Informações complementares que enriquecerão o conteúdo do site gerado. Estes dados serão incluídos no PDF de contexto e no prompt para a IA desenvolvedora.
          </p>

          <div className="space-y-5">
            {/* Serviços/Produtos */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                <List className="h-4 w-4" />
                Serviços/Produtos Detalhados *
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Liste todos os serviços ou produtos oferecidos, com descrições breves. Use uma linha por serviço ou organize em categorias.
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldChange("services", e.currentTarget.textContent || "")}
                onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                onFocus={(e) => {
                  if (!e.currentTarget.textContent?.trim()) {
                    e.currentTarget.textContent = ""
                  }
                }}
                className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[120px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
                data-placeholder="Ex: Consultoria Empresarial - Análise estratégica e planejamento...&#10;Gestão de Projetos - Acompanhamento e execução...&#10;Treinamento - Capacitação de equipes..."
              >
                {briefing.services || ""}
              </div>
            </div>

            {/* História da Marca */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                <BookOpen className="h-4 w-4" />
                História da Marca
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Como a empresa começou, missão, visão, valores e o que torna a marca única. (Opcional mas recomendado)
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldChange("brandHistory", e.currentTarget.textContent || "")}
                onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                data-placeholder="Conte a história da sua marca, quando começou, qual foi a motivação, missão e valores..."
              >
                {briefing.brandHistory || ""}
              </div>
            </div>

            {/* Processo de Trabalho */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                <Settings className="h-4 w-4" />
                Processo de Trabalho
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Como funciona o atendimento, etapas do processo, metodologia utilizada. (Opcional mas recomendado)
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldChange("workProcess", e.currentTarget.textContent || "")}
                onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                data-placeholder="Descreva como funciona seu processo: etapas, metodologia, tempo de entrega..."
              >
                {briefing.workProcess || ""}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Equipe */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                  <Users className="h-4 w-4" />
                  Equipe
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Informações sobre a equipe, profissionais principais, experiência. (Opcional)
                </p>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange("team", e.currentTarget.textContent || "")}
                  onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                  className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[80px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  data-placeholder="Descreva sua equipe, profissionais principais, experiência..."
                >
                  {briefing.team || ""}
                </div>
              </div>

              {/* Certificações */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                  <AwardIcon className="h-4 w-4" />
                  Certificações e Diferenciais Técnicos
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Certificações, prêmios, diferenciais técnicos, tecnologias utilizadas. (Opcional)
                </p>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange("certifications", e.currentTarget.textContent || "")}
                  onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                  className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[80px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  data-placeholder="Liste certificações, prêmios, tecnologias, diferenciais técnicos..."
                >
                  {briefing.certifications || ""}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                <HelpCircle className="h-4 w-4" />
                Perguntas Frequentes (FAQ)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Perguntas e respostas comuns dos clientes. Formato: Pergunta - Resposta (uma por linha). (Opcional)
              </p>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldChange("faq", e.currentTarget.textContent || "")}
                onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text) }}
                className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm min-h-[100px] transition-all cursor-text hover:bg-primary/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                data-placeholder="P: Qual o prazo de entrega?&#10;R: O prazo varia conforme o projeto...&#10;&#10;P: Como funciona o pagamento?&#10;R: Aceitamos diversas formas..."
              >
                {briefing.faq || ""}
              </div>
            </div>
          </div>
        </Card>

        {/* Chamadas para Ação */}
        <Card className="p-6 space-y-5 glow-border border-orange-200/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            Chamadas para Ação (CTAs)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Textos dos botões e links de ação que guiarão os visitantes do site.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            <EditableField label="CTA Principal" field="ctaPrimary" value={briefing.ctaPrimary} />
            <EditableField label="CTA Secundário" field="ctaSecondary" value={briefing.ctaSecondary} />
            <EditableField label="CTA Alternativo" field="ctaAlternative" value={briefing.ctaAlternative} />
          </div>
        </Card>
      </div>

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
