"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Sparkles, Target, FileText, Globe, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { dispatchCreditsChanged } from "@/lib/credits-event"

const autoResize = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

interface StepTwoAnalysisProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData: any
}

export function StepTwoAnalysis({ onNext, onBack, initialData }: StepTwoAnalysisProps) {
  const segmentKey = initialData.segmentKey || initialData.segment
  const segmentName =
    segmentKey === "outro"
      ? initialData.customSegment || initialData.segment || "seu segmento"
      : initialData.segment || initialData.customSegment || "seu segmento"

  const hasExistingData = initialData.valueProposition && initialData.detailedDescription && initialData.siteObjective

  const [isGenerating, setIsGenerating] = useState(!hasExistingData)
  const [progress, setProgress] = useState(hasExistingData ? 100 : 0)
  const [currentPhase, setCurrentPhase] = useState("")
  const [isAiHelpingDescription, setIsAiHelpingDescription] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const buildAnalysisData = useCallback(
    (valuePropositionOverride?: string) => {
      const businessName = initialData.businessName || "seu negócio"

      const publicoMap: Record<string, string> = {
        consultoria: "empresários e gestores",
        advocacia: "pessoas e empresas",
        contabilidade: "empresas de todos os portes",
        fitness: "pessoas que buscam transformação física",
        saude: "pacientes que buscam bem-estar",
        educacao: "profissionais e estudantes",
        tecnologia: "empresas que buscam inovação",
        marketing: "negócios que querem crescer online",
        design: "marcas que precisam de identidade visual",
        petshop_veterinaria: "donos de pets que buscam cuidado e bem-estar para seus animais",
        automotivo: "proprietários de veículos que precisam de serviços automotivos",
        clinica: "pacientes que buscam cuidados de saúde especializados",
        barbearia: "homens que buscam cortes modernos e cuidados masculinos",
        estudio_beleza: "pessoas que buscam serviços de beleza e estética profissional",
      }

      const problemaMap: Record<string, string> = {
        consultoria: "dificuldade em crescer e estruturar seus negócios",
        advocacia: "problemas jurídicos complexos e falta de orientação especializada",
        contabilidade: "desorganização fiscal e falta de planejamento tributário",
        fitness: "falta de resultados e desmotivação com treinos",
        saude: "problemas de saúde e falta de acompanhamento adequado",
        educacao: "falta de qualificação e conhecimento atualizado",
        tecnologia: "processos manuais e falta de automação",
        marketing: "baixa visibilidade online e dificuldade em atrair clientes",
        design: "comunicação visual inconsistente e falta de profissionalismo",
        petshop_veterinaria: "dificuldade em encontrar serviços confiáveis e falta de informações claras sobre cuidados",
        automotivo: "dificuldade em encontrar oficinas confiáveis e falta de transparência nos serviços",
        clinica: "dificuldade em encontrar profissionais qualificados e falta de informações sobre tratamentos",
        barbearia: "dificuldade em encontrar profissionais que entendam o estilo desejado e falta de agendamento prático",
        estudio_beleza: "dificuldade em encontrar profissionais qualificados e falta de portfólio visual dos serviços",
      }

      const solucaoMap: Record<string, string> = {
        consultoria: "alcançar crescimento sustentável e estruturação empresarial",
        advocacia: "resolver suas questões legais com segurança e eficiência",
        contabilidade: "organizar suas finanças e otimizar sua carga tributária",
        fitness: "conquistar o corpo desejado com treinos personalizados",
        saude: "recuperar e manter sua saúde com tratamento especializado",
        educacao: "desenvolver competências e alcançar seus objetivos profissionais",
        tecnologia: "automatizar processos e aumentar produtividade",
        marketing: "aumentar vendas e construir presença digital forte",
        design: "criar identidade visual marcante e profissional",
        petshop_veterinaria: "oferecer cuidado completo e profissional para seus animais de estimação",
        automotivo: "manter seus veículos em perfeito estado com serviços de qualidade",
        clinica: "receber cuidados de saúde especializados e tratamentos eficazes",
        barbearia: "obter cortes modernos e cuidados masculinos que valorizam sua imagem",
        estudio_beleza: "realizar tratamentos de beleza e estética com profissionais qualificados",
      }

      const beneficioMap: Record<string, string> = {
        consultoria: "tenham um negócio mais lucrativo e organizado",
        advocacia: "tenham tranquilidade e segurança jurídica",
        contabilidade: "economizem impostos e tenham controle financeiro",
        fitness: "tenham mais saúde, energia e autoestima",
        saude: "vivam com mais qualidade de vida e bem-estar",
        educacao: "se destaquem no mercado de trabalho",
        tecnologia: "sejam mais competitivas e eficientes",
        marketing: "tenham fluxo constante de clientes qualificados",
        design: "se destaquem da concorrência e atraiam mais clientes",
        petshop_veterinaria: "tenham a tranquilidade de saber que seus pets estão bem cuidados",
        automotivo: "tenham veículos seguros e em perfeito funcionamento",
        clinica: "tenham saúde e bem-estar com tratamentos eficazes",
        barbearia: "tenham uma imagem renovada e autoconfiança",
        estudio_beleza: "tenham autoestima elevada e se sintam mais bonitos",
      }

      const objecaoMap: Record<string, string> = {
        consultoria: "comprometer o caixa ou perder tempo com soluções genéricas",
        advocacia: "gastar fortunas ou ter processos mal conduzidos",
        contabilidade: "pagar impostos desnecessários ou ter problemas com o fisco",
        fitness: "se machucar ou perder tempo com treinos ineficazes",
        saude: "gastar com tratamentos que não funcionam",
        educacao: "investir em cursos que não agregam valor real",
        tecnologia: "investir em soluções complexas e caras",
        marketing: "gastar com anúncios que não convertem",
        design: "pagar caro por trabalhos amadores",
        petshop_veterinaria: "colocar seus pets em risco ou gastar com serviços de baixa qualidade",
        automotivo: "ser enganado ou pagar por serviços desnecessários",
        clinica: "receber tratamentos inadequados ou gastar sem resultados",
        barbearia: "sair com corte ruim ou pagar caro por serviços amadores",
        estudio_beleza: "ter resultados ruins ou gastar com profissionais sem experiência",
      }

      const publico = publicoMap[segmentKey] || "pessoas e empresas"
      const problema = problemaMap[segmentKey] || "desafios em sua área"
      const solucao = solucaoMap[segmentKey] || "alcançar seus objetivos"
      const beneficio = beneficioMap[segmentKey] || "tenham melhores resultados"
      const objecao = objecaoMap[segmentKey] || "comprometer recursos ou tempo"

      const valueProposition =
        valuePropositionOverride ||
        `Eu ajudo ${publico} que sofrem com ${problema} a ${solucao}, para que possam ${beneficio}, sem que ${objecao}.`

      const transformacaoMap: Record<string, string> = {
        consultoria: "transforma negócios através de estratégias personalizadas e gestão eficiente",
        advocacia: "oferece soluções jurídicas completas com excelência e comprometimento",
        contabilidade: "proporciona gestão fiscal e financeira estratégica para empresas",
        fitness: "promove transformação física e mental através de treinos personalizados",
        saude: "oferece cuidado integral e tratamentos especializados para bem-estar",
        educacao: "desenvolve competências e conhecimento através de educação de qualidade",
        tecnologia: "impulsiona negócios através de soluções tecnológicas inovadoras",
        marketing: "acelera o crescimento de negócios através de estratégias digitais eficazes",
        design: "cria identidades visuais marcantes que conectam marcas com seu público",
        petshop_veterinaria: "oferece cuidado completo e especializado para animais de estimação",
        automotivo: "proporciona serviços automotivos de qualidade com transparência e confiança",
        clinica: "oferece cuidados de saúde especializados com excelência e humanização",
        barbearia: "proporciona cortes modernos e cuidados masculinos que valorizam a imagem",
        estudio_beleza: "oferece serviços de beleza e estética profissional com resultados excepcionais",
      }

      const propostaUnicaMap: Record<string, string> = {
        consultoria: "metodologia comprovada e acompanhamento próximo para resultados reais",
        advocacia: "atendimento humanizado aliado à expertise técnica e estratégica",
        contabilidade: "planejamento tributário inteligente e gestão financeira proativa",
        fitness: "treinos científicos personalizados com acompanhamento individual",
        saude: "abordagem integrativa com foco em prevenção e qualidade de vida",
        educacao: "metodologia prática com aplicação imediata no mercado de trabalho",
        tecnologia: "soluções escaláveis e suporte técnico especializado",
        marketing: "estratégias baseadas em dados com foco em ROI comprovado",
        design: "processo colaborativo que traduz essência da marca em design impactante",
        petshop_veterinaria: "atendimento especializado com amor pelos animais e infraestrutura completa",
        automotivo: "transparência total nos serviços e garantia de qualidade em cada atendimento",
        clinica: "equipe qualificada com tecnologia moderna e atendimento humanizado",
        barbearia: "estilo único com técnicas modernas e ambiente acolhedor",
        estudio_beleza: "portfólio comprovado com produtos de qualidade e técnicas atualizadas",
      }

      const doresMap: Record<string, string> = {
        consultoria: "falta de estrutura, processos desorganizados e dificuldade em escalar",
        advocacia: "insegurança jurídica, processos complexos e falta de orientação clara",
        contabilidade: "alta carga tributária, desorganização fiscal e risco de multas",
        fitness: "falta de resultados, desmotivação e medo de lesões",
        saude: "dores crônicas, falta de diagnóstico preciso e tratamentos ineficazes",
        educacao: "falta de qualificação, conhecimento desatualizado e dificuldade de aplicação prática",
        tecnologia: "processos manuais, baixa produtividade e falta de integração de sistemas",
        marketing: "baixa visibilidade, dificuldade em atrair clientes e desperdício de investimento",
        design: "identidade visual fraca, comunicação inconsistente e falta de profissionalismo",
        petshop_veterinaria: "dificuldade em encontrar serviços confiáveis, falta de informações claras e preocupação com a qualidade do atendimento",
        automotivo: "dificuldade em encontrar oficinas confiáveis, falta de transparência nos preços e medo de ser enganado",
        clinica: "dificuldade em encontrar profissionais qualificados, falta de informações sobre tratamentos e preocupação com a qualidade do atendimento",
        barbearia: "dificuldade em encontrar profissionais que entendam o estilo desejado, falta de agendamento prático e medo de sair com corte ruim",
        estudio_beleza: "dificuldade em encontrar profissionais qualificados, falta de portfólio visual e preocupação com resultados",
      }

      const transformacaoFinalMap: Record<string, string> = {
        consultoria: "ter um negócio estruturado, lucrativo e escalável",
        advocacia: "resolver suas questões legais com segurança e tranquilidade",
        contabilidade: "ter controle financeiro total e pagar menos impostos legalmente",
        fitness: "conquistar o corpo dos sonhos e ter mais saúde e energia",
        saude: "viver sem dores e com qualidade de vida plena",
        educacao: "se destacar profissionalmente e alcançar melhores oportunidades",
        tecnologia: "ter processos automatizados e equipe mais produtiva",
        marketing: "ter fluxo constante de clientes e vendas previsíveis",
        design: "ter marca forte que atrai e converte clientes ideais",
        petshop_veterinaria: "ter a tranquilidade de saber que seus pets estão bem cuidados e saudáveis",
        automotivo: "ter veículos seguros, em perfeito funcionamento e sem preocupações",
        clinica: "ter saúde e bem-estar com tratamentos eficazes e profissionais qualificados",
        barbearia: "ter uma imagem renovada, autoconfiança e estilo que valoriza sua personalidade",
        estudio_beleza: "ter autoestima elevada e se sentir mais bonito e confiante",
      }

      const estiloMap: Record<string, string> = {
        consultoria: "profissional, estratégico e orientado a resultados",
        advocacia: "sério, confiável e humanizado",
        contabilidade: "técnico, claro e consultivo",
        fitness: "motivador, energético e inspirador",
        saude: "acolhedor, empático e profissional",
        educacao: "didático, inspirador e prático",
        tecnologia: "inovador, técnico e objetivo",
        marketing: "dinâmico, persuasivo e orientado a dados",
        design: "criativo, sofisticado e autêntico",
        petshop_veterinaria: "acolhedor, confiável e dedicado ao bem-estar animal",
        automotivo: "transparente, confiável e orientado à qualidade",
        clinica: "profissional, acolhedor e focado no bem-estar",
        barbearia: "moderno, estiloso e descontraído",
        estudio_beleza: "elegante, profissional e inspirador",
      }

      const posicionamentoMap: Record<string, string> = {
        consultoria: "ser referência em consultoria empresarial na região",
        advocacia: "ser reconhecido pela excelência e confiabilidade jurídica",
        contabilidade: "ser a primeira escolha em gestão fiscal e financeira estratégica",
        fitness: "ser a academia mais completa e eficaz em transformação física",
        saude: "ser referência em cuidado integral e tratamentos especializados",
        educacao: "ser reconhecido pela qualidade de ensino e empregabilidade dos alunos",
        tecnologia: "ser parceiro estratégico em transformação digital",
        marketing: "ser a agência que mais gera resultados reais para clientes",
        design: "ser o estúdio mais criativo e estratégico da região",
        petshop_veterinaria: "ser referência em cuidado animal com infraestrutura completa e atendimento especializado",
        automotivo: "ser a oficina mais confiável e transparente da região",
        clinica: "ser referência em cuidados de saúde com equipe qualificada e tecnologia moderna",
        barbearia: "ser a barbearia mais moderna e estilosa da região",
        estudio_beleza: "ser o estúdio mais elegante e profissional em serviços de beleza",
      }

      const contextoMap: Record<string, string> = {
        consultoria: "crescente demanda por profissionalização e estruturação empresarial",
        advocacia: "aumento da complexidade jurídica e necessidade de especialização",
        contabilidade: "constantes mudanças tributárias e necessidade de planejamento estratégico",
        fitness: "crescimento da consciência sobre saúde e bem-estar",
        saude: "aumento da busca por qualidade de vida e medicina preventiva",
        educacao: "transformação digital e necessidade de atualização constante",
        tecnologia: "aceleração da transformação digital pós-pandemia",
        marketing: "migração massiva para o digital e competição acirrada online",
        design: "valorização da identidade visual como diferencial competitivo",
        petshop_veterinaria: "crescimento do mercado pet e aumento da preocupação com bem-estar animal",
        automotivo: "aumento da frota de veículos e necessidade de serviços de qualidade",
        clinica: "crescimento da busca por cuidados de saúde especializados e medicina preventiva",
        barbearia: "valorização da imagem pessoal e crescimento do mercado de cuidados masculinos",
        estudio_beleza: "crescimento da valorização da estética e busca por serviços profissionais de beleza",
      }

      const transformacao = transformacaoMap[segmentKey] || "oferece soluções especializadas"
      const propostaUnica = propostaUnicaMap[segmentKey] || "atendimento personalizado e resultados comprovados"
      const dores = doresMap[segmentKey] || "diversos desafios em sua área"
      const transformacaoFinal = transformacaoFinalMap[segmentKey] || "alcançar seus objetivos com sucesso"
      const estilo = estiloMap[segmentKey] || "profissional e confiável"
      const posicionamento = posicionamentoMap[segmentKey] || "ser referência em sua área de atuação"
      const contexto = contextoMap[segmentKey] || "crescente demanda por serviços especializados"

      const detailedDescription = `O meu negócio é ${segmentName} que ${transformacao}. Eu atuo no setor de ${segmentName}, e meu diferencial é ${propostaUnica}. Meu público-alvo são ${publico} que enfrentam ${dores}. Eles desejam ${transformacaoFinal}. A comunicação da minha marca é ${estilo}. O objetivo principal dela é ${posicionamento}. É importante considerar que o mercado está em ${contexto}, criando oportunidade de atuação estratégica.`

      const objetivoMap: Record<string, string> = {
        consultoria: `1) Posicionar a ${businessName} como referência em consultoria empresarial na região, destacando nossa metodologia comprovada e expertise em gestão estratégica, essenciais para o crescimento sustentável dos negócios. 2) Facilitar o contato direto via WhatsApp, permitindo que empresários solicitem diagnósticos e propostas de forma rápida e prática. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de transformar negócios e gerar resultados reais.`,
        advocacia: `1) Posicionar a ${businessName} como referência em serviços jurídicos especializados, destacando nossa expertise técnica e atendimento humanizado, essenciais para a segurança jurídica dos clientes. 2) Facilitar o contato direto via WhatsApp, permitindo que pessoas e empresas solicitem consultas e orientações de forma rápida e confidencial. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de resolver questões legais complexas com eficiência.`,
        contabilidade: `1) Posicionar a ${businessName} como referência em gestão fiscal e financeira estratégica, destacando nosso planejamento tributário inteligente e expertise contábil, essenciais para a saúde financeira das empresas. 2) Facilitar o contato direto via WhatsApp, permitindo que empresários solicitem consultorias e esclarecimentos de forma rápida e prática. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de reduzir custos e otimizar a gestão financeira.`,
        fitness: `1) Posicionar a ${businessName} como referência em transformação física e bem-estar, destacando nossos treinos personalizados e acompanhamento individual, essenciais para resultados reais e duradouros. 2) Facilitar o contato direto via WhatsApp, permitindo que interessados solicitem avaliações e planos de treino de forma rápida e prática. 3) Apresentar resultados concretos através de transformações e depoimentos de alunos satisfeitos, evidenciando nossa capacidade de promover mudanças reais na saúde e qualidade de vida.`,
        saude: `1) Posicionar a ${businessName} como referência em cuidado integral e tratamentos especializados, destacando nossa abordagem humanizada e expertise médica, essenciais para o bem-estar e qualidade de vida dos pacientes. 2) Facilitar o contato direto via WhatsApp, permitindo que pacientes agendem consultas e tirem dúvidas de forma rápida e acolhedora. 3) Apresentar resultados concretos através de casos de sucesso e depoimentos de pacientes satisfeitos, evidenciando nossa capacidade de promover saúde e bem-estar de forma eficaz.`,
        educacao: `1) Posicionar a ${businessName} como referência em educação de qualidade e desenvolvimento profissional, destacando nossa metodologia prática e corpo docente qualificado, essenciais para a empregabilidade e crescimento dos alunos. 2) Facilitar o contato direto via WhatsApp, permitindo que interessados solicitem informações sobre cursos e matrículas de forma rápida e prática. 3) Apresentar resultados concretos através de histórias de sucesso e depoimentos de alunos satisfeitos, evidenciando nossa capacidade de transformar carreiras e abrir oportunidades.`,
        tecnologia: `1) Posicionar a ${businessName} como referência em soluções tecnológicas inovadoras, destacando nossa expertise em transformação digital e suporte especializado, essenciais para a competitividade e eficiência das empresas. 2) Facilitar o contato direto via WhatsApp, permitindo que empresas solicitem consultorias e propostas de forma rápida e prática. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de automatizar processos e aumentar produtividade.`,
        marketing: `1) Posicionar a ${businessName} como referência em marketing digital e geração de resultados, destacando nossas estratégias baseadas em dados e foco em ROI, essenciais para o crescimento online dos negócios. 2) Facilitar o contato direto via WhatsApp, permitindo que empresas solicitem diagnósticos e propostas de forma rápida e prática. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de aumentar vendas e construir presença digital forte.`,
        design: `1) Posicionar a ${businessName} como referência em design estratégico e identidade visual, destacando nosso processo colaborativo e expertise criativa, essenciais para marcas que querem se destacar no mercado. 2) Facilitar o contato direto via WhatsApp, permitindo que empresas solicitem orçamentos e briefings de forma rápida e prática. 3) Apresentar resultados concretos através de portfólio e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de criar identidades visuais marcantes que conectam marcas com seu público.`,
        petshop_veterinaria: `1) Posicionar a ${businessName} como referência em cuidado animal com infraestrutura completa e atendimento especializado, destacando nosso amor pelos animais e expertise veterinária, essenciais para o bem-estar dos pets. 2) Facilitar o contato direto via WhatsApp, permitindo que donos de pets agendem consultas e tirem dúvidas de forma rápida e prática. 3) Apresentar resultados concretos através de casos de sucesso e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de oferecer cuidado completo e profissional.`,
        automotivo: `1) Posicionar a ${businessName} como referência em serviços automotivos com transparência total e qualidade garantida, destacando nossa expertise técnica e compromisso com a satisfação do cliente, essenciais para manter veículos em perfeito estado. 2) Facilitar o contato direto via WhatsApp, permitindo que proprietários de veículos solicitem orçamentos e agendem serviços de forma rápida e prática. 3) Apresentar resultados concretos através de serviços realizados e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de oferecer serviços confiáveis e transparentes.`,
        clinica: `1) Posicionar a ${businessName} como referência em cuidados de saúde especializados, destacando nossa equipe qualificada, tecnologia moderna e atendimento humanizado, essenciais para o bem-estar e qualidade de vida dos pacientes. 2) Facilitar o contato direto via WhatsApp, permitindo que pacientes agendem consultas e tirem dúvidas de forma rápida e acolhedora. 3) Apresentar resultados concretos através de casos de sucesso e depoimentos de pacientes satisfeitos, evidenciando nossa capacidade de oferecer tratamentos eficazes e profissionais.`,
        barbearia: `1) Posicionar a ${businessName} como referência em cortes modernos e cuidados masculinos, destacando nosso estilo único, técnicas atualizadas e ambiente acolhedor, essenciais para valorizar a imagem e autoconfiança dos clientes. 2) Facilitar o contato direto via WhatsApp, permitindo que clientes agendem horários e consultem disponibilidade de forma rápida e prática. 3) Apresentar resultados concretos através de portfólio de cortes e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de oferecer serviços estilosos e profissionais.`,
        estudio_beleza: `1) Posicionar a ${businessName} como referência em serviços de beleza e estética profissional, destacando nosso portfólio comprovado, produtos de qualidade e técnicas atualizadas, essenciais para elevar a autoestima e bem-estar dos clientes. 2) Facilitar o contato direto via WhatsApp, permitindo que clientes agendem serviços e consultem disponibilidade de forma rápida e prática. 3) Apresentar resultados concretos através de antes e depois e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de oferecer serviços elegantes e profissionais.`,
      }

      const siteObjective =
        objetivoMap[segmentKey] ||
        `1) Posicionar a ${businessName} como referência em ${segmentName}, destacando nosso atendimento personalizado e expertise especializada, essenciais para a satisfação e sucesso dos clientes. 2) Facilitar o contato direto via WhatsApp, permitindo que interessados solicitem informações e orçamentos de forma rápida e prática. 3) Apresentar resultados concretos através de cases e depoimentos de clientes satisfeitos, evidenciando nossa capacidade de oferecer soluções eficazes e de qualidade.`

      return {
        valueProposition,
        detailedDescription,
        siteObjective,
      }
    },
    [initialData.businessName, segmentKey, segmentName],
  )

  const [analysisData, setAnalysisData] = useState(() => ({
    valueProposition: initialData.valueProposition || "",
    detailedDescription: initialData.detailedDescription || "",
    siteObjective: initialData.siteObjective || "",
  }))

  useEffect(() => {
    if (hasExistingData) {
      return
    }

    let cancelled = false
    setIsGenerating(true)
    setProgress(12)
    setCurrentPhase("Iniciando análise com IA...")

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev
        return prev + 4
      })
    }, 600)

    const runAnalysis = async () => {
      let valueProposition = ""
      let strategicDeclaration = ""

      setCurrentPhase("Gerando proposta de valor e declaração estratégica...")

      const requestBody = {
        businessName: initialData.businessName,
        segment: segmentName,
        segmentKey: initialData.segmentKey,
        customSegment: initialData.customSegment,
        location: initialData.address,
        description: initialData.description,
        siteObjective: initialData.siteObjective,
      }

      // Run both API calls in parallel for speed
      const [vpResult, sdResult] = await Promise.allSettled([
        fetch("/api/agents/value-proposition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "include",
          body: JSON.stringify(requestBody),
        }).then(async (r) => {
          const p = await r.json().catch(() => null)
          if (!r.ok || !p?.valueProposition) throw new Error(p?.error || "Falha")
          return p.valueProposition as string
        }),
        fetch("/api/agents/strategic-declaration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "include",
          body: JSON.stringify({ ...requestBody, valueProposition: "" }),
        }).then(async (r) => {
          const p = await r.json().catch(() => null)
          if (!r.ok || !p?.declaration) throw new Error(p?.error || "Falha")
          return p.declaration as string
        }),
      ])

      if (cancelled) return
      setProgress(75)

      const fallback = buildAnalysisData()
      let usedFallback = false

      valueProposition = vpResult.status === "fulfilled" ? vpResult.value : fallback.valueProposition
      if (vpResult.status === "rejected") {
        console.error("Erro na proposta de valor", vpResult.reason)
        usedFallback = true
      }
      if (vpResult.status === "fulfilled" && vpResult.value) {
        dispatchCreditsChanged()
      }

      strategicDeclaration = sdResult.status === "fulfilled" ? sdResult.value : buildAnalysisData(valueProposition).detailedDescription
      if (sdResult.status === "rejected") {
        console.error("Erro na declaração estratégica", sdResult.reason)
        usedFallback = true
      }
      if (sdResult.status === "fulfilled" && sdResult.value) {
        dispatchCreditsChanged()
      }

      // Check for 402 (insufficient credits)
      const vpIs402 = vpResult.status === "rejected" && String(vpResult.reason).includes("402")
      const sdIs402 = sdResult.status === "rejected" && String(sdResult.reason).includes("402")
      if (vpIs402 || sdIs402) {
        toast.error("Créditos insuficientes para gerar a análise com IA.")
        dispatchCreditsChanged()
      }

      if (!cancelled) {
        if (usedFallback && !vpIs402 && !sdIs402) {
          setGenerationError("A IA não respondeu para alguns campos. Usamos dados padrão que você pode editar.")
          toast.warning("A IA não respondeu. Usamos dados padrão que você pode editar.")
        }

        const baseData = buildAnalysisData(valueProposition)
        setAnalysisData({
          ...baseData,
          valueProposition: valueProposition || baseData.valueProposition,
          detailedDescription: strategicDeclaration || baseData.detailedDescription,
        })
        setCurrentPhase("Análise concluída")
        setProgress(100)
        setIsGenerating(false)
        clearInterval(interval)
      }
    }

    runAnalysis()

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [
    buildAnalysisData,
    hasExistingData,
    initialData.address,
    initialData.businessName,
    initialData.customSegment,
    initialData.description,
    initialData.segmentKey,
    initialData.siteObjective,
    segmentName,
  ])

  const handleAiHelpDescription = async () => {
    setIsAiHelpingDescription(true)

    try {
      const response = await fetch("/api/agents/strategic-declaration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
        body: JSON.stringify({
          businessName: initialData.businessName,
          segment: segmentName,
          segmentKey: initialData.segmentKey,
          customSegment: initialData.customSegment,
          location: initialData.address,
          description: initialData.description,
          valueProposition: analysisData.valueProposition,
        }),
      })

      if (response.status === 402) {
        toast.error("Créditos insuficientes para gerar a descrição com IA.")
        dispatchCreditsChanged()
        return
      }

      const payload = await response.json().catch(() => null)
      if (response.ok && payload?.declaration) {
        setAnalysisData((prev: typeof analysisData) => ({ ...prev, detailedDescription: payload.declaration }))
        dispatchCreditsChanged()
      } else {
        const fallback = buildAnalysisData(analysisData.valueProposition)
        setAnalysisData((prev: typeof analysisData) => ({ ...prev, detailedDescription: fallback.detailedDescription }))
        toast.warning("A IA não respondeu. Usamos dados padrão que você pode editar.")
      }
    } catch (err) {
      console.error("Erro ao gerar descrição com IA", err)
      const fallback = buildAnalysisData(analysisData.valueProposition)
      setAnalysisData((prev: typeof analysisData) => ({ ...prev, detailedDescription: fallback.detailedDescription }))
      toast.warning("A IA não respondeu. Usamos dados padrão que você pode editar.")
    } finally {
      setIsAiHelpingDescription(false)
    }
  }

  const handleSubmit = () => {
    onNext(analysisData)
  }

  if (isGenerating) {
    return (
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black gradient-text">Análise Estratégica em Andamento</h2>
          <p className="text-muted-foreground font-medium">Nossa IA está processando as informações do seu negócio</p>
        </div>

        <div className="glow-border bg-background/50 backdrop-blur-sm p-12 rounded-lg space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>

            <div className="w-full max-w-md space-y-3">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm font-medium text-muted-foreground">{currentPhase}</p>
              <p className="text-center text-2xl font-bold text-primary">{progress}%</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-black gradient-text">Análise do Seu Negócio</h2>
        <p className="text-muted-foreground font-medium">
          A IA gerou essas informações com base nos seus dados. Clique em qualquer texto para ajustar.
        </p>
      </div>

      {generationError && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">{generationError}</p>
        </div>
      )}

      <div className="space-y-5">
        {/* Value Proposition */}
        <div className="glow-border bg-background/50 backdrop-blur-sm p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base">Como você ajuda seus clientes?</h3>
              <p className="text-xs text-muted-foreground">Resumo do valor que seu negócio entrega</p>
            </div>
          </div>

          <textarea
            defaultValue={analysisData.valueProposition}
            onBlur={(e) => setAnalysisData((prev) => ({ ...prev, valueProposition: e.target.value }))}
            onInput={(e) => autoResize(e.currentTarget)}
            ref={(el) => autoResize(el)}
            rows={2}
            className="w-full text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:bg-muted/70 transition-colors resize-none overflow-hidden"
          />
        </div>

        {/* Detailed Description */}
        <div className="glow-border bg-background/50 backdrop-blur-sm p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-base">Descrição Completa do Negócio</h3>
                <p className="text-xs text-muted-foreground">Contexto detalhado sobre o que sua empresa faz e como atua</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiHelpDescription}
              disabled={isAiHelpingDescription}
              className="h-8 px-3 font-mono font-bold text-xs bg-primary/20 text-primary border-2 border-primary/60 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50"
            >
              {isAiHelpingDescription ? (
                <>
                  <Sparkles className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  AJUDA.AI
                </>
              )}
            </Button>
          </div>

          <textarea
            defaultValue={analysisData.detailedDescription}
            onBlur={(e) => setAnalysisData((prev) => ({ ...prev, detailedDescription: e.target.value }))}
            onInput={(e) => autoResize(e.currentTarget)}
            ref={(el) => autoResize(el)}
            rows={4}
            className="w-full text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:bg-muted/70 transition-colors resize-none overflow-hidden min-h-[120px]"
          />
        </div>

        {/* Site Objective */}
        <div className="glow-border bg-background/50 backdrop-blur-sm p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.1_160)]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[oklch(0.55_0.1_160)]" />
            </div>
            <div>
              <h3 className="font-bold text-base">O que seu site precisa fazer?</h3>
              <p className="text-xs text-muted-foreground">Os principais objetivos da sua presença na internet</p>
            </div>
          </div>

          <textarea
            defaultValue={analysisData.siteObjective}
            onBlur={(e) => setAnalysisData((prev) => ({ ...prev, siteObjective: e.target.value }))}
            onInput={(e) => autoResize(e.currentTarget)}
            ref={(el) => autoResize(el)}
            rows={3}
            className="w-full text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:bg-muted/70 transition-colors resize-none overflow-hidden min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg" className="h-12 px-6 bg-transparent">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <Button onClick={handleSubmit} size="lg" className="h-12 px-8 font-semibold">
          Continuar para Briefing Completo
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
