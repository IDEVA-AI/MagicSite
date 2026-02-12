"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, RefreshCw, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useCredits } from "@/hooks/use-credits"

export function CreditBalance() {
  const { credits, loading, error, reload } = useCredits()

  const totalCredits = credits.total_credits ?? 0
  const usedCredits = credits.used_credits ?? 0
  const remainingCredits = credits.remaining_credits ?? 0
  const percentageRemaining = totalCredits > 0 ? (remainingCredits / totalCredits) * 100 : 0
  const estimatedSites = totalCredits > 0 ? Math.max(0, Math.floor(remainingCredits / 20)) : 0
  const headerSubtitle = loading ? "Sincronizando saldo..." : error || "Plano ativo"

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Saldo de Créditos</h2>
          </div>
          <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/billing">Upgrade</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">{loading ? "..." : remainingCredits}</span>
            <span className="text-muted-foreground">/ {loading ? "--" : totalCredits} créditos</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${loading ? 0 : percentageRemaining}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Usados este mês</p>
            <p className="text-2xl font-semibold">{loading ? "--" : usedCredits}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sites possíveis com saldo</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{loading ? "--" : estimatedSites}</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
