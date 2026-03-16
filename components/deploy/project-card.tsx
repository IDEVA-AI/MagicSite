"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DeployStatusBadge } from "./deploy-status-badge"
import { GitBranch, Globe, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import type { DeployProject } from "@/hooks/use-deploy-projects"

export function DeployProjectCard({
  project,
  onDelete,
}: {
  project: DeployProject
  onDelete: (id: string) => void
}) {
  const repoUrl = `https://github.com/${project.github_repo_owner}/${project.github_repo_name}`

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <Link href={`/app/deploy/${project.id}`} className="block">
              <h3 className="font-semibold text-base truncate hover:text-primary transition-colors">
                {project.name}
              </h3>
            </Link>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <GitBranch className="w-3 h-3" />
              {project.github_repo_owner}/{project.github_repo_name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <DeployStatusBadge status={project.status} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {project.framework_detected && (
            <span className="bg-secondary px-2 py-0.5 rounded">{project.framework_detected}</span>
          )}
          {project.domain && (
            <a
              href={`https://${project.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="w-3 h-3" />
              {project.domain}
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {new Date(project.updated_at).toLocaleDateString("pt-BR")}
          </span>
          <div className="flex gap-1">
            <Link href={`/app/deploy/${project.id}`}>
              <Button variant="ghost" size="sm">Ver detalhes</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => onDelete(project.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
