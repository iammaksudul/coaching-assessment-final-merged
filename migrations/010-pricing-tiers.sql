-- 010: Create pricing_tiers table for admin-managed pricing
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  assessments VARCHAR(200) NOT NULL,
  monthly_price INTEGER NOT NULL DEFAULT 0,
  annual_price INTEGER NOT NULL DEFAULT 0,
  stripe_product_id VARCHAR(255),
  stripe_monthly_price_id VARCHAR(255),
  stripe_annual_price_id VARCHAR(255),
  features JSONB DEFAULT '[]',
  is_free BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
