import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para criar seu site?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a 15+ profissionais que já estão criando sites profissionais em minutos
          </p>
          <Button size="lg" className="text-base" asChild>
            <Link href="/signup">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Sem cartão de crédito necessário. Comece agora mesmo.</p>
        </div>
      </div>
    </section>
  )
}
