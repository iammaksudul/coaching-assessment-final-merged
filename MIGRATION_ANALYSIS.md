# Migration Analysis: Frontend Expectations vs Database Reality

## Executive Summary

After analyzing the entire codebase (`lib/db.ts`, all API routes, frontend components) against the live Neon database schema and existing migration files, here is the complete status.

---

## Current State

### Migration Files in Repository

| File | Description | Status |
|------|-------------|--------|
| `migrations/003-add-employer-system.sql` | Organizations, org_users, sponsored_assessments, consent_records | COMPLETE |
| `migrations/004-simplify-auth.sql` | User account_type column | COMPLETE |
| `migrations/005-payment-management.sql` | payment_attempts, dunning_attempts, admin_actions, subscription fields | **BROKEN** - References non-existent `subscriptions` table |
| `migrations/006-add-assessment-bonus-credits.sql` | assessment_bonus_credits column | COMPLETE |

### Live Database Tables (19 total)

| Table | Has Migration? | Has Data? |
|-------|----------------|-----------|
| `users` | NO (missing 001) | YES - 4 records |
| `sessions` | NO (missing 001) | NO |
| `accounts` | NO (missing 001) | NO |
| `verification_tokens` | NO (missing 001) | NO |
| `domains` | NO (missing 002) | **EMPTY - NEEDS SEED DATA** |
| `questions` | NO (missing 002) | **EMPTY - NEEDS SEED DATA** |
| `assessments` | NO (missing 002) | NO |
| `responses` | NO (missing 002) | NO |
| `referees` | NO (missing 002) | NO |
| `referee_invitations` | NO (missing 002) | NO |
| `reports` | NO (missing 002) | NO |
| `organizations` | YES (003) | NO |
| `organization_users` | YES (003) | NO |
| `sponsored_assessments` | YES (003) | NO |
| `consent_records` | YES (003) | NO |
| `assessment_access_requests` | NO (missing) | NO |
| `assessment_sharing_permissions` | NO (missing) | NO |
| `assessment_access_logs` | NO (missing) | NO |
| `neon_auth.users_sync` | NO (Neon internal) | NO |

---

## CRITICAL ISSUES

### Issue 1: Missing Foundational Migrations (001, 002)

The following tables exist in Neon but have NO migration file:

**Missing `001-initial-schema.sql`:**
- `users`
- `sessions`
- `accounts`
- `verification_tokens`

**Missing `002-assessment-tables.sql`:**
- `domains`
- `questions`
- `assessments`
- `responses`
- `referees`
- `referee_invitations`
- `reports`

### Issue 2: Migration 005 Will FAIL

Migration `005-payment-management.sql` references a `subscriptions` table that **does not exist**:

```sql
-- These will fail:
REFERENCES subscriptions(id)
ALTER TABLE subscriptions ADD COLUMN...
```

### Issue 3: Missing Assessment Access Tables Migration

The code uses these tables (they exist in Neon) but no migration file:
- `assessment_access_requests`
- `assessment_sharing_permissions`
- `assessment_access_logs`

### Issue 4: Empty Seed Data Tables

The `domains` and `questions` tables are **EMPTY**. The app code has 12 domains with 48 questions hardcoded as fallback, but production needs real data.

### Issue 5: organizations.assessment_bonus_credits Column Missing

Migration 006 adds this column, but it may not have been executed.

---

## DEVELOPER TODO LIST

### Priority 1: Create Missing Foundational Migrations

#### Task 1.1: Create `001-initial-schema.sql`

```sql
-- 001-initial-schema.sql
-- Core user and authentication tables

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  email_verified TIMESTAMP,
  image TEXT,
  role TEXT DEFAULT 'PARTICIPANT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
```

#### Task 1.2: Create `002-assessment-tables.sql`

