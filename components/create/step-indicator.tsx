"use client"

import { Check } from "lucide-react"

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <button
              onClick={() => {
                if (onStepClick && step.number <= currentStep) {
                  onStepClick(step.number)
                }
              }}
              disabled={step.number > currentStep}
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                step.number < currentStep
                  ? "bg-primary border-primary text-primary-foreground hover:scale-110 cursor-pointer shadow-lg shadow-primary/30"
                  : step.number === currentStep
                    ? "border-primary text-primary hover:scale-110 cursor-pointer shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                    : "border-border text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              {step.number < currentStep ? (
                <Check className="h-6 w-6" />
              ) : (
                <span className="font-bold text-lg">{step.number}</span>
              )}
            </button>
            <div className="mt-3 text-center">
              <p
                className={`text-sm font-bold ${
                  step.number <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </p>
            </div>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-4 rounded-full transition-all duration-500 ${
                step.number < currentStep ? "bg-gradient-to-r from-primary to-primary/50" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
