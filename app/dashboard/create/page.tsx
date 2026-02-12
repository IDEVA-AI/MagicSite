import { CreateProjectWizard } from "@/components/create/wizard"
import { DashboardHeader } from "@/components/dashboard/header"

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <CreateProjectWizard />
      </main>
    </div>
  )
}
