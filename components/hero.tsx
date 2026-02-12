import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 tech-grid" />
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="absolute inset-0 gradient-bg" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg glow-border bg-background/50 backdrop-blur-sm mb-8">
            <Zap className="h-5 w-5 text-primary tech-pulse" />
            <span className="text-sm font-mono font-semibold text-primary tracking-wide">POWERED BY iDEVA.AI </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
              Crie sites
              <br />
              <span className="gradient-text">profissionais</span>
              <br />
              em minutos
            </h1>

            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-1 h-24 bg-gradient-to-b from-primary to-accent rounded-full flex-shrink-0" />
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                A plataforma de IA que gera sites completos e estratégicos para seu negócio.{" "}
                <span className="text-foreground font-bold">50-100x mais barato</span> e{" "}
                <span className="text-foreground font-bold">40-60x mais rápido</span> que agências tradicionais.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 mt-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 font-bold shadow-lg hover:shadow-xl transition-all h-auto"
              asChild
            >
              <Link href="/signup">
                Começar Agora
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 font-bold border-2 hover:bg-primary/5 h-auto bg-transparent"
              asChild
            >
              <Link href="#how-it-works">Ver Como Funciona</Link>
            </Button>
          </div>

          <div className="mt-16 terminal-block rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Sistema Online</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-primary">15+</div>
                <div className="text-sm font-mono font-semibold text-foreground/70">Usuários Ativos</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-accent">68</div>
                <div className="text-sm font-mono font-semibold text-foreground/70">Projetos Criados</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold font-mono text-[oklch(0.55_0.1_160)]">100%</div>
                <div className="text-sm font-mono font-semibold text-foreground/70">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
