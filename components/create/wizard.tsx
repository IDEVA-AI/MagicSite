"use client"

import { useState, useEffect } from "react"
import { StepIndicator } from "./step-indicator"
import { StepOne } from "./step-one"
import { StepTwoAnalysis } from "./step-two-analysis"
import { BriefingReview } from "./briefing-review"
import { StepThree } from "./step-three"
import { StepFour } from "./step-four"

export function CreateProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectData, setProjectData] = useState<any>({})

  useEffect(() => {
    const projectType = sessionStorage.getItem("projectType")
    if (projectType) {
      setProjectData((prev: any) => ({ ...prev, projectType }))
    }
  }, [])

  const steps = [
    { number: 1, title: "Informações" },
    { number: 2, title: "Análise IA" },
    { number: 3, title: "Briefing" },
    { number: 4, title: "Conteúdo" },
    { number: 5, title: "Prompt" },
  ]

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-black gradient-text tracking-tight">Criar Novo Projeto</h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
          Siga as etapas para gerar seu site profissional com IA
        </p>
      </div>

      <div className="glow-border bg-card/80 backdrop-blur-sm p-6 rounded-xl">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border-2 border-border/50">
        {currentStep === 1 && (
          <StepOne
            onNext={(data) => {
              setProjectData({ ...projectData, ...data })
              setCurrentStep(2)
            }}
            initialData={projectData}
          />
        )}
        {currentStep === 2 && (
          <StepTwoAnalysis
            onNext={(data) => {
              setProjectData({ ...projectData, ...data })
              setCurrentStep(3)
            }}
            onBack={() => setCurrentStep(1)}
            initialData={projectData}
          />
        )}
        {currentStep === 3 && (
          <BriefingReview
            onNext={(data) => {
              setProjectData({ ...projectData, ...data })
              setCurrentStep(4)
            }}
            onBack={() => setCurrentStep(2)}
            initialData={projectData}
          />
        )}
        {currentStep === 4 && (
          <StepThree
            onNext={(data) => {
              setProjectData({ ...projectData, ...data })
              setCurrentStep(5)
            }}
            onBack={() => setCurrentStep(3)}
            initialData={projectData}
          />
        )}
        {currentStep === 5 && <StepFour onBack={() => setCurrentStep(4)} projectData={projectData} />}
      </div>
    </div>
  )
}
