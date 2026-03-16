import { getFileContent, getRepoContents } from "./github"

type Framework = {
  name: string
  buildCommand: string
  outputDir: string
  installCommand: string
}

const FRAMEWORKS: Record<string, Framework> = {
  nextjs: { name: "Next.js", buildCommand: "npm run build", outputDir: ".next", installCommand: "npm install" },
  vite: { name: "Vite", buildCommand: "npm run build", outputDir: "dist", installCommand: "npm install" },
  astro: { name: "Astro", buildCommand: "npm run build", outputDir: "dist", installCommand: "npm install" },
  cra: { name: "Create React App", buildCommand: "npm run build", outputDir: "build", installCommand: "npm install" },
  html: { name: "HTML Estático", buildCommand: "", outputDir: ".", installCommand: "" },
  php: { name: "PHP", buildCommand: "", outputDir: ".", installCommand: "" },
}

export async function detectFramework(
  token: string,
  owner: string,
  repo: string,
  branch?: string
): Promise<Framework> {
  const pkgContent = await getFileContent(token, owner, repo, "package.json", branch)

  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent)
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }

      if (deps["next"]) return FRAMEWORKS.nextjs
      if (deps["vite"] || deps["@vitejs/plugin-react"]) return FRAMEWORKS.vite
      if (deps["astro"]) return FRAMEWORKS.astro
      if (deps["react-scripts"]) return FRAMEWORKS.cra
    } catch { /* invalid json, continue */ }
  }

  const configChecks = [
    { file: "next.config.js", fw: "nextjs" },
    { file: "next.config.mjs", fw: "nextjs" },
    { file: "next.config.ts", fw: "nextjs" },
    { file: "vite.config.js", fw: "vite" },
    { file: "vite.config.ts", fw: "vite" },
    { file: "astro.config.mjs", fw: "astro" },
  ]

  for (const check of configChecks) {
    const content = await getFileContent(token, owner, repo, check.file, branch)
    if (content) return FRAMEWORKS[check.fw]
  }

  try {
    const rootFiles = await getRepoContents(token, owner, repo, "", branch)
    if (Array.isArray(rootFiles)) {
      const names = rootFiles.map((f: any) => f.name.toLowerCase())
      if (names.some((n) => n.endsWith(".php"))) return FRAMEWORKS.php
      if (names.includes("index.html")) return FRAMEWORKS.html
    }
  } catch { /* empty repo */ }

  return FRAMEWORKS.html
}
