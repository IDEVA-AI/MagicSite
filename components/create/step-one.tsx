"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Building2, Phone, MapPin, FileText, Sparkles, Briefcase, Mail, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

interface StepOneProps {
  onNext: (data: any) => void
  initialData?: any
}

export function StepOne({ onNext, initialData }: StepOneProps) {
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    segment: initialData?.segmentKey || initialData?.segment || "",
    customSegment: initialData?.customSegment || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    instagram: initialData?.instagram || "",
    businessHours: initialData?.businessHours || "",
  })

  const [showCustomSegment, setShowCustomSegment] = useState(
    (initialData?.segmentKey || initialData?.segment) === "outro"
  )
  const [isAiHelping, setIsAiHelping] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    const phoneDigits = formData.phone.replace(/\D/g, "")
    if (phoneDigits.length < 10) {
      setErrorMessage("Informe um telefone válido com DDD. Ex: (11) 99999-0000")
      return
    }

    if (formData.description.trim().length < 30) {
      setErrorMessage("Descreva seu negócio com pelo menos 30 caracteres para uma análise mais precisa.")
      return
    }

    const resolvedSegment = formData.segment === "outro" ? formData.customSegment : formData.segment
    const segmentKey = formData.segment || "outro"

    onNext({
      ...formData,
      businessName: formData.businessName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      segment: resolvedSegment.trim(),
      segmentKey,
      customSegment: formData.customSegment.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      instagram: formData.instagram.trim(),
      businessHours: formData.businessHours.trim(),
    })
  }

  const handleSegmentChange = (value: string) => {
    setFormData({ ...formData, segment: value, customSegment: "" })
    setShowCustomSegment(value === "outro")
  }

  const handleAiHelp = async () => {
    setIsAiHelping(true)
    setErrorMessage("")

    const segmentKey = formData.segment || "outro"
    const resolvedSegment = segmentKey === "outro" ? formData.customSegment : formData.segment

    try {
      const response = await fetch("/api/agents/description-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          segment: resolvedSegment?.trim() || "",
          location: formData.address.trim(),
          description: formData.description.trim(),
        }),
      })

      if (response.status === 402) {
        const payload = await response.json().catch(() => ({}))
        setErrorMessage(payload.error || "Créditos insuficientes.")
        const { dispatchCreditsChanged } = await import("@/lib/credits-event")
        dispatchCreditsChanged()
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Não foi possível gerar a descrição. Tente novamente.")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, description: data.description }))
      const { dispatchCreditsChanged } = await import("@/lib/credits-event")
      dispatchCreditsChanged()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar descrição com a IA."
      setErrorMessage(message)
    } finally {
      setIsAiHelping(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2 pb-4 border-b-2 border-primary/20">
        <h2 className="text-3xl font-black gradient-text">Conte sobre seu negócio</h2>
        <p className="text-base text-muted-foreground font-medium">
          Preencha as informações básicas para começar a análise estratégica
        </p>
      </div>

      <div className="robust-card bg-card p-8 rounded-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/10">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-black text-lg">Informações Básicas</h3>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Nome do Negócio *
            </Label>
            <Input
              id="businessName"
              placeholder="Ex: Consultoria Silva"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Segment */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="segment" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Segmento de Atuação *
            </Label>
            <Select value={formData.segment} onValueChange={handleSegmentChange} required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advocacia">Advocacia</SelectItem>
                <SelectItem value="contabilidade">Contabilidade</SelectItem>
                <SelectItem value="fitness">Academia/Fitness</SelectItem>
                <SelectItem value="saude">Saúde e Bem-estar</SelectItem>
                <SelectItem value="petshop_veterinaria">Petshop e Veterinária</SelectItem>
                <SelectItem value="automotivo">Setor Automotivo</SelectItem>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="barbearia">Barbearia</SelectItem>
                <SelectItem value="estudio_beleza">Estúdio de Beleza</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            {showCustomSegment && (
              <div className="animate-in slide-in-from-top-2 duration-300 pt-2">
                <Input
                  id="customSegment"
                  placeholder="Digite o segmento do seu negócio"
                  value={formData.customSegment}
                  onChange={(e) => setFormData({ ...formData, customSegment: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4 text-[oklch(0.55_0.1_160)]" />
              Telefone/WhatsApp *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              required
              className="h-11"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-[oklch(0.65_0.15_220)]" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[oklch(0.6_0.12_280)]" />
              Endereço *
            </Label>
            <Input
              id="address"
              placeholder="Cidade - UF"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="h-11"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[oklch(0.65_0.15_35)]" />
              Instagram
            </Label>
            <Input
              id="instagram"
              placeholder="@empresa ou instagram.com/empresa"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Business Hours */}
          <div className="space-y-2">
            <Label htmlFor="businessHours" className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[oklch(0.55_0.1_160)]" />
              Horário de Funcionamento
            </Label>
            <Input
              id="businessHours"
              placeholder="Ex: Segunda a Sexta, 8h às 18h"
              value={formData.businessHours}
              onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
              className="h-11"
            />
          </div>
        </div>
      </div>

      <div className="robust-card bg-card p-8 rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-sm font-semibold">
            Descrição do Negócio *
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiHelp}
            disabled={isAiHelping || !formData.businessName || !formData.segment}
            className="h-8 px-3 font-mono font-bold text-xs bg-primary/20 text-primary border-2 border-primary/60 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-primary/20 disabled:hover:text-primary disabled:hover:border-primary/60"
          >
            {isAiHelping ? (
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
        <Textarea
          id="description"
          placeholder="Descreva o que seu negócio faz, quem são seus clientes e qual problema você resolve..."
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Quanto mais detalhes, melhor será a análise estratégica
          </p>
          <p className={`text-xs font-medium ${
            formData.description.length >= 80 ? "text-green-600" :
            formData.description.length >= 30 ? "text-yellow-600" :
            "text-muted-foreground"
          }`}>
            {formData.description.length}/80 caracteres
            {formData.description.length < 30 && formData.description.length > 0 && " (mínimo 30)"}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          className="h-14 px-10 font-bold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
        >
          Iniciar Análise
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
