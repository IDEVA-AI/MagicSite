"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { StepIndicator } from "./step-indicator"
import { StepOne } from "./step-one"
import { StepTwoAnalysis } from "./step-two-analysis"
import { BriefingReview } from "./briefing-review"
import { StepThree } from "./step-three"
import { StepFour } from "./step-four"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const STORAGE_KEY = "magicsite-wizard-draft"

interface WizardDraft {
  currentStep: number
  projectData: any
  savedAt: string
}

function loadDraft(): WizardDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft: WizardDraft = JSON.parse(raw)
    // Discard drafts older than 24 hours
    const age = Date.now() - new Date(draft.savedAt).getTime()
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

function saveDraft(currentStep: number, projectData: any) {
  try {
    const draft: WizardDraft = {
      currentStep,
      projectData,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function clearWizardDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function CreateProjectWizard() {
  const draft = useRef(loadDraft())
  const [currentStep, setCurrentStep] = useState(draft.current?.currentStep ?? 1)
  const [projectData, setProjectData] = useState<any>(draft.current?.projectData ?? {})
  const [showDraftBanner, setShowDraftBanner] = useState(!!draft.current)
  const hasData = useRef(false)

  // Load projectType from sessionStorage (existing behavior)
  useEffect(() => {
    const projectType = sessionStorage.getItem("projectType")
    if (projectType) {
      setProjectData((prev: any) => ({ ...prev, projectType }))
    }
  }, [])

  // Auto-save draft on step/data changes
  useEffect(() => {
    if (currentStep === 1 && !projectData.businessName) return
    hasData.current = true
    saveDraft(currentStep, projectData)
  }, [currentStep, projectData])

  // Warn before leaving with unsaved data
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasData.current && currentStep < 5) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [currentStep])

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  const handleDismissDraft = useCallback(() => {
    clearWizardDraft()
    try { localStorage.removeItem("magicsite-briefing-draft") } catch {}
    setCurrentStep(1)
    setProjectData({})
    setShowDraftBanner(false)
    hasData.current = false
  }, [])

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber)
    }
  }

  const updateAndAdvance = useCallback((data: any, nextStep: number) => {
    setProjectData((prev: any) => ({ ...prev, ...data }))
    setCurrentStep(nextStep)
  }, [])

  const steps = [
    { number: 1, title: "Informações" },
    { number: 2, title: "Análise IA" },
    { number: 3, title: "Briefing" },
    { number: 4, title: "Conteúdo" },
    { number: 5, title: "Prompt" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-black gradient-text tracking-tight">Criar Novo Projeto</h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
          Siga as etapas para gerar seu site profissional com IA
        </p>
      </div>

      {showDraftBanner && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
          <p className="text-sm font-medium">
            Encontramos um projeto em andamento. Deseja continuar de onde parou?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowDraftBanner(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continuar
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Começar novo
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Descartar projeto em andamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as informações preenchidas serão perdidas. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDismissDraft}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, descartar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="glow-border bg-card/80 backdrop-blur-sm p-6 rounded-xl">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border-2 border-border/50">
        {currentStep === 1 && (
          <StepOne
            onNext={(data) => updateAndAdvance(data, 2)}
            initialData={projectData}
          />
        )}
        {currentStep === 2 && (
          <StepTwoAnalysis
            onNext={(data) => updateAndAdvance(data, 3)}
            onBack={() => setCurrentStep(1)}
            initialData={projectData}
          />
        )}
        {currentStep === 3 && (
          <BriefingReview
            onNext={(data) => updateAndAdvance(data, 4)}
            onBack={() => setCurrentStep(2)}
            initialData={projectData}
          />
        )}
        {currentStep === 4 && (
          <StepThree
            onNext={(data) => updateAndAdvance(data, 5)}
            onBack={() => setCurrentStep(3)}
            initialData={projectData}
          />
        )}
        {currentStep === 5 && <StepFour onBack={() => setCurrentStep(4)} projectData={projectData} />}
      </div>
    </div>
  )
}
