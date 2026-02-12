"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Copy, Download, CheckCircle2, FileText, Save } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { jsPDF } from "jspdf"

interface StepFourProps {
  onBack: () => void
  projectData?: any
}

export function StepFour({ onBack, projectData = {} }: StepFourProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const storageKey = "magicsite-projects"

  const resolvedDescription =
    projectData.detailedDescription ||
    projectData.businessDescription ||
    projectData.briefing?.offering ||
    projectData.description ||
    "Descrição não definida"

  const resolvedValueProposition =
    projectData.valueProposition || projectData.briefing?.finalPromise || "Proposta de valor não definida"

  const resolvedSiteObjective =
    projectData.siteObjective || projectData.briefing?.strategicObjective || "Objetivo não definido"

  const resolvedColors = {
    primary: projectData.briefing?.primaryColor || "#1D4ED8",
    secondary: projectData.briefing?.secondaryColor || "#ff8800",
    theme: projectData.briefing?.theme || "light",
  }

  const resolvedCtas = {
    primary: projectData.briefing?.ctaPrimary || "Entre em Contato",
    secondary: projectData.briefing?.ctaSecondary || "Saiba Mais",
    alternative: projectData.briefing?.ctaAlternative || "Fale Conosco",
  }

  const resolvedSegment =
    projectData.segmentKey === "outro"
      ? projectData.customSegment || projectData.segment || "Segmento não informado"
      : projectData.segment || projectData.customSegment || "Segmento não informado"

  const b = projectData.briefing || {}

  const generateCompletePrompt = () => {
    const wireframeSections = projectData.wireframe
      ?.map(
        (section: any, index: number) =>
          `### ${index + 1}. ${section.title}\n${section.instructions}`,
      )
      .join("\n\n") || "Estrutura não definida"

    const additionalSections = [
      b.services && `## SERVIÇOS/PRODUTOS DETALHADOS\n${b.services}`,
      b.brandHistory && `## HISTÓRIA DA MARCA\n${b.brandHistory}`,
      b.workProcess && `## PROCESSO DE TRABALHO\n${b.workProcess}`,
      b.team && `## EQUIPE\n${b.team}`,
      b.certifications && `## CERTIFICAÇÕES E DIFERENCIAIS TÉCNICOS\n${b.certifications}`,
      b.faq && `## PERGUNTAS FREQUENTES (FAQ)\n${b.faq}`,
    ].filter(Boolean).join("\n\n")

    return `Crie um site profissional completo usando React + Tailwind CSS para ${projectData.businessName || "meu negócio"}.

## IDENTIDADE DA MARCA
- Nome: ${projectData.businessName || "Não informado"}
- Segmento: ${resolvedSegment}
- Tom de voz: ${b.toneOfVoice || "Profissional e confiável"}
- Filosofia central: ${b.corePhilosophy || "Não definida"}
- Valores inegociáveis: ${b.nonNegotiableValues || "Não definidos"}

## PROPOSTA DE VALOR
${resolvedValueProposition}

## DESCRIÇÃO DO NEGÓCIO
${resolvedDescription}

## OBJETIVO DO SITE
${resolvedSiteObjective}

## PÚBLICO-ALVO
- Perfil: ${b.targetAudience || "Não definido"}
- Desafios que enfrentam: ${b.audienceChallenges || "Não definidos"}
- Aspirações: ${b.audienceAspirations || "Não definidas"}

## POSICIONAMENTO ESTRATÉGICO
- O que oferecemos: ${b.offering || "Não definido"}
- Diferencial competitivo: ${b.differential || "Não definido"}
- Objetivo estratégico: ${b.strategicObjective || "Não definido"}
- Promessa final: ${b.finalPromise || "Não definida"}
- Emoção desejada no visitante: ${b.desiredEmotion || "Confiança"}

## CONTEXTO COMERCIAL
- Contexto de mercado: ${b.marketContext || "Não definido"}
- Modelo de entrega: ${b.deliveryModel || "Não definido"}
- Prova social: ${b.socialProof || "Não definida"}
- Objeções comuns a superar no site: ${b.commonObjections || "Não definidas"}
- Serviço adicional: ${b.additionalService || "Não definido"}
- Ticket médio: ${b.averageTicket || "Sob consulta"}

## INFORMAÇÕES DE CONTATO
- WhatsApp: ${projectData.phone || "Não informado"}
- E-mail: ${projectData.email || "Não informado"}
- Endereço: ${projectData.address || "Não informado"}
- Instagram: ${projectData.instagram || "Não informado"}
- Horário de Funcionamento: ${projectData.businessHours || "Não informado"}

## ESTRUTURA DO SITE (WIREFRAME)
Crie as seguintes seções na ordem indicada:

${wireframeSections}

## DESIGN
- Cor Primária: ${resolvedColors.primary} (usar em CTAs, botões, links, destaques de navegação e títulos principais)
- Cor Secundária: ${resolvedColors.secondary} (usar em botões secundários, hover states, badges e complementos visuais)
- Tema: ${resolvedColors.theme === "dark" ? "Escuro (Dark)" : "Claro (Light)"}
- Tipografia: usar fonte sans-serif moderna e limpa, bold (700-900) para títulos, regular para corpo

## CHAMADAS PARA AÇÃO (CTAs)
- CTA Principal: "${resolvedCtas.primary}" (posicionar no hero e na seção final de conversão)
- CTA Secundário: "${resolvedCtas.secondary}" (posicionar nas seções intermediárias)
- CTA Alternativo: "${resolvedCtas.alternative}" (posicionar na navbar e footer)

${additionalSections}

## INSTRUÇÕES TÉCNICAS
Crie um site moderno, responsivo e profissional seguindo TODAS as diretrizes acima. O site deve:

1. Ser totalmente responsivo (mobile-first) com breakpoints para mobile, tablet e desktop
2. Ter performance otimizada: lazy loading em imagens, semantic HTML, código minificado
3. Incluir TODAS as seções do wireframe na ordem especificada
4. Usar as cores primária e secundária conforme descrito na seção DESIGN
5. Incorporar todo o contexto adicional (serviços, história, processo, equipe, FAQ) de forma natural nas seções
6. Ter CTAs estratégicos posicionados conforme indicado (hero, seções, navbar, footer)
7. Incluir meta tags para SEO: title, description, Open Graph, headings hierárquicos (h1 > h2 > h3)
8. Seguir acessibilidade WCAG AA: contraste adequado, aria-labels, navegação por teclado, alt text em imagens
9. Tom de voz da copy: ${b.toneOfVoice || "profissional e confiável"} em TODO o texto do site
10. Incluir botão flutuante de WhatsApp no canto inferior direito
11. Usar placeholders descritivos para imagens (ex: "foto profissional mostrando o serviço em ação")
12. Adicionar animações sutis: fade-in nas seções ao scroll, hover effects nos cards e botões`
  }


  const generateContextFile = () => {
    const context = {
      businessInfo: {
        name: projectData.businessName,
        phone: projectData.phone,
        address: projectData.address,
        segment: resolvedSegment,
        segmentKey: projectData.segmentKey,
        description: projectData.description,
      },
      strategy: {
        valueProposition: resolvedValueProposition,
        businessDescription: resolvedDescription,
        siteObjective: resolvedSiteObjective,
      },
      briefing: projectData.briefing || {},
      wireframe: projectData.wireframe || [],
      design: {
        colors: {
          primary: resolvedColors.primary,
          secondary: resolvedColors.secondary,
          theme: resolvedColors.theme,
        },
        ctas: {
          primary: resolvedCtas.primary,
          secondary: resolvedCtas.secondary,
          alternative: resolvedCtas.alternative,
        },
      },
      additionalContext: {
        services: projectData.briefing?.services || "",
        brandHistory: projectData.briefing?.brandHistory || "",
        workProcess: projectData.briefing?.workProcess || "",
        team: projectData.briefing?.team || "",
        certifications: projectData.briefing?.certifications || "",
        faq: projectData.briefing?.faq || "",
      },
    }

    return JSON.stringify(context, null, 2)
  }

  const handleCopy = () => {
    const prompt = generateCompletePrompt()
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadContext = () => {
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

    const addSubsection = (title: string) => {
      yPosition += 5
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage()
        yPosition = margin
      }
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin, yPosition)
      yPosition += 10
    }

    // Título
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("Contexto Completo do Projeto", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Informações do Negócio
    addSubsection("INFORMAÇÕES DO NEGÓCIO")
    addSection("Nome da Empresa", projectData.businessName)
    addSection("Segmento", resolvedSegment)
    addSection("Localização", projectData.address)
    addSection("Telefone/WhatsApp", projectData.phone)
    addSection("E-mail", projectData.email)
    addSection("Instagram", projectData.instagram)
    addSection("Horário de Funcionamento", projectData.businessHours)
    addSection("Descrição Inicial", projectData.description)

    // Estratégia
    addSubsection("ESTRATÉGIA")
    addSection("Proposta de Valor", resolvedValueProposition)
    addSection("Descrição Detalhada do Negócio", resolvedDescription)
    addSection("Objetivo do Site", resolvedSiteObjective)

    // Briefing Estratégico
    addSubsection("BRIEFING ESTRATÉGICO")
    const briefing = projectData.briefing || {}
    addSection("O que oferecemos", briefing.offering)
    addSection("Setor de Atuação", briefing.sector)
    addSection("Diferencial Competitivo", briefing.differential)
    addSection("Público-Alvo", briefing.targetAudience)
    addSection("Desafios do Público", briefing.audienceChallenges)
    addSection("Aspirações do Público", briefing.audienceAspirations)
    addSection("Tom de Voz", briefing.toneOfVoice)
    addSection("Objetivo Estratégico", briefing.strategicObjective)
    addSection("Filosofia Central", briefing.corePhilosophy)
    addSection("Modelo de Entrega", briefing.deliveryModel)
    addSection("Prova Social", briefing.socialProof)
    addSection("Valores Inegociáveis", briefing.nonNegotiableValues)
    addSection("Contexto de Mercado", briefing.marketContext)
    addSection("Promessa Final", briefing.finalPromise)
    addSection("Objeções Comuns", briefing.commonObjections)
    addSection("Emoção Desejada", briefing.desiredEmotion)
    addSection("Serviço Adicional", briefing.additionalService)
    addSection("Ticket Médio", briefing.averageTicket)
    addSection("CTA Principal", briefing.ctaPrimary)
    addSection("CTA Secundário", briefing.ctaSecondary)
    addSection("CTA Alternativo", briefing.ctaAlternative)
    addSection(
      "Cores e Tema",
      `Primária: ${resolvedColors.primary}, Secundária: ${resolvedColors.secondary}, Tema: ${resolvedColors.theme === "dark" ? "Escuro" : "Claro"}`
    )

    // Contexto Adicional
    addSubsection("CONTEXTO ADICIONAL")
    addSection("Serviços/Produtos Detalhados", briefing.services)
    addSection("História da Marca", briefing.brandHistory)
    addSection("Processo de Trabalho", briefing.workProcess)
    addSection("Equipe", briefing.team)
    addSection("Certificações e Diferenciais Técnicos", briefing.certifications)
    addSection("Perguntas Frequentes (FAQ)", briefing.faq)

    // Wireframe
    if (projectData.wireframe && projectData.wireframe.length > 0) {
      addSubsection("ESTRUTURA DO SITE (WIREFRAME)")
      projectData.wireframe.forEach((section: any, index: number) => {
        addSection(`${index + 1}. ${section.title}`, section.instructions)
      })
    }

    // Prompt Completo
    addSubsection("PROMPT COMPLETO PARA IA")
    const prompt = generateCompletePrompt()
    addSection("Instruções para Desenvolvimento", prompt)

    // Download
    const pdfBuffer = doc.output("arraybuffer")
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" })
    const url = URL.createObjectURL(pdfBlob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${projectData.businessName || "projeto"}-contexto-completo.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const handleSaveProject = async () => {
    try {
      setSaved(false)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Save to local storage as backup if not logged in
        const savedProjects = JSON.parse(localStorage.getItem(storageKey) || "[]")
        const newProject = {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          name: projectData.businessName || "Projeto sem nome",
          segment: resolvedSegment,
          status: "completed",
          phase: 4,
          createdAt: new Date().toISOString(),
          creditsUsed: 20,
          data: {
            ...projectData,
            valueProposition: resolvedValueProposition,
            detailedDescription: resolvedDescription,
            siteObjective: resolvedSiteObjective,
            colors: resolvedColors,
            ctas: resolvedCtas,
          },
        }
        localStorage.setItem(storageKey, JSON.stringify([newProject, ...savedProjects]))

        // Redirect to login
        router.push(`/login?redirect=/app/projects/new/wizard`)
        return
      }

      // Se já existe um projeto (vindo da visualização), atualizar ao invés de criar
      if (projectData.id) {
        // Atualizar projeto existente
        const { error: projectError } = await supabase
          .from("projects")
          .update({
            name: projectData.businessName || "Projeto Novo",
            company_name: projectData.businessName || "Empresa",
            segment: resolvedSegment,
            custom_segment_name: projectData.customSegment,
            location: projectData.address || "Não informado",
            email: projectData.email || user.email || "email@naoinformado.com",
            whatsapp: projectData.phone || "",
            instagram: projectData.instagram || null,
            business_hours: projectData.businessHours || null,
            business_description: resolvedDescription,
            business_proposal: resolvedValueProposition,
            site_objectives: resolvedSiteObjective,
            status: "briefing_complete"
          })
          .eq("id", projectData.id)

        if (projectError) throw projectError

        // Atualizar briefing existente
        const { error: briefingError } = await supabase
          .from("briefings")
          .update({
            strategic_variables_json: {
              ...projectData.briefing,
              colors: resolvedColors,
              ctas: resolvedCtas,
              wireframe: projectData.wireframe
            },
            final_promise: resolvedValueProposition,
            strategic_objective: resolvedSiteObjective
          })
          .eq("project_id", projectData.id)

        if (briefingError) throw briefingError
      } else {
        // Criar novo projeto
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: projectData.businessName || "Projeto Novo",
            company_name: projectData.businessName || "Empresa",
            segment: resolvedSegment,
            custom_segment_name: projectData.customSegment,
            location: projectData.address || "Não informado",
            email: projectData.email || user.email || "email@naoinformado.com",
            whatsapp: projectData.phone || "",
            instagram: projectData.instagram || null,
            business_hours: projectData.businessHours || null,
            site_type: "servicos",
            business_description: resolvedDescription,
            business_proposal: resolvedValueProposition,
            site_objectives: resolvedSiteObjective,
            status: "briefing_complete"
          })
          .select()
          .single()

        if (projectError) throw projectError

        // Criar briefing
        const { error: briefingError } = await supabase
          .from("briefings")
          .insert({
            project_id: project.id,
            strategic_variables_json: {
              ...projectData.briefing,
              colors: resolvedColors,
              ctas: resolvedCtas,
              wireframe: projectData.wireframe
            },
            final_promise: resolvedValueProposition,
            strategic_objective: resolvedSiteObjective
          })

        if (briefingError) throw briefingError
      }

      setSaved(true)
      setTimeout(() => {
        router.push("/app")
      }, 1000)

    } catch (error) {
      console.error("Error saving project:", error)
      alert("Erro ao salvar projeto. Tente novamente.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_oklch,_var(--chart-3)_20%,_transparent)] mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8" style={{ color: "var(--chart-3)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Análise Concluída!</h2>
        <p className="text-muted-foreground">
          Seu briefing estratégico está pronto. Copie o prompt para usar em plataformas como v0 ou Lovable.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompt Completo para IA
            </h3>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/30 p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">{generateCompletePrompt()}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Este prompt contém todo o contexto necessário em um único texto. Ideal para copiar e colar diretamente em plataformas como v0, Lovable ou ChatGPT.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Button onClick={handleCopy} className="w-full" size="lg">
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  Copiar Prompt
                </>
              )}
            </Button>
            <Button onClick={handleDownloadContext} variant="outline" className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Baixar Contexto Completo (PDF)
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Salvar Projeto</h3>
            <p className="text-sm text-muted-foreground">
              Salve este projeto para acessá-lo posteriormente e fazer alterações
            </p>
          </div>
          <Button onClick={handleSaveProject} size="lg" className="gap-2">
            {saved ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Salvar Projeto
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
      </div>
    </div>
  )
}
