-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255), -- for email domain verification
  billing_email VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'TIER_1_5', -- TIER_1_5, TIER_6_12, TIER_13_20, TIER_21_40, TIER_40_PLUS
  assessments_used_current_period INTEGER DEFAULT 0,
  current_period_start DATE DEFAULT CURRENT_DATE,
  current_period_end DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, CANCELLED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization users (employer accounts)
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'EMPLOYER', -- ACCOUNT_HOLDER, EMPLOYER
  invited_by TEXT REFERENCES users(id),
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE', -- PENDING, ACTIVE, SUSPENDED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

-- Sponsored assessments (employer-commissioned)
CREATE TABLE sponsored_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  sponsored_by TEXT REFERENCES users(id), -- the employer who commissioned it
  candidate_email VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, EXPIRED, COMPLETED
  consent_given_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  declined_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consent tracking
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- CANDIDATE_ASSESSMENT, REFEREE_EVALUATION, DATA_SHARING
  consented BOOLEAN NOT NULL,
  consent_text TEXT, -- the actual consent text shown
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment sharing requests (for existing assessments)
CREATE TABLE assessment_sharing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  requested_by TEXT REFERENCES users(id), -- employer who requested
  candidate_user_id TEXT REFERENCES users(id), -- candidate who owns the assessment
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, DECLINED
  message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update users table to support employer-created accounts
ALTER TABLE users ADD COLUMN account_type VARCHAR(50) DEFAULT 'SELF_CREATED'; -- SELF_CREATED, EMPLOYER_CREATED
ALTER TABLE users ADD COLUMN temporary_password BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN account_activated BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN activation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN activation_expires_at TIMESTAMP;

-- Update assessments table to track sponsorship
ALTER TABLE assessments ADD COLUMN sponsored_by_organization UUID REFERENCES organizations(id);
ALTER TABLE assessments ADD COLUMN is_legacy BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN moved_to_legacy_at TIMESTAMP;

-- Indexes for performance
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX idx_sponsored_assessments_org_id ON sponsored_assessments(organization_id);
CREATE INDEX idx_sponsored_assessments_candidate_email ON sponsored_assessments(candidate_email);
CREATE INDEX idx_consent_records_user_assessment ON consent_records(user_id, assessment_id);
CREATE INDEX idx_assessment_sharing_requests_candidate ON assessment_sharing_requests(candidate_user_id);
CREATE INDEX idx_assessments_sponsored_by ON assessments(sponsored_by_organization);
CREATE INDEX idx_assessments_legacy ON assessments(is_legacy, created_at);
