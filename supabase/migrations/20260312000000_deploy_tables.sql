-- DeployBridge tables for MagicSite
-- 5 tables: deploy_github_connections, deploy_cpanel_credentials, deploy_projects, deploy_configs, deploy_runs

-- GitHub OAuth connections (encrypted token)
CREATE TABLE deploy_github_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_user_id INTEGER NOT NULL,
  github_username TEXT NOT NULL,
  encrypted_token TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- cPanel credentials (encrypted password)
CREATE TABLE deploy_cpanel_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER DEFAULT 2083 NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Deploy projects (linked to GitHub repo + cPanel target)
CREATE TABLE deploy_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_connection_id UUID REFERENCES deploy_github_connections(id) ON DELETE SET NULL,
  cpanel_credential_id UUID REFERENCES deploy_cpanel_credentials(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  github_repo_owner TEXT NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_repo_id INTEGER,
  default_branch TEXT DEFAULT 'main' NOT NULL,
  selected_branch TEXT DEFAULT 'main' NOT NULL,
  framework_detected TEXT,
  build_command TEXT,
  output_dir TEXT,
  install_command TEXT DEFAULT 'npm install',
  node_version TEXT DEFAULT '20',
  domain TEXT,
  deploy_path TEXT DEFAULT '/public_html',
  status TEXT DEFAULT 'created' NOT NULL CHECK (status IN ('created', 'detecting', 'detected', 'provisioning', 'provisioned', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Deploy runs (GitHub Actions workflow runs)
CREATE TABLE deploy_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES deploy_projects(id) ON DELETE CASCADE,
  github_run_id BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'in_progress', 'completed', 'failure', 'cancelled')),
  conclusion TEXT,
  head_sha TEXT,
  commit_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(github_run_id)
);

-- FTP accounts created for CI/CD
CREATE TABLE deploy_ftp_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES deploy_projects(id) ON DELETE CASCADE,
  cpanel_credential_id UUID NOT NULL REFERENCES deploy_cpanel_credentials(id) ON DELETE CASCADE,
  ftp_username TEXT NOT NULL,
  ftp_server TEXT NOT NULL,
  ftp_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id)
);

-- RLS policies
ALTER TABLE deploy_github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_cpanel_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_ftp_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "Users manage own github connections"
  ON deploy_github_connections FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cpanel credentials"
  ON deploy_cpanel_credentials FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own deploy projects"
  ON deploy_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own deploy runs"
  ON deploy_runs FOR ALL USING (
    project_id IN (SELECT id FROM deploy_projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own ftp accounts"
  ON deploy_ftp_accounts FOR ALL USING (
    project_id IN (SELECT id FROM deploy_projects WHERE user_id = auth.uid())
  );

-- Service role bypass for webhook writes (deploy_runs)
CREATE POLICY "Service role full access deploy_runs"
  ON deploy_runs FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_deploy_projects_user ON deploy_projects(user_id);
CREATE INDEX idx_deploy_runs_project ON deploy_runs(project_id);
CREATE INDEX idx_deploy_runs_github_run ON deploy_runs(github_run_id);
CREATE INDEX idx_deploy_projects_status ON deploy_projects(status);
