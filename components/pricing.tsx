import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Smart",
    price: "R$ 27",
    period: "/mês",
    credits: "200 créditos/mês",
    description: "Ideal para freelancers e pequenos negócios",
    features: [
      "~10 sites completos/mês",
      "Análise estratégica completa",
      "Geração de conteúdo IA",
      "Export em PDF",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    credits: "500 créditos/mês",
    description: "Para agências e profissionais",
    features: [
      "~25 sites completos/mês",
      "Análise estratégica completa",
      "Geração de conteúdo IA",
      "Export em PDF",
      "Suporte prioritário",
      "Acesso antecipado a novos recursos",
    ],
    popular: true,
  },
  {
    name: "Plus",
    price: "R$ 97",
    period: "/mês",
    credits: "1200 créditos/mês",
    description: "Para grandes volumes e empresas",
    features: [
      "~60 sites completos/mês",
      "Análise estratégica completa",
      "Geração de conteúdo IA",
      "Export em PDF",
      "Suporte VIP 24/7",
      "Acesso antecipado a novos recursos",
      "Consultoria estratégica mensal",
    ],
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Planos que cabem no seu bolso</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu volume de trabalho
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 bg-card border-border/40 relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-primary font-semibold mb-2">{plan.credits}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                <Link href="/signup">Começar Agora</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 7 dias de garantia. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  )
}
