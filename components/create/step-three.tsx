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
  layout: string
}

interface LayoutOption {
  value: string
  label: string
}

const sectionLayouts: Record<string, LayoutOption[]> = {
  hero: [
    { value: "hero-centered", label: "Centralizado" },
    { value: "hero-background", label: "Imagem de Fundo" },
    { value: "hero-split", label: "Texto + Foto" },
    { value: "hero-video", label: "Vídeo" },
    { value: "hero-slider", label: "Carrossel" },
  ],
  about: [
    { value: "about-image", label: "Texto + Foto" },
    { value: "about-timeline", label: "Linha do Tempo" },
    { value: "about-numbers", label: "Números" },
    { value: "about-team", label: "Equipe" },
  ],
  services: [
    { value: "services-cards", label: "Grade" },
    { value: "services-icons", label: "Ícones" },
    { value: "services-list", label: "Lista" },
    { value: "services-tabs", label: "Abas" },
  ],
  differentials: [
    { value: "diff-grid", label: "Grade" },
    { value: "diff-comparison", label: "Comparativo" },
    { value: "diff-numbers", label: "Números" },
    { value: "diff-horizontal", label: "Horizontal" },
  ],
  testimonials: [
    { value: "test-carousel", label: "Carrossel" },
    { value: "test-grid", label: "Grade" },
    { value: "test-list", label: "Lista" },
    { value: "test-featured", label: "Destaque" },
  ],
  cta: [
    { value: "cta-banner", label: "Banner" },
    { value: "cta-form", label: "Formulário" },
    { value: "cta-split", label: "Dividido" },
    { value: "cta-whatsapp", label: "WhatsApp" },
  ],
}

