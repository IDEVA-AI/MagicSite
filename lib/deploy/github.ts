import { Octokit } from "octokit"

export function createGitHubClient(token: string) {
  return new Octokit({ auth: token })
}

export async function listUserRepos(token: string, page = 1, perPage = 30, search?: string) {
  const octokit = createGitHubClient(token)

  if (search) {
    const { data } = await octokit.rest.search.repos({
      q: `${search} in:name user:@me`,
      per_page: perPage,
      page,
      sort: "updated",
    })
    return data.items.map(mapRepo)
  }

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: perPage,
    page,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member",
  })
  return data.map(mapRepo)
}

export async function getRepoContents(token: string, owner: string, repo: string, path = "", ref?: string) {
  const octokit = createGitHubClient(token)
  const params: any = { owner, repo, path }
  if (ref) params.ref = ref

  const { data } = await octokit.rest.repos.getContent(params)
  return data
}

export async function getFileContent(token: string, owner: string, repo: string, path: string, ref?: string): Promise<string | null> {
  try {
    const data = await getRepoContents(token, owner, repo, path, ref)
    if (!Array.isArray(data) && data.type === "file" && data.content) {
      return Buffer.from(data.content, "base64").toString("utf8")
    }
    return null
  } catch {
    return null
  }
}

export async function setRepoSecret(token: string, owner: string, repo: string, secretName: string, secretValue: string) {
  const octokit = createGitHubClient(token)
  const sodium = await import("tweetsodium")

  const { data: pubKey } = await octokit.rest.actions.getRepoPublicKey({ owner, repo })
  const messageBytes = Buffer.from(secretValue)
  const keyBytes = Buffer.from(pubKey.key, "base64")
  const encryptedBytes = sodium.seal(messageBytes, keyBytes)
  const encrypted = Buffer.from(encryptedBytes).toString("base64")

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: secretName,
    encrypted_value: encrypted,
    key_id: pubKey.key_id,
  })
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string
) {
  const octokit = createGitHubClient(token)

  let sha: string | undefined
  try {
    const existing = await getRepoContents(token, owner, repo, path, branch)
    if (!Array.isArray(existing)) sha = existing.sha
  } catch { /* file doesn't exist yet */ }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
    sha,
  })
}

export async function listWorkflowRuns(token: string, owner: string, repo: string, limit = 10) {
  const octokit = createGitHubClient(token)
  const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    per_page: limit,
  })
  return data.workflow_runs.map((run) => ({
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    head_sha: run.head_sha,
    created_at: run.created_at,
    updated_at: run.updated_at,
  }))
}

function mapRepo(repo: any) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    default_branch: repo.default_branch,
    language: repo.language,
    updated_at: repo.updated_at,
  }
}
