import { createClient } from "@supabase/supabase-js"
import { createFtpAccount } from "./cpanel"
import { setRepoSecret, createOrUpdateFile } from "./github"
import { generateDeployWorkflow } from "./workflow"

type ProvisionInput = {
  projectId: string
  githubToken: string
  cpanelAuth: { host: string; port: number; username: string; password: string }
  repoOwner: string
  repoName: string
  branch: string
  buildCommand: string
  outputDir: string
  installCommand: string
  nodeVersion: string
  domain: string
  deployPath: string
  cpanelCredentialId: string
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateProjectStatus(projectId: string, status: string, error?: string) {
  await supabaseAdmin
    .from("deploy_projects")
    .update({
      status,
      error_message: error || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
}

export async function provisionProject(input: ProvisionInput): Promise<void> {
  const {
    projectId, githubToken, cpanelAuth, repoOwner, repoName, branch,
    buildCommand, outputDir, installCommand, nodeVersion, deployPath, cpanelCredentialId
  } = input

  await updateProjectStatus(projectId, "provisioning")

  try {
    // Step 1: Create FTP account
    const ftpPassword = generatePassword()
    const ftpUser = `deploy_${repoName.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`
    const ftp = await createFtpAccount(cpanelAuth, ftpUser, ftpPassword, deployPath)

    await supabaseAdmin.from("deploy_ftp_accounts").upsert({
      project_id: projectId,
      cpanel_credential_id: cpanelCredentialId,
      ftp_username: ftp.username,
      ftp_server: ftp.server,
      ftp_path: ftp.path,
    }, { onConflict: "project_id" })

    // Step 2: Set GitHub repo secrets
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_SERVER", ftp.server)
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_USERNAME", ftp.username)
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_PASSWORD", ftpPassword)
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_PATH", ftp.path)

    // Step 3: Commit workflow YAML
    const workflowYaml = generateDeployWorkflow({
      buildCommand, outputDir, installCommand, nodeVersion, branch,
    })

    await createOrUpdateFile(
      githubToken,
      repoOwner,
      repoName,
      ".github/workflows/deploy.yml",
      workflowYaml,
      "ci: add automated deploy workflow [DeployBridge]",
      branch
    )

    await updateProjectStatus(projectId, "provisioned")
  } catch (err: any) {
    await updateProjectStatus(projectId, "error", err.message)
    throw err
  }
}

function generatePassword(length = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}