```sql
-- 002-assessment-tables.sql
-- Assessment system tables

CREATE TABLE domains (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  domain_id TEXT REFERENCES domains(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  question_type TEXT DEFAULT 'LIKERT',
  for_type TEXT DEFAULT 'BOTH',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Untitled Assessment',
  assessment_type TEXT DEFAULT 'SELF',
  status TEXT DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  referee_id TEXT,
  value TEXT NOT NULL,
  response_type TEXT DEFAULT 'SELF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, question_id)
);

CREATE TABLE referees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referee_invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  referee_id TEXT REFERENCES referees(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  title TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_domain ON questions(domain_id);
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_responses_assessment ON responses(assessment_id);
CREATE INDEX idx_referee_invitations_assessment ON referee_invitations(assessment_id);
CREATE INDEX idx_referee_invitations_token ON referee_invitations(token);
CREATE INDEX idx_reports_assessment ON reports(assessment_id);
```

### Priority 2: Create Missing Access Control Migration

#### Task 2.1: Create `002b-assessment-access.sql`

```sql
-- 002b-assessment-access.sql
-- Assessment access control tables

CREATE TABLE assessment_access_requests (
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

CREATE TABLE assessment_sharing_permissions (
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

CREATE TABLE assessment_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  accessed_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  accessed_by_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_requests_candidate ON assessment_access_requests(candidate_user_id);
CREATE INDEX idx_access_requests_org ON assessment_access_requests(requesting_organization_id);
CREATE INDEX idx_sharing_permissions_assessment ON assessment_sharing_permissions(assessment_id);
CREATE INDEX idx_sharing_permissions_org ON assessment_sharing_permissions(shared_with_organization_id);
CREATE INDEX idx_access_logs_assessment ON assessment_access_logs(assessment_id);
```

### Priority 3: Fix Payment System

#### Task 3.1: Create `004b-subscriptions.sql` (RUN BEFORE 005)

```sql
-- 004b-subscriptions.sql
-- Create subscriptions table that migration 005 depends on

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

Then run migration 005.

### Priority 4: Seed Data

#### Task 4.1: Create `seed-domains-questions.sql`

```sql
-- seed-domains-questions.sql
-- Seed the 12 coachability domains and 48 questions

-- Domain 1: Openness to Feedback
INSERT INTO domains (id, name, description, order_index) VALUES
('d1', 'Openness to Feedback', 'Your ability to receive and act on feedback from others.', 1);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q1', 'd1', 'I ask for feedback to help me improve.', 'LIKERT', 'BOTH', 1),
('q2', 'd1', 'I stay calm and listen carefully when receiving feedback.', 'LIKERT', 'BOTH', 2),
('q3', 'd1', 'I take action based on feedback I receive.', 'LIKERT', 'BOTH', 3),
('q4', 'd1', 'I welcome constructive criticism without becoming defensive.', 'LIKERT', 'BOTH', 4);

-- Domain 2: Self-Awareness
INSERT INTO domains (id, name, description, order_index) VALUES
('d2', 'Self-Awareness', 'Your understanding of your own strengths and areas for development.', 2);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q5', 'd2', 'I have a realistic understanding of my strengths.', 'LIKERT', 'BOTH', 1),
('q6', 'd2', 'I acknowledge my areas for development.', 'LIKERT', 'BOTH', 2),
('q7', 'd2', 'I reflect on my behavior and its impact on others.', 'LIKERT', 'BOTH', 3),
('q8', 'd2', 'I demonstrate insight into how others perceive me.', 'LIKERT', 'BOTH', 4);

-- Domain 3: Learning Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d3', 'Learning Orientation', 'Your enthusiasm for acquiring new skills and knowledge.', 3);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q9', 'd3', 'I actively seek out learning opportunities.', 'LIKERT', 'BOTH', 1),
('q10', 'd3', 'I show curiosity about new approaches and methods.', 'LIKERT', 'BOTH', 2),
('q11', 'd3', 'I apply new knowledge and skills in my work.', 'LIKERT', 'BOTH', 3),
('q12', 'd3', 'I enjoy tackling challenging learning experiences.', 'LIKERT', 'BOTH', 4);

