import { Card } from "@/components/ui/card"
import { FileEdit, Brain, Sparkles, Download } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: FileEdit,
    title: "Conte sobre seu negócio",
    description: "Preencha um formulário simples com informações básicas do seu negócio.",
    time: "5 min",
    credits: "5 créditos",
  },
  {
    number: "02",
    icon: Brain,
    title: "Análise Estratégica IA",
    description: "Nossa IA analisa 47 variáveis e cria um mapa estratégico completo.",
    time: "2 min",
    credits: "10 créditos",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Criação de Conteúdo",
    description: "IA escreve 14 seções do site com copywriting profissional e persuasivo.",
    time: "3 min",
    credits: "5 créditos",
  },
  {
    number: "04",
    icon: Download,
    title: "Download PDF",
    description: "Baixe seu site completo em PDF organizado, pronto para implementação.",
    time: "1 min",
    credits: "GRÁTIS",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Como funciona</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            4 etapas simples para ter seu site profissional pronto
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 bg-card border-border/40 relative">
              <div className="absolute -top-4 left-6 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
                {step.number}
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 mt-2">
                <step.icon className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{step.time}</span>
                <span className={step.credits === "GRÁTIS" ? "text-green-500 font-semibold" : "text-primary"}>
                  {step.credits}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Total:</span> ~10 minutos do seu tempo + 20 créditos (10% da
            cota mensal)
          </p>
        </div>
      </div>
    </section>
  )
}
