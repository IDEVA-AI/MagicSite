"use client"

import { use } from "react"
import { useDeployProject } from "@/hooks/use-deploy-project"
import { DeployStatusBadge } from "@/components/deploy/deploy-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, GitBranch, Globe, ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"

export default function DeployProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { project, deploys, loading, reload } = useDeployProject(id)

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
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <DeployStatusBadge status={deploy.conclusion || deploy.status} />
                      <span className="text-sm font-mono text-muted-foreground">
                        {deploy.head_sha?.slice(0, 7)}
                      </span>
                    </div>
                    {deploy.commit_message && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {deploy.commit_message}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {deploy.completed_at
                      ? new Date(deploy.completed_at).toLocaleString("pt-BR")
                      : deploy.started_at
                        ? "Em andamento..."
                        : new Date(deploy.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