-- Domain 4: Change Readiness
INSERT INTO domains (id, name, description, order_index) VALUES
('d4', 'Change Readiness', 'Your ability to adapt to new situations and approaches.', 4);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q13', 'd4', 'I adapt well to changing circumstances.', 'LIKERT', 'BOTH', 1),
('q14', 'd4', 'I embrace new ways of doing things.', 'LIKERT', 'BOTH', 2),
('q15', 'd4', 'I remain positive during periods of change.', 'LIKERT', 'BOTH', 3),
('q16', 'd4', 'I help others navigate through changes.', 'LIKERT', 'BOTH', 4);

-- Domain 5: Emotional Regulation
INSERT INTO domains (id, name, description, order_index) VALUES
('d5', 'Emotional Regulation', 'Your ability to manage emotions effectively in challenging situations.', 5);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q17', 'd5', 'I stay calm under pressure.', 'LIKERT', 'BOTH', 1),
('q18', 'd5', 'I manage my emotions effectively in difficult situations.', 'LIKERT', 'BOTH', 2),
('q19', 'd5', 'I recover quickly from setbacks.', 'LIKERT', 'BOTH', 3),
('q20', 'd5', 'I maintain composure during conflicts.', 'LIKERT', 'BOTH', 4);

-- Domain 6: Goal Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d6', 'Goal Orientation', 'Your focus on setting and achieving meaningful objectives.', 6);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q21', 'd6', 'I set clear and achievable goals.', 'LIKERT', 'BOTH', 1),
('q22', 'd6', 'I stay focused on my objectives.', 'LIKERT', 'BOTH', 2),
('q23', 'd6', 'I persist in working toward my goals.', 'LIKERT', 'BOTH', 3),
('q24', 'd6', 'I regularly review and adjust my goals as needed.', 'LIKERT', 'BOTH', 4);

-- Domain 7: Resilience
INSERT INTO domains (id, name, description, order_index) VALUES
('d7', 'Resilience', 'Your ability to bounce back from setbacks and maintain performance.', 7);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q25', 'd7', 'I bounce back quickly from disappointments.', 'LIKERT', 'BOTH', 1),
('q26', 'd7', 'I maintain performance during challenging times.', 'LIKERT', 'BOTH', 2),
('q27', 'd7', 'I learn from failures and setbacks.', 'LIKERT', 'BOTH', 3),
('q28', 'd7', 'I stay optimistic even when facing difficulties.', 'LIKERT', 'BOTH', 4);

-- Domain 8: Communication Skills
INSERT INTO domains (id, name, description, order_index) VALUES
('d8', 'Communication Skills', 'Your effectiveness in expressing ideas and listening to others.', 8);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q29', 'd8', 'I communicate my ideas clearly.', 'LIKERT', 'BOTH', 1),
('q30', 'd8', 'I listen actively to others.', 'LIKERT', 'BOTH', 2),
('q31', 'd8', 'I adapt my communication style to different audiences.', 'LIKERT', 'BOTH', 3),
('q32', 'd8', 'I ask thoughtful questions to understand others better.', 'LIKERT', 'BOTH', 4);

-- Domain 9: Relationship Building
INSERT INTO domains (id, name, description, order_index) VALUES
('d9', 'Relationship Building', 'Your ability to develop and maintain positive working relationships.', 9);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q33', 'd9', 'I build rapport easily with others.', 'LIKERT', 'BOTH', 1),
('q34', 'd9', 'I maintain positive relationships even during conflicts.', 'LIKERT', 'BOTH', 2),
('q35', 'd9', 'I show genuine interest in others.', 'LIKERT', 'BOTH', 3),
('q36', 'd9', 'I create an inclusive environment for team members.', 'LIKERT', 'BOTH', 4);

