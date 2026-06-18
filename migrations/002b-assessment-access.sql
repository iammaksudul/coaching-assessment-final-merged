-- 002b-assessment-access.sql
-- Assessment access control tables for employer/organization access
-- NOTE: These tables may already exist in your database. Run with IF NOT EXISTS or skip if already created.

CREATE TABLE IF NOT EXISTS assessment_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  requesting_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  requested_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  candidate_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  request_message TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  access_granted_until TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_sharing_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  shared_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  shared_with_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  access_request_id UUID REFERENCES assessment_access_requests(id),
  access_level VARCHAR(20) DEFAULT 'FULL',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  accessed_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  accessed_by_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_candidate ON assessment_access_requests(candidate_user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_org ON assessment_access_requests(requesting_organization_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON assessment_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_assessment ON assessment_sharing_permissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_org ON assessment_sharing_permissions(shared_with_organization_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_assessment ON assessment_access_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed_at ON assessment_access_logs(accessed_at);
