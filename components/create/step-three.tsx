"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Sparkles, Layout, MessageSquare, Award, Users, Phone } from "lucide-react"

const autoResize = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

interface StepThreeProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

interface WireframeSection {
  id: string
  title: string
  icon: any
  instructions: string
  layout: "full" | "split" | "grid"
}

export function StepThree({ onNext, onBack, initialData }: StepThreeProps) {
  const hasExistingWireframe = initialData?.wireframe && initialData.wireframe.length > 0

  const [sections, setSections] = useState<WireframeSection[]>(hasExistingWireframe ? initialData.wireframe : [])

  useEffect(() => {
    if (hasExistingWireframe) return
    generateWireframe()
  }, [hasExistingWireframe])

  const generateWireframe = () => {
    const briefing = initialData?.briefing || {}
    const businessName = initialData?.businessName || "seu negócio"
    const segment = initialData?.customSegment || initialData?.segment || "seu segmento"
    const ctaPrimary = briefing.ctaPrimary || "Fale com Especialista"
    const ctaSecondary = briefing.ctaSecondary || "Saiba Mais"
    const offering = briefing.offering || `serviços de ${segment}`
    const differential = briefing.differential || "atendimento personalizado"
    const targetAudience = briefing.targetAudience || "seu público-alvo"
    const toneOfVoice = briefing.toneOfVoice || "profissional e confiável"
    const finalPromise = briefing.finalPromise || "resultados excepcionais"
    const socialProof = briefing.socialProof || "clientes satisfeitos"
    const primaryColor = briefing.primaryColor || "#1D4ED8"
    const secondaryColor = briefing.secondaryColor || "#ff8800"

    setSections([
      {
        id: "hero",
        title: "Hero Section",
        icon: Layout,
        layout: "full",
        instructions:
          `Título impactante para ${businessName} destacando: "${finalPromise}". Subtítulo explicando como ajudamos ${targetAudience}. Botão CTA principal: "${ctaPrimary}" com cor ${primaryColor}. Imagem de destaque: foto profissional representando ${segment} em ação. Tom: ${toneOfVoice}.`,
      },
      {
        id: "about",
        title: "Sobre Nós",
        icon: Users,
        layout: "split",
        instructions:
          `História de ${businessName} em 2-3 parágrafos curtos, focando na jornada e motivação. Missão: ${briefing.corePhilosophy || "qualidade e compromisso"}. Destacar o diferencial: ${differential}. Números de impacto (anos de experiência, clientes atendidos). Foto da equipe ou fundador. Tom: ${toneOfVoice}.`,
      },
      {
        id: "services",
        title: "Serviços e Soluções",
        icon: Award,
        layout: "grid",
        instructions:
          `3-6 cards detalhando: ${offering}. Cada card com ícone representativo, título do serviço, descrição de 2-3 linhas focando nos benefícios para ${targetAudience}. Botão "${ctaSecondary}" em cada card com cor ${secondaryColor}. Destacar como cada serviço resolve os desafios: ${briefing.audienceChallenges || "do público"}.`,
      },
      {
        id: "differentials",
        title: "Diferenciais Competitivos",
        icon: Sparkles,
        layout: "grid",
        instructions:
          `4-6 diferenciais de ${businessName}: incluir "${differential}" como principal. Ícones representativos para cada diferencial. Textos curtos (1-2 linhas). Superar objeções comuns: ${briefing.commonObjections || "preocupações do público"}. Usar dados concretos quando possível.`,
      },
      {
        id: "testimonials",
        title: "Depoimentos e Prova Social",
        icon: MessageSquare,
        layout: "grid",
        instructions:
          `3-6 depoimentos de ${targetAudience} satisfeitos. Incluir nome, cargo/empresa e foto. Destacar resultados alcançados e a emoção: ${briefing.desiredEmotion || "confiança e segurança"}. Reforçar: ${socialProof}. Adicionar logos de parceiros se aplicável.`,
      },
      {
        id: "cta",
        title: "Call-to-Action Final",
        icon: Phone,
        layout: "full",
        instructions:
          `Seção de conversão com fundo em ${primaryColor}. Título: reforçar "${finalPromise}" para ${targetAudience}. Botão principal: "${ctaPrimary}". Incluir botão de WhatsApp: ${initialData?.phone || "número"}. Superar objeção final: ${briefing.commonObjections || "incentivo para ação imediata"}.`,
      },
    ])
  }

  const handleInstructionChange = (sectionId: string, newInstructions: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, instructions: newInstructions } : section)),
    )
  }

  const handleNext = () => {
    onNext({ wireframe: sections })
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Organizando a Estrutura do Site</h2>
          <p className="text-muted-foreground">Montando as seções com base no seu briefing...</p>
        </div>
        <Card className="p-8 bg-secondary/20">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">Preparando seções...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estrutura do Seu Site</h2>
        <p className="text-muted-foreground">
          Estas são as seções que o seu site terá. Clique no texto de qualquer seção para ajustar as instruções.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <Card key={section.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Layout:{" "}
                      {section.layout === "full" ? "Largura Total" : section.layout === "split" ? "Dividido" : "Grade"}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                    Seção {index + 1}
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 ${
                      section.layout === "full"
                        ? "min-h-[120px]"
                        : section.layout === "split"
                          ? "min-h-[100px]"
                          : "min-h-[80px]"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Instruções da IA</p>
                    </div>
                    <textarea
                      defaultValue={section.instructions}
                      onBlur={(e) => handleInstructionChange(section.id, e.target.value)}
                      onInput={(e) => autoResize(e.currentTarget)}
                      ref={(el) => autoResize(el)}
                      rows={3}
                      className="w-full text-sm leading-relaxed text-foreground/90 bg-transparent focus:outline-none focus:bg-background/50 focus:ring-2 focus:ring-primary/20 rounded p-2 hover:bg-background/30 transition-colors resize-none overflow-hidden"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button size="lg" onClick={handleNext}>
          Continuar para Download
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