function renderThumbnail(value: string) {
  switch (value) {
    // ── Hero ──
    case "hero-centered":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2">
          <div className="w-4/5 h-[5px] bg-current/40 rounded-[1px]" />
          <div className="w-3/5 h-[3px] bg-current/20 rounded-[1px]" />
          <div className="w-2/5 h-[5px] bg-current/50 rounded-[2px]" />
        </div>
      )
    case "hero-background":
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-current/12 rounded-[2px] m-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-current/8 to-current/20 rounded-[2px] m-[2px]" />
          <div className="relative flex flex-col items-center justify-center h-full gap-[3px] px-2 z-10">
            <div className="w-4/5 h-[5px] bg-current/55 rounded-[1px]" />
            <div className="w-3/5 h-[3px] bg-current/35 rounded-[1px]" />
            <div className="w-2/5 h-[5px] bg-current/60 rounded-[2px]" />
          </div>
        </div>
      )
    case "hero-split":
      return (
        <div className="flex gap-[4px] h-full p-1.5">
          <div className="flex-1 flex flex-col gap-[2px] justify-center">
            <div className="w-full h-[4px] bg-current/40 rounded-[1px]" />
            <div className="w-4/5 h-[3px] bg-current/20 rounded-[1px]" />
            <div className="w-2/5 h-[4px] bg-current/45 rounded-[2px] mt-[2px]" />
          </div>
          <div className="flex-1 bg-current/12 rounded-[2px]" />
        </div>
      )
    case "hero-video":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2 relative">
          <div className="absolute inset-1.5 bg-current/6 rounded-[2px]" />
          <div
            className="w-0 h-0 relative z-10"
            style={{
              borderLeft: "6px solid currentColor",
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              opacity: 0.4,
            }}
          />
          <div className="w-3/5 h-[3px] bg-current/25 rounded-[1px] relative z-10" />
        </div>
      )
    case "hero-slider":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-1.5">
          <div className="flex items-center gap-[4px] w-full">
            <div
              className="w-0 h-0 shrink-0"
              style={{
                borderRight: "4px solid currentColor",
                borderTop: "3px solid transparent",
                borderBottom: "3px solid transparent",
                opacity: 0.25,
              }}
            />
            <div className="flex-1 flex flex-col items-center gap-[2px]">
              <div className="w-4/5 h-[4px] bg-current/35 rounded-[1px]" />
              <div className="w-3/5 h-[3px] bg-current/20 rounded-[1px]" />
            </div>
            <div
              className="w-0 h-0 shrink-0"
              style={{
                borderLeft: "4px solid currentColor",
                borderTop: "3px solid transparent",
                borderBottom: "3px solid transparent",
                opacity: 0.25,
              }}
            />
          </div>
          <div className="flex gap-[3px]">
            <div className="w-[4px] h-[4px] rounded-full bg-current/45" />
            <div className="w-[4px] h-[4px] rounded-full bg-current/15" />
            <div className="w-[4px] h-[4px] rounded-full bg-current/15" />
          </div>
        </div>
      )

    // ── About ──
    case "about-image":
      return (
        <div className="flex gap-[4px] h-full p-1.5">
          <div className="flex-1 flex flex-col gap-[2px] justify-center">
            <div className="w-full h-[4px] bg-current/35 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/15 rounded-[1px]" />
            <div className="w-3/4 h-[3px] bg-current/15 rounded-[1px]" />
          </div>
          <div className="flex-1 bg-current/12 rounded-[2px]" />
        </div>
      )
    case "about-timeline":
      return (
        <div className="flex h-full p-1.5 gap-[4px]">
          <div className="flex flex-col items-center py-[2px]">
            <div className="w-[5px] h-[5px] rounded-full bg-current/40" />
            <div className="w-[1px] flex-1 bg-current/15" />
            <div className="w-[5px] h-[5px] rounded-full bg-current/40" />
            <div className="w-[1px] flex-1 bg-current/15" />
            <div className="w-[5px] h-[5px] rounded-full bg-current/40" />
          </div>
          <div className="flex-1 flex flex-col gap-[4px] justify-center">
            <div className="w-full h-[3px] bg-current/20 rounded-[1px]" />
            <div className="w-4/5 h-[3px] bg-current/20 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/20 rounded-[1px]" />
          </div>
        </div>
      )
    case "about-numbers":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[4px] px-1.5">
          <div className="flex gap-[4px] w-full">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 bg-current/8 rounded-[2px] h-[14px] flex items-center justify-center">
                <div className="w-[8px] h-[6px] bg-current/30 rounded-[1px]" />
              </div>
            ))}
          </div>
          <div className="flex gap-[4px] w-full">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 h-[2px] bg-current/12 rounded-[1px]" />
            ))}
          </div>
        </div>
      )
    case "about-team":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[4px] px-2">
          <div className="flex gap-[8px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-[2px]">
                <div className="w-[10px] h-[10px] rounded-full bg-current/20" />
                <div className="w-[12px] h-[2px] bg-current/12 rounded-[1px]" />
              </div>
            ))}
          </div>
        </div>
      )

    // ── Services ──
    case "services-cards":
      return (
        <div className="flex gap-[3px] h-full p-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 bg-current/6 rounded-[2px] p-[3px] flex flex-col gap-[2px]">
              <div className="w-full h-[6px] bg-current/20 rounded-[1px]" />
              <div className="w-full h-[3px] bg-current/10 rounded-[1px]" />
              <div className="w-3/4 h-[3px] bg-current/10 rounded-[1px]" />
            </div>
          ))}
        </div>
      )
    case "services-icons":
      return (
        <div className="flex gap-[3px] h-full p-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[3px] justify-center">
              <div className="w-[10px] h-[10px] rounded-[3px] bg-current/25" />
              <div className="w-full h-[3px] bg-current/15 rounded-[1px]" />
              <div className="w-3/4 h-[2px] bg-current/10 rounded-[1px]" />
            </div>
          ))}
        </div>
      )
    case "services-list":
      return (
        <div className="flex flex-col gap-[4px] h-full p-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-[4px] items-center">
              <div className="w-[8px] h-[8px] rounded-[2px] bg-current/20 shrink-0" />
              <div className="flex-1 flex flex-col gap-[1px]">
                <div className="w-full h-[3px] bg-current/25 rounded-[1px]" />
                <div className="w-3/4 h-[2px] bg-current/10 rounded-[1px]" />
              </div>
            </div>
          ))}
        </div>
      )
    case "services-tabs":
      return (
        <div className="flex flex-col h-full p-1.5">
          <div className="flex gap-[2px] mb-[3px]">
            <div className="w-[14px] h-[5px] bg-current/35 rounded-t-[2px]" />
            <div className="w-[14px] h-[5px] bg-current/12 rounded-t-[2px]" />
            <div className="w-[14px] h-[5px] bg-current/12 rounded-t-[2px]" />
          </div>
          <div className="flex-1 bg-current/6 rounded-b-[2px] rounded-tr-[2px] p-[3px] flex flex-col gap-[2px] justify-center">
            <div className="w-full h-[4px] bg-current/18 rounded-[1px]" />
            <div className="w-3/4 h-[3px] bg-current/10 rounded-[1px]" />
          </div>
        </div>
      )

    // ── Differentials ──
    case "diff-grid":
      return (
        <div className="grid grid-cols-2 gap-[3px] h-full p-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-current/6 rounded-[2px] p-[2px] flex items-center gap-[2px]">
              <div className="w-[6px] h-[6px] rounded-[2px] bg-current/25 shrink-0" />
              <div className="flex-1 h-[3px] bg-current/12 rounded-[1px]" />
            </div>
          ))}
        </div>
      )
    case "diff-comparison":
      return (
        <div className="flex gap-[3px] h-full p-1.5">
          <div className="flex-1 bg-current/8 rounded-[2px] p-[2px] flex flex-col gap-[3px] justify-center">
            <div className="w-full h-[3px] bg-current/35 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/35 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/35 rounded-[1px]" />
          </div>
          <div className="w-[1px] bg-current/15" />
          <div className="flex-1 bg-current/4 rounded-[2px] p-[2px] flex flex-col gap-[3px] justify-center">
            <div className="w-full h-[3px] bg-current/12 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/12 rounded-[1px]" />
            <div className="w-full h-[3px] bg-current/12 rounded-[1px]" />
          </div>
        </div>
      )
    case "diff-numbers":
      return (
        <div className="flex gap-[4px] h-full p-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-[2px]">
              <div className="w-[12px] h-[10px] bg-current/20 rounded-[2px] flex items-center justify-center">
                <div className="w-[7px] h-[6px] bg-current/35 rounded-[1px]" />
              </div>
              <div className="w-full h-[2px] bg-current/10 rounded-[1px]" />
            </div>
          ))}
        </div>
      )
    case "diff-horizontal":
      return (
        <div className="flex flex-col gap-[3px] h-full p-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-[4px] items-center bg-current/4 rounded-[2px] px-[3px] py-[2px]">
              <div className="w-[7px] h-[7px] rounded-[2px] bg-current/20 shrink-0" />
              <div className="flex-1 h-[3px] bg-current/12 rounded-[1px]" />
            </div>
          ))}
        </div>
      )

    // ── Testimonials ──
    case "test-carousel":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-1.5">
          <div className="flex items-center gap-[3px] w-full">
            <div
              className="w-0 h-0 shrink-0"
              style={{
                borderRight: "3px solid currentColor",
                borderTop: "2px solid transparent",
                borderBottom: "2px solid transparent",
                opacity: 0.2,
              }}
            />
            <div className="flex-1 bg-current/6 rounded-[2px] p-[3px] flex flex-col items-center gap-[2px]">
              <div className="w-4/5 h-[3px] bg-current/20 rounded-[1px]" />
              <div className="flex items-center gap-[3px]">
                <div className="w-[6px] h-[6px] rounded-full bg-current/15" />
                <div className="w-[16px] h-[2px] bg-current/12 rounded-[1px]" />
              </div>
            </div>
            <div
              className="w-0 h-0 shrink-0"
              style={{
                borderLeft: "3px solid currentColor",
                borderTop: "2px solid transparent",
                borderBottom: "2px solid transparent",
                opacity: 0.2,
              }}
            />
          </div>
          <div className="flex gap-[3px]">
            <div className="w-[4px] h-[4px] rounded-full bg-current/40" />
            <div className="w-[4px] h-[4px] rounded-full bg-current/15" />
            <div className="w-[4px] h-[4px] rounded-full bg-current/15" />
          </div>
        </div>
      )
    case "test-grid":
      return (
        <div className="flex gap-[3px] h-full p-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 bg-current/6 rounded-[2px] p-[2px] flex flex-col items-center gap-[2px] justify-center">
              <div className="w-[8px] h-[3px] bg-current/18 rounded-[1px]" />
              <div className="w-[6px] h-[6px] rounded-full bg-current/15" />
              <div className="w-full h-[2px] bg-current/10 rounded-[1px]" />
            </div>
          ))}
        </div>
      )
    case "test-list":
      return (
        <div className="flex flex-col gap-[4px] h-full p-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-[4px] items-center">
              <div className="w-[8px] h-[8px] rounded-full bg-current/18 shrink-0" />
              <div className="flex-1 flex flex-col gap-[1px]">
                <div className="w-full h-[3px] bg-current/18 rounded-[1px]" />
                <div className="w-3/5 h-[2px] bg-current/10 rounded-[1px]" />
              </div>
            </div>
          ))}
        </div>
      )
    case "test-featured":
      return (
        <div className="flex gap-[3px] h-full p-1.5">
          <div className="flex-[1.4] bg-current/8 rounded-[2px] p-[3px] flex flex-col items-center justify-center gap-[2px]">
            <div className="w-4/5 h-[4px] bg-current/20 rounded-[1px]" />
            <div className="w-[8px] h-[8px] rounded-full bg-current/15" />
            <div className="w-full h-[2px] bg-current/10 rounded-[1px]" />
          </div>
          <div className="flex-1 flex flex-col gap-[3px]">
            <div className="flex-1 bg-current/5 rounded-[2px] p-[2px] flex items-center gap-[2px]">
              <div className="w-[5px] h-[5px] rounded-full bg-current/12 shrink-0" />
              <div className="flex-1 h-[2px] bg-current/10 rounded-[1px]" />
            </div>
            <div className="flex-1 bg-current/5 rounded-[2px] p-[2px] flex items-center gap-[2px]">
              <div className="w-[5px] h-[5px] rounded-full bg-current/12 shrink-0" />
              <div className="flex-1 h-[2px] bg-current/10 rounded-[1px]" />
            </div>
          </div>
        </div>
      )

    // ── CTA ──
    case "cta-banner":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2">
          <div className="w-4/5 h-[5px] bg-current/35 rounded-[1px]" />
          <div className="w-3/5 h-[3px] bg-current/18 rounded-[1px]" />
          <div className="w-2/5 h-[5px] bg-current/50 rounded-[2px] mt-[1px]" />
        </div>
      )
    case "cta-form":
      return (
        <div className="flex gap-[4px] h-full p-1.5">
          <div className="flex-1 flex flex-col gap-[2px] justify-center">
            <div className="w-full h-[4px] bg-current/35 rounded-[1px]" />
            <div className="w-3/4 h-[3px] bg-current/18 rounded-[1px]" />
          </div>
          <div className="flex-1 flex flex-col gap-[3px] justify-center">
            <div className="w-full h-[4px] border border-current/20 rounded-[1px]" />
            <div className="w-full h-[4px] border border-current/20 rounded-[1px]" />
            <div className="w-3/5 h-[5px] bg-current/40 rounded-[2px]" />
          </div>
        </div>
      )
    case "cta-split":
      return (
        <div className="flex gap-[4px] h-full p-1.5">
          <div className="flex-1 bg-current/10 rounded-[2px]" />
          <div className="flex-1 flex flex-col gap-[2px] justify-center">
            <div className="w-full h-[4px] bg-current/35 rounded-[1px]" />
            <div className="w-3/4 h-[3px] bg-current/18 rounded-[1px]" />
            <div className="w-2/5 h-[5px] bg-current/45 rounded-[2px] mt-[1px]" />
          </div>
        </div>
      )
    case "cta-whatsapp":
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2">
          <div className="w-3/5 h-[4px] bg-current/30 rounded-[1px]" />
          <div className="flex gap-[4px] items-center mt-[1px]">
            <div className="w-[16px] h-[6px] bg-current/45 rounded-[2px]" />
            <div className="w-[10px] h-[8px] bg-current/25 rounded-[3px] relative">
              <div
                className="absolute -bottom-[2px] left-[1px] w-0 h-0"
                style={{
                  borderLeft: "3px solid currentColor",
                  borderBottom: "3px solid transparent",
                  opacity: 0.25,
                }}
              />
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-1/2 h-[3px] bg-current/20 rounded-[1px]" />
        </div>
      )
  }
}

