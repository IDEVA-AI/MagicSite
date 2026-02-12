"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Brain, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StepTwoProps {
  onNext: () => void
  onBack: () => void
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 300)

    return () => clearInterval(timer)
  }, [])

  const analyses = [
    "Análise de mercado e concorrência",
    "Definição de personas e público-alvo",
    "Proposta de valor única",
    "Posicionamento estratégico",
    "Diferenciais competitivos",
    "Estrutura de conteúdo otimizada",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Análise Estratégica IA</h2>
        <p className="text-muted-foreground">
          Nossa IA está analisando 47 variáveis do seu negócio para criar um mapa estratégico completo
        </p>
      </div>

      <Card className="p-8 bg-secondary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold mb-2">{isComplete ? "Análise Concluída!" : "Processando..."}</p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% completo</p>
          </div>
        </div>

        <div className="space-y-3">
          {analyses.map((analysis, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-opacity ${
                progress > index * 16 ? "opacity-100" : "opacity-30"
              }`}
            >
              <CheckCircle2 className={`h-5 w-5 ${progress > index * 16 ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-sm">{analysis}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Consumiu <span className="font-semibold text-primary">10 créditos</span>
          </p>
          <Button size="lg" onClick={onNext} disabled={!isComplete}>
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
