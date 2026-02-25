-- Migration: Schema Cleanup & Test Data Removal
-- Date: 2026-02-25
-- Purpose: Remove test data and unused columns while preserving seeds and RLS policies

-- 1. Clean test data (CASCADE handles dependent tables like briefings)
TRUNCATE projects CASCADE;
TRUNCATE credits_balance, credits_ledger, ai_generation_logs;
TRUNCATE profiles, partnership_validations, partnership_plans;
TRUNCATE audit_logs, ai_metrics, user_consents, user_privacy_settings;
-- Preserved: segments, agent_prompts, partner_institutions

-- 2. Remove unused columns from projects
ALTER TABLE projects DROP COLUMN IF EXISTS segment_id;
ALTER TABLE projects DROP COLUMN IF EXISTS business_summary;
ALTER TABLE projects DROP COLUMN IF EXISTS version;
DROP INDEX IF EXISTS projects_segment_id_idx;