function LayoutThumbnail({
  value,
  label,
  selected,
  onClick,
}: {
  value: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 group cursor-pointer"
    >
      <div
        className={`
          w-[68px] sm:w-[76px] h-[44px] sm:h-[48px] rounded-lg border-2 transition-all
          ${selected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border/40 bg-background hover:border-primary/40 hover:bg-muted/30"
          }
        `}
      >
        <div
          className={`w-full h-full transition-colors ${
            selected ? "text-primary" : "text-foreground/50 group-hover:text-foreground/70"
          }`}
        >
          {renderThumbnail(value)}
        </div>
      </div>
      <span
        className={`text-[10px] leading-none transition-colors max-w-[72px] truncate ${
          selected ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground/70"
        }`}
      >
        {label}
      </span>
    </button>
  )
}

// Migrate old generic layout values to section-specific ones
function migrateLayout(sectionId: string, layout: string): string {
  if (layout.includes("-")) return layout
  const map: Record<string, Record<string, string>> = {
    hero: { full: "hero-centered", split: "hero-split", grid: "hero-centered", list: "hero-centered" },
    about: { full: "about-image", split: "about-image", grid: "about-team", list: "about-timeline" },
    services: { full: "services-list", split: "services-list", grid: "services-cards", list: "services-list" },
    differentials: { full: "diff-horizontal", split: "diff-comparison", grid: "diff-grid", list: "diff-horizontal" },
    testimonials: { full: "test-carousel", split: "test-list", grid: "test-grid", list: "test-list" },
    cta: { full: "cta-banner", split: "cta-split", grid: "cta-banner", list: "cta-banner" },
  }
  return map[sectionId]?.[layout] || layout
}

