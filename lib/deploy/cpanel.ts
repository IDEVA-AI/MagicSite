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

  const data = await response.json()
  if (data.errors?.length) {
    throw new Error(`cPanel: ${data.errors.join(", ")}`)
  }

  return data.data
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

  return {
    server: auth.host,
    username: `${ftpUser}@${auth.host}`,
    path: directory.endsWith("/") ? directory : directory + "/",
  }
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
