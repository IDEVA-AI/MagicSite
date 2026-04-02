# Subdomain Management UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Servidor" tab to the deploy project detail page with subdomain listing and creation via cPanel API.

**Architecture:** Add `listSubdomains` to existing `cpanel.ts`. Create one API route (`subdomains/route.ts`) handling GET (list) and POST (create). Refactor the detail page to use shadcn Tabs, moving current content into "Deploy" tab and adding new "Servidor" tab with a `SubdomainManager` component.

**Tech Stack:** Next.js App Router, shadcn/ui Tabs, cPanel UAPI (`SubDomain::list`, `SubDomain::addsubdomain`), Supabase (auth + credentials lookup)

---

### Task 1: Add `listSubdomains` to cPanel lib

**Files:**
- Modify: `lib/deploy/cpanel.ts:144-150`

- [ ] **Step 1: Add `listSubdomains` function above `createSubdomain`**

```typescript
export type SubdomainInfo = {
  subdomain: string
  domain: string
  fullDomain: string
  documentroot: string
}

export async function listSubdomains(auth: CpanelAuth): Promise<SubdomainInfo[]> {
  const data = await cpanelApi(auth, "SubDomain", "list", {})
  return (data || []).map((s: any) => ({
    subdomain: s.subdomain || s.relname || "",
    domain: s.rootdomain || s.domain || "",
    fullDomain: s.domain || `${s.subdomain}.${s.rootdomain}`,
    documentroot: s.dir || s.documentroot || "",
  }))
}
```

- [ ] **Step 2: Update `createSubdomain` to return the created subdomain info**

```typescript
export async function createSubdomain(
  auth: CpanelAuth,
  subdomain: string,
  domain: string
): Promise<SubdomainInfo> {
  const dir = `/public_html/${subdomain}.${domain}`
  await cpanelApi(auth, "SubDomain", "addsubdomain", {
    domain: subdomain,
    rootdomain: domain,
    dir,
  })
  return {
    subdomain,
    domain,
    fullDomain: `${subdomain}.${domain}`,
    documentroot: dir,
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/deploy/cpanel.ts
git commit -m "feat(cpanel): add listSubdomains and improve createSubdomain return type"
```

---

### Task 2: Create subdomains API route

**Files:**
- Create: `app/api/deploy/projects/[id]/subdomains/route.ts`

This route reuses the same pattern as `deploys/route.ts` — fetches the project, gets cPanel credentials, calls cpanel lib.

- [ ] **Step 1: Create the route file**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { listSubdomains, createSubdomain } from "@/lib/deploy/cpanel"

