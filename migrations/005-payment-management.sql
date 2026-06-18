-- Add payment tracking and dunning management tables

-- Payment attempts tracking
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- 'succeeded', 'failed', 'pending', 'canceled'
  failure_code VARCHAR(100),
  failure_message TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dunning management
CREATE TABLE IF NOT EXISTS dunning_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  payment_attempt_id UUID REFERENCES payment_attempts(id),
  email_type VARCHAR(50) NOT NULL, -- 'payment_failed', 'retry_reminder', 'final_notice', 'suspension_warning'
  sent_to VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email_subject VARCHAR(255),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin actions log
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  target_subscription_id UUID REFERENCES subscriptions(id),
  action_type VARCHAR(100) NOT NULL, -- 'retry_payment', 'suspend_account', 'extend_grace', 'manual_payment', etc.
  action_details JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add grace period and suspension fields to subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_retry_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_attempts_subscription ON payment_attempts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_next_retry ON payment_attempts(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_dunning_attempts_subscription ON dunning_attempts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_subscription ON admin_actions(target_subscription_id);