export function StepThree({ onNext, onBack, initialData }: StepThreeProps) {
  const hasExistingWireframe = initialData?.wireframe && initialData.wireframe.length > 0

  const [sections, setSections] = useState<WireframeSection[]>(
    hasExistingWireframe
      ? initialData.wireframe.map((s: any) => ({ ...s, layout: migrateLayout(s.id, s.layout) }))
      : [],
  )

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
        layout: "hero-centered",
        instructions:
          `Título impactante para ${businessName} destacando: "${finalPromise}". Subtítulo explicando como ajudamos ${targetAudience}. Botão CTA principal: "${ctaPrimary}" com cor ${primaryColor}. Imagem de destaque: foto profissional representando ${segment} em ação. Tom: ${toneOfVoice}.`,
      },
      {
        id: "about",
        title: "Sobre Nós",
        icon: Users,
        layout: "about-image",
        instructions:
          `História de ${businessName} em 2-3 parágrafos curtos, focando na jornada e motivação. Missão: ${briefing.corePhilosophy || "qualidade e compromisso"}. Destacar o diferencial: ${differential}. Números de impacto (anos de experiência, clientes atendidos). Foto da equipe ou fundador. Tom: ${toneOfVoice}.`,
      },
      {
        id: "services",
        title: "Serviços e Soluções",
        icon: Award,
        layout: "services-cards",
        instructions:
          `3-6 cards detalhando: ${offering}. Cada card com ícone representativo, título do serviço, descrição de 2-3 linhas focando nos benefícios para ${targetAudience}. Botão "${ctaSecondary}" em cada card com cor ${secondaryColor}. Destacar como cada serviço resolve os desafios: ${briefing.audienceChallenges || "do público"}.`,
      },
      {
        id: "differentials",
        title: "Diferenciais Competitivos",
        icon: Sparkles,
        layout: "diff-grid",
        instructions:
          `4-6 diferenciais de ${businessName}: incluir "${differential}" como principal. Ícones representativos para cada diferencial. Textos curtos (1-2 linhas). Superar objeções comuns: ${briefing.commonObjections || "preocupações do público"}. Usar dados concretos quando possível.`,
      },
      {
        id: "testimonials",
        title: "Depoimentos e Prova Social",
        icon: MessageSquare,
        layout: "test-carousel",
        instructions:
          `3-6 depoimentos de ${targetAudience} satisfeitos. Incluir nome, cargo/empresa e foto. Destacar resultados alcançados e a emoção: ${briefing.desiredEmotion || "confiança e segurança"}. Reforçar: ${socialProof}. Adicionar logos de parceiros se aplicável.`,
      },
      {
        id: "cta",
        title: "Call-to-Action Final",
        icon: Phone,
        layout: "cta-banner",
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

  const handleLayoutChange = (sectionId: string, newLayout: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, layout: newLayout } : section)),
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
          Escolha o layout de cada seção e ajuste as instruções como desejar.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon
          const options = sectionLayouts[section.id] || []
          return (
            <Card key={section.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{section.title}</h3>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                    Seção {index + 1}
                  </div>
                </div>

                {options.length > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 py-1">
                    <span className="text-xs text-muted-foreground font-medium shrink-0">Layout:</span>
                    <div className="flex gap-2 sm:gap-3">
                      {options.map((option) => (
                        <LayoutThumbnail
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          selected={section.layout === option.value}
                          onClick={() => handleLayoutChange(section.id, option.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 min-h-[80px]">
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
