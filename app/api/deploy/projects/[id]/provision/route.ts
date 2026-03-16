import { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { provisionProject } from "@/lib/deploy/provisioning"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autorizado." }), { status: 401, headers: { "Content-Type": "application/json" } })
  }

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*, deploy_github_connections!inner(encrypted_token), deploy_cpanel_credentials!inner(*)")
    .eq("id", id)
    .single()

  if (!project) {
    return new Response(JSON.stringify({ error: "Projeto não encontrado." }), { status: 404, headers: { "Content-Type": "application/json" } })
  }
  if (!project.domain) {
    return new Response(JSON.stringify({ error: "Domínio não configurado." }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  const token = decrypt(project.deploy_github_connections.encrypted_token)
  const cpanelPassword = decrypt(project.deploy_cpanel_credentials.encrypted_password)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        await provisionProject(
          {
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
          },
          (step, status, detail) => {
            send({ step, status, detail })
          }
        )

        send({ done: true })
      } catch (err: any) {
        send({ error: err.message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