-- Domain 10: Accountability
INSERT INTO domains (id, name, description, order_index) VALUES
('d10', 'Accountability', 'Your willingness to take ownership of your actions and commitments.', 10);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q37', 'd10', 'I take responsibility for my actions.', 'LIKERT', 'BOTH', 1),
('q38', 'd10', 'I follow through on my commitments.', 'LIKERT', 'BOTH', 2),
('q39', 'd10', 'I admit when I make mistakes.', 'LIKERT', 'BOTH', 3),
('q40', 'd10', 'I hold myself to high standards.', 'LIKERT', 'BOTH', 4);

-- Domain 11: Growth Mindset
INSERT INTO domains (id, name, description, order_index) VALUES
('d11', 'Growth Mindset', 'Your belief that abilities can be developed through dedication and hard work.', 11);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q41', 'd11', 'I believe I can improve my abilities through effort.', 'LIKERT', 'BOTH', 1),
('q42', 'd11', 'I view challenges as opportunities to grow.', 'LIKERT', 'BOTH', 2),
('q43', 'd11', 'I see effort as a path to mastery.', 'LIKERT', 'BOTH', 3),
('q44', 'd11', 'I embrace the learning process, even when it is difficult.', 'LIKERT', 'BOTH', 4);

-- Domain 12: Action Orientation
INSERT INTO domains (id, name, description, order_index) VALUES
('d12', 'Action Orientation', 'Your tendency to take initiative and follow through on commitments.', 12);

INSERT INTO questions (id, domain_id, text, question_type, for_type, order_index) VALUES
('q45', 'd12', 'I take initiative to get things done.', 'LIKERT', 'BOTH', 1),
('q46', 'd12', 'I act decisively when needed.', 'LIKERT', 'BOTH', 2),
('q47', 'd12', 'I follow through on my plans.', 'LIKERT', 'BOTH', 3),
('q48', 'd12', 'I proactively address problems before they escalate.', 'LIKERT', 'BOTH', 4);
```

### Priority 5: Run Missing Column Migrations

#### Task 5.1: Verify/Add assessment_bonus_credits column

```sql
-- Run if column doesn't exist
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS assessment_bonus_credits INTEGER DEFAULT 0;
```

---

## EXECUTION ORDER FOR DEVELOPER

Run migrations in this exact order on Hetzner PostgreSQL:

1. `001-initial-schema.sql` (CREATE - may skip if tables exist)
2. `002-assessment-tables.sql` (CREATE - may skip if tables exist)
3. `002b-assessment-access.sql` (CREATE - may skip if tables exist)
4. `003-add-employer-system.sql` (existing - verify applied)
5. `004-simplify-auth.sql` (existing - verify applied)
6. `004b-subscriptions.sql` (NEW - create subscriptions table)
7. `005-payment-management.sql` (existing - now can run)
8. `006-add-assessment-bonus-credits.sql` (existing - verify applied)
9. `seed-domains-questions.sql` (SEED DATA - required for app to work)

---

## VERIFICATION CHECKLIST

After running migrations, verify:

- [ ] `SELECT COUNT(*) FROM domains;` returns 12
- [ ] `SELECT COUNT(*) FROM questions;` returns 48
- [ ] `SELECT * FROM subscriptions LIMIT 1;` doesn't error
- [ ] `SELECT assessment_bonus_credits FROM organizations LIMIT 1;` doesn't error
- [ ] All indexes exist: `\di` in psql
- [ ] All foreign key constraints exist: `\d+ tablename`

---

## SUMMARY

| Category | Count |
|----------|-------|
| Missing foundational migrations | 2 (001, 002) |
| Missing feature migrations | 2 (002b access, 004b subscriptions) |
| Broken migrations | 1 (005 - needs subscriptions first) |
| Seed data needed | 1 (domains + questions) |
| **Total tasks** | **6 migration files to create/fix** |
