"use client"

import { use, useState } from "react"
import { useDeployProject } from "@/hooks/use-deploy-project"
import { DeployStatusBadge } from "@/components/deploy/deploy-status-badge"
import { ProvisionProgress } from "@/components/deploy/provision-progress"
import { SubdomainManager } from "@/components/deploy/subdomain-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, GitBranch, Globe, ExternalLink, RefreshCw, Loader2, Rocket, Server } from "lucide-react"
import Link from "next/link"

export default function DeployProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { project, deploys, loading, reload } = useDeployProject(id)
  const [showDeploy, setShowDeploy] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Link href="/app/deploy">
          <Button variant="link">Voltar</Button>
        </Link>
      </div>
    )
  }

  const repoUrl = `https://github.com/${project.github_repo_owner}/${project.github_repo_name}`

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/deploy">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <DeployStatusBadge status={project.status} />
            </div>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              {project.github_repo_owner}/{project.github_repo_name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={reload} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="deploy">
        <TabsList>
          <TabsTrigger value="deploy" className="gap-1.5">
            <Rocket className="w-4 h-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="server" className="gap-1.5">
            <Server className="w-4 h-4" />
            Servidor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="font-medium">{project.framework_detected || "Não detectado"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Domínio</p>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{project.domain || "Não configurado"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Branch</p>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{project.selected_branch}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {project.build_command && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuração de Build</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Instalação</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.install_command}</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Build</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.build_command}</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Output</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.output_dir}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Deploy</CardTitle>
                {!showDeploy && (
                  <Button size="sm" onClick={() => setShowDeploy(true)} className="gap-2">
                    <Rocket className="w-4 h-4" />
                    Fazer Deploy
                  </Button>
                )}
              </div>
            </CardHeader>
            {showDeploy && (
              <CardContent>
                <ProvisionProgress
                  projectId={id}
                  repoFullName={`${project.github_repo_owner}/${project.github_repo_name}`}
                  domain={project.domain}
                  onComplete={() => reload()}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de Deploys</CardTitle>
            </CardHeader>
            <CardContent>
              {deploys.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum deploy registrado. Faça um push no branch <code>{project.selected_branch}</code> para iniciar.
                </p>
              ) : (
                <div className="divide-y">
                  {deploys.map((deploy) => (
                    <div key={deploy.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <DeployStatusBadge status={deploy.conclusion || deploy.status} />
                        <span className="text-sm text-muted-foreground">
                          Run #{deploy.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(deploy.created_at).toLocaleString("pt-BR")}
                        </span>
                        {deploy.html_url && (
                          <a href={deploy.html_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-6 mt-4">
          <SubdomainManager projectId={id} cpanelCredentialId={project.cpanel_credential_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
