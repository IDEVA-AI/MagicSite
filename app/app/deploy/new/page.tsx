"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RepoSelector } from "@/components/deploy/repo-selector"
import { CpanelForm } from "@/components/deploy/cpanel-form"
import { DomainSelector } from "@/components/deploy/domain-selector"
import { ProvisionProgress } from "@/components/deploy/provision-progress"
import { ArrowLeft, ArrowRight, Github, Server, Rocket, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type Repo = { id: number; name: string; full_name: string; owner: string; private: boolean; default_branch: string; language: string | null }

const STEPS = [
  { title: "GitHub", description: "Conecte e selecione o repositório", icon: Github },
  { title: "Servidor", description: "Configure o servidor e domínio", icon: Server },
  { title: "Deploy", description: "Provisione e publique", icon: Rocket },
]

export default function NewDeployProject() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const [githubConnected, setGithubConnected] = useState(false)
  const [githubLoading, setGithubLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)

  const [cpanelCredentials, setCpanelCredentials] = useState<any[]>([])
  const [selectedCpanel, setSelectedCpanel] = useState<any>(null)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [deployPath, setDeployPath] = useState("/public_html")

  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/deploy/github/status")
      .then((r) => r.json())
      .then((data) => setGithubConnected(data.connected))
      .finally(() => setGithubLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/deploy/cpanel/connect")
      .then((r) => r.json())
      .then((data) => setCpanelCredentials(data.data || []))
  }, [])

  const connectGithub = async () => {
    const res = await fetch("/api/deploy/github/auth")
    const { url } = await res.json()
    window.location.href = url
  }

  const handleRepoSelect = async (repo: Repo) => {
    setSelectedRepo(repo)

    const res = await fetch("/api/deploy/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github_repo_owner: repo.owner,
        github_repo_name: repo.name,
        github_repo_id: repo.id,
        default_branch: repo.default_branch,
        name: repo.name,
      }),
    })

    if (res.ok) {
      const project = await res.json()
      setProjectId(project.id)
      setStep(1)
    } else {
      toast.error("Erro ao criar projeto.")
    }
  }

  const handleCpanelNext = async () => {
    if (!projectId || !selectedCpanel || !selectedDomain) return

    await fetch(`/api/deploy/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpanel_credential_id: selectedCpanel.id,
        domain: selectedDomain,
        deploy_path: deployPath,
      }),
    })

    setStep(2)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : router.push("/app/deploy")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Novo Projeto de Deploy</h1>
          <p className="text-muted-foreground text-sm">Passo {step + 1} de {STEPS.length}: {STEPS[step].description}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Conectar GitHub
            </CardTitle>
            <CardDescription>Conecte sua conta e selecione o repositório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {githubLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : !githubConnected ? (
              <Button onClick={connectGithub} className="w-full gap-2">
                <Github className="w-4 h-4" />
                Conectar com GitHub
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  GitHub conectado
                </div>
                <RepoSelector onSelect={handleRepoSelect} />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Servidor cPanel
            </CardTitle>
            <CardDescription>Configure onde o projeto será publicado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CpanelForm
              existingCredentials={cpanelCredentials}
              onConnected={(cred) => {
                setSelectedCpanel(cred)
                if (!cpanelCredentials.find((c: any) => c.id === cred.id)) {
                  setCpanelCredentials([cred, ...cpanelCredentials])
                }
              }}
              onCredentialsChange={setCpanelCredentials}
            />

            {selectedCpanel && (
              <>
                <DomainSelector
                  credentialId={selectedCpanel.id}
                  value={selectedDomain}
                  onChange={(domain, path) => {
                    setSelectedDomain(domain)
                    setDeployPath(path)
                  }}
                />

                {selectedDomain && (
                  <Button onClick={handleCpanelNext} className="w-full gap-2">
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && projectId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Deploy
            </CardTitle>
            <CardDescription>
              Detectamos a stack, configuramos FTP, secrets e workflow automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProvisionProgress
              projectId={projectId}
              repoFullName={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : undefined}
              domain={selectedDomain}
              onComplete={() => {}}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
