-- 002-assessment-tables.sql
-- Assessment system tables
-- NOTE: These tables may already exist in your database. Run with IF NOT EXISTS or skip if already created.

CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  domain_id TEXT REFERENCES domains(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  question_type TEXT DEFAULT 'LIKERT',
  for_type TEXT DEFAULT 'BOTH',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Untitled Assessment',
  assessment_type TEXT DEFAULT 'SELF',
  status TEXT DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS responses (
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

CREATE TABLE IF NOT EXISTS referees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referee_invitations (
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

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assessment_id TEXT REFERENCES assessments(id) ON DELETE CASCADE,
  title TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_referee_invitations_assessment ON referee_invitations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_referee_invitations_token ON referee_invitations(token);
CREATE INDEX IF NOT EXISTS idx_reports_assessment ON reports(assessment_id);
