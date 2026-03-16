import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { createGitHubClient } from "@/lib/deploy/github"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*, deploy_github_connections!inner(encrypted_token)")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })

  try {
    const token = decrypt(project.deploy_github_connections.encrypted_token)
    const octokit = createGitHubClient(token)

    const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner: project.github_repo_owner,
      repo: project.github_repo_name,
      per_page: 5,
    })

    const runs = data.workflow_runs.map((run) => ({
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
      created_at: run.created_at,
    }))

    return NextResponse.json({ runs })
  } catch (err: any) {
    return NextResponse.json({ runs: [], error: err.message })
  }
}
