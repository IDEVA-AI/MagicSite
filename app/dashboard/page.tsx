import { DashboardHeader } from "@/components/dashboard/header"
import { CreditBalance } from "@/components/dashboard/credit-balance"
import { ProjectsList } from "@/components/dashboard/projects-list"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Gerencie seus projetos e créditos</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <CreditBalance />
          <QuickActions />
        </div>

        <ProjectsList />
      </main>
    </div>
  )
}
