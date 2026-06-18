-- Migration 008: Align schema with application code
-- Fixes column mismatches between migrations 001-007 and actual API code

-- ============================================================================
-- 1. referee_invitations: add missing columns
-- ============================================================================
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS referee_email TEXT;
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP;
ALTER TABLE referee_invitations ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- ============================================================================
-- 2. responses: add missing columns + fix unique constraint
-- ============================================================================
-- Code uses 'answer' but migration created 'value'
ALTER TABLE responses ADD COLUMN IF NOT EXISTS answer TEXT;
-- Backfill: copy existing 'value' data into 'answer'
UPDATE responses SET answer = value WHERE answer IS NULL AND value IS NOT NULL;

-- Code uses 'respondent_type' but migration created 'response_type'
ALTER TABLE responses ADD COLUMN IF NOT EXISTS respondent_type TEXT;
UPDATE responses SET respondent_type = response_type WHERE respondent_type IS NULL AND response_type IS NOT NULL;

-- Code uses 'respondent_token' for referee token tracking
ALTER TABLE responses ADD COLUMN IF NOT EXISTS respondent_token TEXT;

-- Drop old unique constraint and create new one that supports multiple respondents
-- (old: assessment_id + question_id — only allows 1 answer per question)
-- (new: assessment_id + question_id + respondent_token — allows self + multiple referees)
ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_assessment_id_question_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_respondent 
  ON responses(assessment_id, question_id, COALESCE(respondent_token, ''));

-- ============================================================================
-- 3. assessment_access_requests: add alias columns for code compatibility
-- ============================================================================
-- Code uses 'organization_id' but migration created 'requesting_organization_id'
ALTER TABLE assessment_access_requests ADD COLUMN IF NOT EXISTS organization_id UUID;
UPDATE assessment_access_requests SET organization_id = requesting_organization_id WHERE organization_id IS NULL;

-- Code uses 'requested_by' but migration created 'requested_by_user_id'
ALTER TABLE assessment_access_requests ADD COLUMN IF NOT EXISTS requested_by TEXT;
UPDATE assessment_access_requests SET requested_by = requested_by_user_id WHERE requested_by IS NULL;

-- Code uses 'candidate_email' for lookups
ALTER TABLE assessment_access_requests ADD COLUMN IF NOT EXISTS candidate_email TEXT;

-- Code uses 'resolved_at' 
ALTER TABLE assessment_access_requests ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
UPDATE assessment_access_requests SET resolved_at = responded_at WHERE resolved_at IS NULL AND responded_at IS NOT NULL;

-- ============================================================================
-- 4. organizations: add columns referenced by employer stats API
-- ============================================================================
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS assessments_used_current_period INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS assessments_allowed_per_period INTEGER DEFAULT 5;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'FREE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS assessment_bonus_credits INTEGER DEFAULT 0;

-- ============================================================================
-- 5. users: add organization_id for direct lookup
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;

-- ============================================================================
-- 6. Indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_referee_invitations_email ON referee_invitations(referee_email);
CREATE INDEX IF NOT EXISTS idx_referee_invitations_status ON referee_invitations(status);
CREATE INDEX IF NOT EXISTS idx_responses_respondent_token ON responses(respondent_token);
CREATE INDEX IF NOT EXISTS idx_assessment_access_requests_org ON assessment_access_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_assessments_org ON sponsored_assessments(organization_id);
