import { CreateProjectWizard } from "@/components/create/wizard"

export default function WizardPage() {
  return (
    <div className="min-h-screen gradient-bg tech-grid">
      <div className="container max-w-6xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <CreateProjectWizard />
      </div>
    </div>
  )
}
