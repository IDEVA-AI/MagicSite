"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Zap, TrendingUp, Crown } from "lucide-react"
import { useCredits } from "@/hooks/use-credits"

export default function PlanPage() {
  const { credits, loading, error } = useCredits()

  const currentPlan = {
    name: "Pro",
    credits: credits.remaining_credits ?? 0,
    totalCredits: credits.total_credits ?? 0,
    renewDate: "2024-02-15",
    price: 49,
  }

  const creditsProgress = currentPlan.totalCredits > 0 ? (currentPlan.credits / currentPlan.totalCredits) * 100 : 0
  const possibleSites = currentPlan.totalCredits > 0 ? Math.floor(currentPlan.credits / 20) : 0

  const plans = [
    {
      name: "Smart",
      price: 27,
      credits: 100,
      features: [
        "100 créditos/mês",
        "5 sites completos",
        "Análise estratégica IA",
        "14 seções de conteúdo",
        "Export em PDF",
        "Suporte por email",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: 49,
      credits: 200,
      features: [
        "200 créditos/mês",
        "10 sites completos",
        "Análise estratégica IA",
        "14 seções de conteúdo",
        "Export em PDF e HTML",
        "Suporte prioritário",
        "Templates premium",
      ],
      popular: true,
    },
    {
      name: "Plus",
      price: 97,
      credits: 500,
      features: [
        "500 créditos/mês",
        "25 sites completos",
        "Análise estratégica IA",
        "14 seções de conteúdo",
        "Export em PDF e HTML",
        "Suporte VIP 24/7",
        "Templates premium",
        "API de integração",
        "White label",
      ],
      popular: false,
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plano & Créditos</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e créditos disponíveis</p>
        {error && <p className="text-sm text-destructive mt-2">Não foi possível atualizar o saldo: {error}</p>}
      </div>

      {/* Current Usage */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[oklch(0.58_0.14_60)]" />
                Plano Atual: {currentPlan.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Renova em {new Date(currentPlan.renewDate).toLocaleDateString("pt-BR")}
              </CardDescription>
            </div>
            <Badge className="bg-primary hover:bg-primary/90">R$ {currentPlan.price}/mês</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Créditos Disponíveis</span>
              <span className="text-2xl font-bold">
                {loading ? "..." : `${currentPlan.credits} / ${currentPlan.totalCredits}`}
              </span>
            </div>
            <Progress value={loading ? 0 : creditsProgress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {loading ? "Sincronizando créditos..." : `Você pode criar até ${possibleSites} sites completos`}
            </span>
            <Button variant="outline" size="sm">
              Comprar Créditos Extras
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Escolha seu Plano</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-2 border-primary relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Mais Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {plan.name === "Plus" && <Crown className="w-6 h-6 text-[oklch(0.58_0.14_60)]" />}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <Zap className="w-4 h-4 text-[oklch(0.58_0.14_60)]" />
                  {plan.credits} créditos/mês
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[oklch(0.55_0.1_160)] shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.name === currentPlan.name ? "outline" : "default"}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? "Plano Atual" : "Fazer Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Histórico de Uso
          </CardTitle>
          <CardDescription>Seus gastos de créditos nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Projetos Criados</p>
                <p className="text-sm text-muted-foreground">Fase 1</p>
              </div>
              <div className="text-right">
                <p className="font-bold">12 projetos</p>
                <p className="text-sm text-muted-foreground">60 créditos</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Briefings Gerados</p>
                <p className="text-sm text-muted-foreground">Fase 2</p>
              </div>
              <div className="text-right">
                <p className="font-bold">10 briefings</p>
                <p className="text-sm text-muted-foreground">100 créditos</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Conteúdos Criados</p>
                <p className="text-sm text-muted-foreground">Fase 3</p>
              </div>
              <div className="text-right">
                <p className="font-bold">8 conteúdos</p>
                <p className="text-sm text-muted-foreground">40 créditos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
