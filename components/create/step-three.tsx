"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Sparkles, Layout, MessageSquare, Award, Users, Phone } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(!hasExistingWireframe)
  const [sections, setSections] = useState<WireframeSection[]>(hasExistingWireframe ? initialData.wireframe : [])

  useEffect(() => {
    if (hasExistingWireframe) {
      return
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsGenerating(false)
          generateWireframe()
          return 100
        }
        return prev + 10
      })
    }, 200)

    return () => clearInterval(timer)
  }, [hasExistingWireframe])

  const generateWireframe = () => {
    setSections([
      {
        id: "hero",
        title: "Hero Section",
        icon: Layout,
        layout: "full",
        instructions:
          "Título impactante destacando a proposta de valor principal. Subtítulo explicando como você resolve o problema do cliente. CTA primário visível (ex: 'Fale com Especialista'). Imagem ou vídeo de destaque mostrando o serviço/produto em ação.",
      },
      {
        id: "about",
        title: "Sobre Nós",
        icon: Users,
        layout: "split",
        instructions:
          "História da empresa em 2-3 parágrafos curtos. Missão e valores que conectam emocionalmente. Números de impacto (anos de experiência, clientes atendidos). Foto da equipe ou fundador para humanizar a marca.",
      },
      {
        id: "services",
        title: "Serviços e Soluções",
        icon: Award,
        layout: "grid",
        instructions:
          "3-6 cards com principais serviços/produtos. Cada card com ícone, título, descrição curta (2-3 linhas). Foco nos benefícios, não apenas features. Link para 'Saiba Mais' em cada serviço.",
      },
      {
        id: "differentials",
        title: "Diferenciais Competitivos",
        icon: Sparkles,
        layout: "grid",
        instructions:
          "4-6 diferenciais únicos que te destacam da concorrência. Ícones representativos para cada diferencial. Textos curtos e diretos (1-2 linhas cada). Usar dados concretos quando possível (ex: '98% de satisfação').",
      },
      {
        id: "testimonials",
        title: "Depoimentos e Prova Social",
        icon: MessageSquare,
        layout: "grid",
        instructions:
          "3-6 depoimentos reais de clientes satisfeitos. Incluir nome, cargo/empresa e foto do cliente. Destacar resultados específicos alcançados. Adicionar logos de empresas parceiras se aplicável.",
      },
      {
        id: "cta",
        title: "Call-to-Action Final",
        icon: Phone,
        layout: "full",
        instructions:
          "Seção de conversão com fundo destacado. Título persuasivo reforçando o benefício principal. Formulário simples (nome, email, telefone) ou botão de WhatsApp. Garantia ou incentivo para ação imediata (ex: 'Consulta gratuita').",
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

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gerando Wireframe</h2>
          <p className="text-muted-foreground">IA está criando a estrutura do seu site com instruções detalhadas</p>
        </div>

        <Card className="p-8 bg-secondary/20">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold mb-2">Analisando briefing estratégico...</p>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% completo</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Wireframe do Site</h2>
        <p className="text-muted-foreground">
          Revise e edite as instruções de cada seção. Clique no texto para editar.
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
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleInstructionChange(section.id, e.currentTarget.textContent || "")}
                      className="text-sm leading-relaxed text-foreground/90 focus:outline-none focus:bg-background/50 focus:ring-2 focus:ring-primary/20 rounded p-2 hover:bg-background/30 transition-colors cursor-text"
                    >
                      {section.instructions}
                    </div>
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
