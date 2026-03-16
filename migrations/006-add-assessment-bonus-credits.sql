-- Add bonus assessment credits column for one-off $9 purchases
-- These credits supplement the plan limit: effective_limit = plan_limit + bonus_credits

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS assessment_bonus_credits INTEGER DEFAULT 0;

-- Add index for efficient lookups during limit enforcement
CREATE INDEX IF NOT EXISTS idx_organizations_bonus_credits
ON organizations (id, assessments_used_current_period, assessment_bonus_credits);