async function getCpanelAuth(supabase: any, project: any) {
  const { data: cred } = await supabase
    .from("deploy_cpanel_credentials")
    .select("*")
    .eq("id", project.cpanel_credential_id)
    .single()

  if (!cred) return null

  return {
    host: cred.host,
    port: cred.port,
    username: cred.username,
    password: decrypt(cred.encrypted_password),
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })
  if (!project.cpanel_credential_id) {
    return NextResponse.json({ error: "Servidor cPanel não configurado." }, { status: 400 })
  }

  const auth = await getCpanelAuth(supabase, project)
  if (!auth) return NextResponse.json({ error: "Credencial cPanel não encontrada." }, { status: 404 })

  try {
    const subdomains = await listSubdomains(auth)
    return NextResponse.json({ data: subdomains })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { subdomain } = await request.json()
  if (!subdomain || typeof subdomain !== "string") {
    return NextResponse.json({ error: "Nome do subdomínio é obrigatório." }, { status: 400 })
  }

  // Validate subdomain format: only lowercase alphanumeric and hyphens
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
    return NextResponse.json({ error: "Subdomínio inválido. Use apenas letras minúsculas, números e hífens." }, { status: 400 })
  }

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })
  if (!project.cpanel_credential_id || !project.domain) {
    return NextResponse.json({ error: "Servidor cPanel ou domínio não configurado." }, { status: 400 })
  }

  const auth = await getCpanelAuth(supabase, project)
  if (!auth) return NextResponse.json({ error: "Credencial cPanel não encontrada." }, { status: 404 })

  try {
    const result = await createSubdomain(auth, subdomain, project.domain)
    return NextResponse.json({ data: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/deploy/projects/\[id\]/subdomains/route.ts
git commit -m "feat(api): add subdomains route for list and create via cPanel"
```

---

### Task 3: Create SubdomainManager component

**Files:**
- Create: `components/deploy/subdomain-manager.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Globe, FolderOpen } from "lucide-react"
import { toast } from "sonner"

type SubdomainInfo = {
  subdomain: string
  domain: string
  fullDomain: string
  documentroot: string
}

export function SubdomainManager({ projectId, domain }: { projectId: string; domain: string | null }) {
  const [subdomains, setSubdomains] = useState<SubdomainInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSubdomains(json.data || [])
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar subdomínios")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/deploy/projects/${projectId}/subdomains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: newName.trim().toLowerCase() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Subdomínio ${json.data.fullDomain} criado!`)
      setNewName("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar subdomínio")
    } finally {
      setCreating(false)
    }
  }

  if (!domain) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Domínio não configurado para este projeto.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subdomínios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="max-w-[200px]"
          />
          <span className="text-sm text-muted-foreground">.{domain}</span>
          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-1">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : subdomains.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum subdomínio encontrado no servidor.
          </p>
        ) : (
          <div className="divide-y">
            {subdomains.map((s) => (
              <div key={s.fullDomain} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.fullDomain}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {s.documentroot}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/deploy/subdomain-manager.tsx
git commit -m "feat(ui): add SubdomainManager component"
```

---

### Task 4: Add tabs to project detail page

**Files:**
- Modify: `app/app/deploy/[id]/page.tsx`

- [ ] **Step 1: Refactor page to use Tabs**

Replace the entire file with the tabbed version. The "Deploy" tab contains all existing content. The "Servidor" tab contains the `SubdomainManager`.

```tsx
"use client"

import { use, useState } from "react"
import { useDeployProject } from "@/hooks/use-deploy-project"
import { DeployStatusBadge } from "@/components/deploy/deploy-status-badge"
import { ProvisionProgress } from "@/components/deploy/provision-progress"
import { SubdomainManager } from "@/components/deploy/subdomain-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, GitBranch, Globe, ExternalLink, RefreshCw, Loader2, Rocket, Server } from "lucide-react"
import Link from "next/link"

export default function DeployProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { project, deploys, loading, reload } = useDeployProject(id)
  const [showDeploy, setShowDeploy] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Link href="/app/deploy">
          <Button variant="link">Voltar</Button>
        </Link>
      </div>
    )
  }

  const repoUrl = `https://github.com/${project.github_repo_owner}/${project.github_repo_name}`

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/deploy">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <DeployStatusBadge status={project.status} />
            </div>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              {project.github_repo_owner}/{project.github_repo_name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={reload} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="deploy">
        <TabsList>
          <TabsTrigger value="deploy" className="gap-1.5">
            <Rocket className="w-4 h-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="server" className="gap-1.5">
            <Server className="w-4 h-4" />
            Servidor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="font-medium">{project.framework_detected || "Não detectado"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Domínio</p>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{project.domain || "Não configurado"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground">Branch</p>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{project.selected_branch}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {project.build_command && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuração de Build</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Instalação</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.install_command}</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Build</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.build_command}</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Output</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{project.output_dir}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Deploy</CardTitle>
                {!showDeploy && (
                  <Button size="sm" onClick={() => setShowDeploy(true)} className="gap-2">
                    <Rocket className="w-4 h-4" />
                    Fazer Deploy
                  </Button>
                )}
              </div>
            </CardHeader>
            {showDeploy && (
              <CardContent>
                <ProvisionProgress
                  projectId={id}
                  repoFullName={`${project.github_repo_owner}/${project.github_repo_name}`}
                  domain={project.domain}
                  onComplete={() => reload()}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de Deploys</CardTitle>
            </CardHeader>
            <CardContent>
              {deploys.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum deploy registrado. Faça um push no branch <code>{project.selected_branch}</code> para iniciar.
                </p>
              ) : (
                <div className="divide-y">
                  {deploys.map((deploy) => (
                    <div key={deploy.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <DeployStatusBadge status={deploy.conclusion || deploy.status} />
                        <span className="text-sm text-muted-foreground">
                          Run #{deploy.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(deploy.created_at).toLocaleString("pt-BR")}
                        </span>
                        {deploy.html_url && (
                          <a href={deploy.html_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-6 mt-4">
          <SubdomainManager projectId={id} domain={project.domain} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/app/deploy/\[id\]/page.tsx
git commit -m "feat(ui): add tabs to project detail with Servidor tab for subdomain management"
```

---

### Task 5: Verify build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors related to the new files.

- [ ] **Step 2: Final commit (if any fixes needed)**
