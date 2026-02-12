"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, User, GraduationCap, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function NewProjectPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const projectTypes = [
    {
      id: "empresa",
      title: "Site para Empresas",
      description: "Ideal para apresentar sua empresa, produtos e serviços de forma profissional",
      icon: Building2,
      examples: ["Lojas", "Escritórios", "Indústrias", "Comércio"],
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary",
    },
    {
      id: "profissional",
      title: "Site para Profissionais",
      description: "Perfeito para divulgar seus serviços e conquistar novos clientes",
      icon: User,
      examples: ["Advogados", "Médicos", "Consultores", "Freelancers"],
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent",
    },
    {
      id: "curso",
      title: "Site para Cursos e Mentorias",
      description: "Especial para vender cursos online e programas de mentoria",
      icon: GraduationCap,
      examples: ["Cursos Online", "Mentorias", "Treinamentos", "Workshops"],
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      borderColor: "border-chart-3",
    },
  ]

  const handleContinue = () => {
    if (selectedType) {
      sessionStorage.setItem("projectType", selectedType)
      router.push(`/app/projects/new/wizard`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-6 relative">
      <div className="absolute inset-0 tech-grid opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="w-full max-w-6xl relative space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Etapa 1 de 3</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Que tipo de site você quer criar?
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecione a categoria que melhor representa seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {projectTypes.map((type) => {
            const isSelected = selectedType === type.id
            const Icon = type.icon

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "relative text-left p-6 rounded-xl border-2 transition-all duration-200",
                  "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "bg-card text-card-foreground",
                  isSelected
                    ? `${type.borderColor} ${type.bgColor} shadow-xl ring-2 ring-offset-2 ring-offset-background`
                    : "border-border hover:border-foreground/30 hover:shadow-lg hover:bg-accent/5",
                )}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-background">
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={cn(
                    "mb-5 p-3 rounded-lg w-fit transition-all duration-200",
                    isSelected ? `${type.bgColor} ring-2 ${type.borderColor}` : "bg-muted/50",
                  )}
                >
                  <Icon
                    className={cn("w-10 h-10 transition-colors", isSelected ? type.color : "text-muted-foreground")}
                  />
                </div>

                <h3 className="text-xl font-bold mb-2 text-foreground">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{type.description}</p>

                <div className="flex flex-wrap gap-2">
                  {type.examples.map((example) => (
                    <span
                      key={example}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-md font-medium border transition-all",
                        isSelected
                          ? `${type.bgColor} ${type.color} ${type.borderColor}`
                          : "bg-muted/50 text-muted-foreground border-border",
                      )}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-4">
          {!selectedType && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium">Selecione uma opção acima para continuar</p>
            </div>
          )}
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedType}
            className="gap-2 px-10 py-6 text-lg font-bold shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
          >
            Continuar para Próxima Etapa
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
