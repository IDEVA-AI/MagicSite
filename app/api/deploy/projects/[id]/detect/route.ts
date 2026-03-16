import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { detectFramework } from "@/lib/deploy/detection"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  await supabase.from("deploy_projects").update({ status: "detecting", updated_at: new Date().toISOString() }).eq("id", id)

  try {
    const token = decrypt(project.deploy_github_connections.encrypted_token)
    const fw = await detectFramework(token, project.github_repo_owner, project.github_repo_name, project.selected_branch)

    const { data: updated } = await supabase
      .from("deploy_projects")
      .update({
        framework_detected: fw.name,
        build_command: fw.buildCommand,
        output_dir: fw.outputDir,
        install_command: fw.installCommand,
        status: "detected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    return NextResponse.json(updated)
  } catch (err: any) {
    await supabase.from("deploy_projects").update({ status: "error", error_message: err.message, updated_at: new Date().toISOString() }).eq("id", id)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
