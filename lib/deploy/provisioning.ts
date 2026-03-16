import { createClient } from "@supabase/supabase-js"
import { createFtpAccount, changeFtpPassword } from "./cpanel"
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

export type ProgressCallback = (step: string, status: "running" | "done" | "error", detail?: string) => void

export async function provisionProject(input: ProvisionInput, onProgress?: ProgressCallback): Promise<void> {
  const {
    projectId, githubToken, cpanelAuth, repoOwner, repoName, branch,
    buildCommand, outputDir, installCommand, nodeVersion, deployPath, cpanelCredentialId
  } = input

  const emit = onProgress || (() => {})
  await updateProjectStatus(projectId, "provisioning")

  try {
    // Step 1: Create or reuse FTP account
    emit("ftp", "running", "Verificando conta FTP...")
    let ftpUsername: string
    let ftpPassword: string
    let ftpServer: string
    let ftpPath: string

    // Check if FTP account already exists for this project
    const { data: existingFtp } = await supabaseAdmin
      .from("deploy_ftp_accounts")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle()

    if (existingFtp) {
      // Reuse existing FTP account — generate new password and update on cPanel
      ftpUsername = existingFtp.ftp_username
      ftpServer = existingFtp.ftp_server
      ftpPath = existingFtp.ftp_path
      ftpPassword = generatePassword()
      emit("ftp", "running", "Atualizando senha FTP no cPanel...")
      await changeFtpPassword(cpanelAuth, ftpUsername, ftpPassword)
    } else {
      // Create new FTP account
      ftpPassword = generatePassword()
      const ftpUser = `deploy_${repoName.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`

      try {
        const ftp = await createFtpAccount(cpanelAuth, ftpUser, ftpPassword, deployPath)
        ftpUsername = ftp.username
        ftpServer = ftp.server
        ftpPath = ftp.path
      } catch (err: any) {
        // If FTP user already exists in cPanel, reuse it and update password
        if (err.message?.includes("already exists") || err.message?.includes("Já existe")) {
          ftpUsername = `${ftpUser}@${cpanelAuth.host}`
          ftpServer = cpanelAuth.host
          ftpPath = deployPath.endsWith("/") ? deployPath : deployPath + "/"
          emit("ftp", "running", "Conta FTP já existe, atualizando senha...")
          await changeFtpPassword(cpanelAuth, ftpUsername, ftpPassword)
        } else {
          throw err
        }
      }

      await supabaseAdmin.from("deploy_ftp_accounts").upsert({
        project_id: projectId,
        cpanel_credential_id: cpanelCredentialId,
        ftp_username: ftpUsername,
        ftp_server: ftpServer,
        ftp_path: ftpPath,
      }, { onConflict: "project_id" })
    }

    console.log("[Provision] FTP credentials:", {
      server: ftpServer,
      username: ftpUsername,
      path: ftpPath,
      passwordLength: ftpPassword.length,
      passwordPreview: ftpPassword.slice(0, 4) + "...",
    })
    emit("ftp", "done", `FTP: ${ftpUsername}`)

    // Step 2: Set GitHub repo secrets
    emit("secrets", "running", "Enviando FTP_SERVER...")
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_SERVER", ftpServer)
    emit("secrets", "running", "Enviando FTP_USERNAME...")
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_USERNAME", ftpUsername)
    emit("secrets", "running", "Enviando FTP_PASSWORD...")
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_PASSWORD", ftpPassword)
    emit("secrets", "running", "Enviando FTP_PATH...")
    await setRepoSecret(githubToken, repoOwner, repoName, "FTP_PATH", ftpPath)
    emit("secrets", "done", "4 secrets configurados")

    // Step 3: Commit workflow YAML
    emit("workflow", "running", "Gerando workflow...")
    const workflowYaml = generateDeployWorkflow({
      buildCommand, outputDir, installCommand, nodeVersion, branch,
    })

    emit("workflow", "running", "Commitando .github/workflows/deploy.yml...")
    await createOrUpdateFile(
      githubToken,
      repoOwner,
      repoName,
      ".github/workflows/deploy.yml",
      workflowYaml,
      "ci: add automated deploy workflow [MagicDeploy]",
      branch
    )
    emit("workflow", "done", "Workflow commitado — deploy iniciado!")

    await updateProjectStatus(projectId, "provisioned")
  } catch (err: any) {
    await updateProjectStatus(projectId, "error", err.message)
    throw err
  }
}

function generatePassword(length = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}
