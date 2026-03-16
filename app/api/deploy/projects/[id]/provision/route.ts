import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { provisionProject } from "@/lib/deploy/provisioning"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*, deploy_github_connections!inner(encrypted_token), deploy_cpanel_credentials!inner(*)")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })
  if (!project.domain) return NextResponse.json({ error: "Domínio não configurado." }, { status: 400 })

  try {
    const token = decrypt(project.deploy_github_connections.encrypted_token)
    const cpanelPassword = decrypt(project.deploy_cpanel_credentials.encrypted_password)

    await provisionProject({
      projectId: id,
      githubToken: token,
      cpanelAuth: {
        host: project.deploy_cpanel_credentials.host,
        port: project.deploy_cpanel_credentials.port,
        username: project.deploy_cpanel_credentials.username,
        password: cpanelPassword,
      },
      repoOwner: project.github_repo_owner,
      repoName: project.github_repo_name,
      branch: project.selected_branch,
      buildCommand: project.build_command || "",
      outputDir: project.output_dir || "dist",
      installCommand: project.install_command || "npm install",
      nodeVersion: project.node_version || "20",
      domain: project.domain,
      deployPath: project.deploy_path || "/public_html",
      cpanelCredentialId: project.deploy_cpanel_credentials.id,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
