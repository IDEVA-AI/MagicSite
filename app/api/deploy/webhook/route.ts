import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.DEPLOY_GITHUB_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-hub-signature-256")
  const event = request.headers.get("x-github-event")

  if (process.env.DEPLOY_GITHUB_WEBHOOK_SECRET && !verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  if (event !== "workflow_run") {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const payload = JSON.parse(body)
  const { workflow_run, repository } = payload

  if (!workflow_run || !repository) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { data: project } = await supabaseAdmin
    .from("deploy_projects")
    .select("id")
    .eq("github_repo_id", repository.id)
    .is("deleted_at", null)
    .maybeSingle()

  if (!project) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no matching project" })
  }

  let status = workflow_run.status
  if (status === "completed" && workflow_run.conclusion === "failure") {
    status = "failure"
  }

  await supabaseAdmin.from("deploy_runs").upsert({
    project_id: project.id,
    github_run_id: workflow_run.id,
    status,
    conclusion: workflow_run.conclusion,
    head_sha: workflow_run.head_sha,
    commit_message: workflow_run.head_commit?.message || null,
    started_at: workflow_run.run_started_at,
    completed_at: status === "completed" || status === "failure" ? workflow_run.updated_at : null,
  }, { onConflict: "github_run_id" })

  return NextResponse.json({ ok: true, project_id: project.id })
}
