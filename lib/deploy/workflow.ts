type WorkflowConfig = {
  buildCommand: string
  outputDir: string
  installCommand: string
  nodeVersion: string
  branch: string
}

export function generateDeployWorkflow(config: WorkflowConfig): string {
  const { buildCommand, outputDir, installCommand, nodeVersion, branch } = config

  const needsBuild = !!buildCommand

  if (!needsBuild) {
    return `name: Deploy to FTP
on:
  push:
    branches: [${branch}]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: \${{ secrets.FTP_SERVER }}
          username: \${{ secrets.FTP_USERNAME }}
          password: \${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: ./
          server-dir: \${{ secrets.FTP_PATH }}
          security: loose
`
  }

  return `name: Build & Deploy
on:
  push:
    branches: [${branch}]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "${nodeVersion}"
          cache: "npm"

      - name: Install dependencies
        run: ${installCommand}

      - name: Build
        run: ${buildCommand}

      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: \${{ secrets.FTP_SERVER }}
          username: \${{ secrets.FTP_USERNAME }}
          password: \${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: ./${outputDir}/
          server-dir: \${{ secrets.FTP_PATH }}
          security: loose
`
}
