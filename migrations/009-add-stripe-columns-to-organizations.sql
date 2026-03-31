-- 009: Add Stripe tracking columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
