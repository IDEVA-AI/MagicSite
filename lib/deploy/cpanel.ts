type CpanelAuth = {
  host: string
  port: number
  username: string
  password: string // API Token
}

async function cpanelApi(auth: CpanelAuth, module: string, func: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${auth.host}:${auth.port}/execute/${module}/${func}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `cpanel ${auth.username}:${auth.password}`,
    },
  })

  if (!response.ok) {
    throw new Error(`cPanel API error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  console.log(`[cPanel API] ${module}::${func}`, JSON.stringify({
    status: result.status,
    errors: result.errors,
    messages: result.messages,
    warnings: result.warnings,
    metadata: result.metadata,
    hasData: !!result.data,
  }))

  if (result.errors?.length) {
    throw new Error(`cPanel: ${result.errors.join(", ")}`)
  }

  // UAPI can return status 0 with errors in messages
  if (result.status === 0) {
    const msg = result.messages?.join(", ") || result.statusmsg || "Operação falhou no cPanel"
    throw new Error(`cPanel: ${msg}`)
  }

  return result.data
}

export async function testConnection(auth: CpanelAuth): Promise<boolean> {
  try {
    await cpanelApi(auth, "Email", "list_pops")
    return true
  } catch {
    return false
  }
}

export type DomainInfo = {
  domain: string
  documentroot: string
  type: string
}

export async function listDomains(auth: CpanelAuth): Promise<DomainInfo[]> {
  const data = await cpanelApi(auth, "DomainInfo", "domains_data", { format: "list" })
  return (data || []).map((d: any) => ({
    domain: d.domain,
    documentroot: d.documentroot || "/public_html",
    type: d.domain_type || "main",
  }))
}

export type FtpAccount = {
  user: string   // full login username (e.g. "julio861_deploy_repo" or "deploy_repo@domain.com")
  homedir: string
}

export async function listFtpAccounts(auth: CpanelAuth): Promise<FtpAccount[]> {
  const data = await cpanelApi(auth, "Ftp", "list_ftp", {})
  return (data || []).map((a: any) => ({
    user: a.user,
    homedir: a.homedir || a.dir || "",
  }))
}

export async function createFtpAccount(
  auth: CpanelAuth,
  ftpUser: string,
  ftpPass: string,
  directory: string
): Promise<{ server: string; username: string; path: string }> {
  await cpanelApi(auth, "Ftp", "add_ftp", {
    user: ftpUser,
    pass: ftpPass,
    homedir: directory,
    quota: "0",
  })

  // Get the real FTP username from cPanel (may be prefixed with cpanel user)
  const accounts = await listFtpAccounts(auth)
  const match = accounts.find((a) => a.user.includes(ftpUser))
  const realUsername = match?.user || `${ftpUser}@${auth.host}`

  console.log("[cPanel] FTP account created, real username:", realUsername)

  return {
    server: auth.host,
    username: realUsername,
    path: "./",
  }
}

export async function findFtpAccount(
  auth: CpanelAuth,
  ftpUserPattern: string
): Promise<FtpAccount | null> {
  const accounts = await listFtpAccounts(auth)
  return accounts.find((a) => a.user.includes(ftpUserPattern)) || null
}

export async function changeFtpPassword(
  auth: CpanelAuth,
  ftpUser: string,
  newPassword: string
): Promise<void> {
  // ftpUser here is the short username (without @host)
  const shortUser = ftpUser.includes("@") ? ftpUser.split("@")[0] : ftpUser
  await cpanelApi(auth, "Ftp", "passwd", {
    user: shortUser,
    pass: newPassword,
  })
}

export async function createSubdomain(auth: CpanelAuth, subdomain: string, domain: string) {
  await cpanelApi(auth, "SubDomain", "addsubdomain", {
    domain: subdomain,
    rootdomain: domain,
    dir: `/public_html/${subdomain}.${domain}`,
  })
}
