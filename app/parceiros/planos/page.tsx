"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Check, Crown, Zap, Rocket, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Plan {
  id: string
  plan_name: string
  credits_amount: number
  original_price_cents: number
  partnership_price_cents: number
  is_active: boolean
}

interface UserData {
  id: string
  name: string
  email: string
}

export default function PartnershipPlans() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState("smart")
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("partnershipUser")
    if (stored) {
      setUserData(JSON.parse(stored))
    } else {
      router.replace("/parceiros/validacao")
      return
    }

    fetch("/api/partnership/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data))
      .catch(() => toast.error("Erro ao carregar planos"))
      .finally(() => setLoadingPlans(false))
  }, [router])

  const handleConfirm = async () => {
    if (!userData) return
    setConfirming(true)
    try {
      const res = await fetch("/api/partnership/confirm-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, planName: selectedPlan }),
      })
      const data = await res.json()

      if (data.success) {
        sessionStorage.removeItem("partnershipValidation")
        sessionStorage.removeItem("partnershipUser")
        toast.success("Plano ativado com sucesso!")
        router.push("/parceiros/login")
      } else {
        toast.error("Erro ao confirmar plano", { description: data.error })
      }
    } catch {
      toast.error("Erro inesperado", { description: "Tente novamente." })
    } finally {
      setConfirming(false)
    }
  }

  const formatPrice = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const getPlanIcon = (planName: string) => {
    if (planName === "smart") return <Zap className="h-6 w-6" />
    if (planName === "pro") return <Crown className="h-6 w-6" />
    return <Rocket className="h-6 w-6" />
  }

  if (loadingPlans || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute inset-0 gradient-bg" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-foreground">Seleção de Plano</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Olá, <strong>{userData.name}</strong>! Escolha seu plano da parceria
          </p>
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-primary text-sm font-medium">Bolsa de Estudo Ativa</p>
            <p className="text-muted-foreground text-sm mt-1">
              Como estudante validado, você tem acesso gratuito ao{" "}
              <strong>Plano Smart</strong> enquanto sua matrícula estiver ativa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all bg-background/80 backdrop-blur-md ${
                selectedPlan === plan.plan_name
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md border-border/60"
              }`}
              onClick={() => setSelectedPlan(plan.plan_name)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getPlanIcon(plan.plan_name)}
                </div>
                <CardTitle className="capitalize">Plano {plan.plan_name}</CardTitle>
                <div>
                  {plan.partnership_price_cents === 0 ? (
                    <>
                      <p className="text-muted-foreground line-through text-sm">
                        {formatPrice(plan.original_price_cents)}
                      </p>
                      <p className="text-2xl font-bold text-green-600">GRATUITO</p>
                      <p className="text-xs text-green-700 font-semibold">
                        Bolsa de Estudo Ativa
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold">{formatPrice(plan.original_price_cents)}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-3">
                  {plan.credits_amount} créditos
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{plan.credits_amount} créditos mensais</span>
                  </div>
                  {plan.partnership_price_cents === 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        Bolsa de estudo ativa
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button onClick={handleConfirm} disabled={confirming} size="lg" className="px-8">
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar Plano"
            )}
          </Button>
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/parceiros/registro")}
              className="text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao cadastro
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
