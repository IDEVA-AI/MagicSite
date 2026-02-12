import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>

      <div className="space-y-3">
        <Button className="w-full justify-start" asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>

        <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
          <Link href="/dashboard/projects">Ver Todos os Projetos</Link>
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-border/40">
        <p className="text-sm text-muted-foreground mb-2">Custo por projeto</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Criar: 5 créditos
          <br />
          Briefing: 10 créditos
          <br />
          Conteúdo: 5 créditos
          <br />
          Download: Grátis
        </p>
      </div>
    </Card>
  )
}
