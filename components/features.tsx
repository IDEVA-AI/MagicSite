import { Card } from "@/components/ui/card"
import { Brain, Zap, Target, FileText, Download, Shield } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Análise Estratégica IA",
    description: "47 variáveis inteligentes analisam seu negócio em profundidade, muito além dos concorrentes.",
  },
  {
    icon: Zap,
    title: "Geração em Minutos",
    description: "Site completo em 10 minutos. Economize semanas de trabalho e milhares de reais.",
  },
  {
    icon: Target,
    title: "Conteúdo Persuasivo",
    description: "14 seções otimizadas com copywriting profissional e estratégias de conversão.",
  },
  {
    icon: FileText,
    title: "Briefing Completo",
    description: "Receba análise de mercado, personas, proposta de valor e posicionamento estratégico.",
  },
  {
    icon: Download,
    title: "Export Profissional",
    description: "Baixe em PDF organizado, pronto para implementação ou apresentação ao cliente.",
  },
  {
    icon: Shield,
    title: "Sistema de Créditos",
    description: "Controle total do uso. Pague apenas pelo que usar, sem surpresas na fatura.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Recursos que fazem a diferença</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tecnologia de ponta para criar sites que realmente convertem
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card hover:bg-card/80 transition-colors border-border/40">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
