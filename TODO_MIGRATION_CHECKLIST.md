# Coaching Digs: Migration TODO Checklist

## Expectation vs Reality Comparison

---

## TABLES: Code Expects vs Database Has

| Table Name | Code Expects? | Exists in Neon? | Migration File? | Status |
|------------|---------------|-----------------|-----------------|--------|
| `users` | YES | YES | NO (missing 001) | WORKS - needs migration file |
| `accounts` | YES | YES | NO (missing 001) | WORKS - needs migration file |
| `sessions` | YES | YES | NO (missing 001) | WORKS - needs migration file |
| `verification_tokens` | YES | YES | NO (missing 001) | WORKS - needs migration file |
| `domains` | YES | YES (EMPTY!) | NO (missing 002) | BROKEN - needs seed data |
| `questions` | YES | YES (EMPTY!) | NO (missing 002) | BROKEN - needs seed data |
| `assessments` | YES | YES | NO (missing 002) | WORKS - needs migration file |
| `responses` | YES | YES | NO (missing 002) | WORKS - needs migration file |
| `referees` | YES | YES | NO (missing 002) | WORKS - needs migration file |
| `referee_invitations` | YES | YES | NO (missing 002) | WORKS - needs migration file |
| `reports` | YES | YES | NO (missing 002) | WORKS - needs migration file |
| `organizations` | YES | YES | YES (003) | WORKS |
| `organization_users` | YES | YES | YES (003) | WORKS |
| `sponsored_assessments` | YES | YES | YES (003) | WORKS |
| `consent_records` | YES | YES | YES (003) | WORKS |
| `assessment_access_requests` | YES | YES | NO (missing 002b) | WORKS - needs migration file |
| `assessment_sharing_permissions` | YES | YES | NO (missing 002b) | WORKS - needs migration file |
| `assessment_access_logs` | YES | YES | NO (missing 002b) | WORKS - needs migration file |
| `subscriptions` | YES (005 refs) | NO | NO | BROKEN - table doesn't exist |
| `payment_attempts` | YES (005) | NO | YES (005) | BROKEN - 005 can't run |
| `dunning_attempts` | YES (005) | NO | YES (005) | BROKEN - 005 can't run |
| `admin_actions` | YES (005) | NO | YES (005) | BROKEN - 005 can't run |
| `shared_report_links` | YES (DEPLOYMENT_GUIDE) | NO | NO | MISSING - needs creation |

---

## DATA: Code Expects vs Database Has

| Data | Code Expects | Database Has | Status |
|------|--------------|--------------|--------|
| 12 Coachability Domains | YES | 0 rows | BROKEN - needs seeding |
| 48 Assessment Questions | YES | 0 rows | BROKEN - needs seeding |
| Test Users | Optional | 4 users | OK |
| Organizations | Optional | 0 rows | OK (created on signup) |

---

## CRITICAL TODO LIST

### Priority 1: BLOCKING ISSUES (App won't work without these)

- [ ] **TODO 1.1**: Seed `domains` table with 12 coachability domains
- [ ] **TODO 1.2**: Seed `questions` table with 48 assessment questions (4 per domain)
- [ ] **TODO 1.3**: Create `subscriptions` table (migration 005 depends on this)

### Priority 2: MISSING MIGRATION FILES (For documentation/reproducibility)

- [ ] **TODO 2.1**: Create `001-initial-schema.sql` (users, accounts, sessions, verification_tokens)
- [ ] **TODO 2.2**: Create `002-assessment-tables.sql` (domains, questions, assessments, responses, referees, referee_invitations, reports)
- [ ] **TODO 2.3**: Create `002b-assessment-access.sql` (assessment_access_requests, assessment_sharing_permissions, assessment_access_logs)
- [ ] **TODO 2.4**: Create `004b-subscriptions.sql` (subscriptions table)

### Priority 3: FIX BROKEN MIGRATION

- [ ] **TODO 3.1**: Run `004b-subscriptions.sql` BEFORE `005-payment-management.sql`
- [ ] **TODO 3.2**: Then run `005-payment-management.sql` to create payment_attempts, dunning_attempts, admin_actions

### Priority 4: OPTIONAL BUT REFERENCED

- [ ] **TODO 4.1**: Create `shared_report_links` table (referenced in DEPLOYMENT_GUIDE.md but not in migrations)

---

## DETAILED MIGRATION FILES NEEDED

### FILE: `001-initial-schema.sql` (CREATED - needs execution on fresh DB)
```
Location: /migrations/001-initial-schema.sql
Creates: users, accounts, sessions, verification_tokens
Status: File exists, tables already exist in Neon
```

### FILE: `002-assessment-tables.sql` (CREATED - needs execution on fresh DB)
```
Location: /migrations/002-assessment-tables.sql  
Creates: domains, questions, assessments, responses, referees, referee_invitations, reports
Status: File exists, tables already exist in Neon (but domains/questions are EMPTY)
```

### FILE: `002b-assessment-access.sql` (CREATED - needs execution on fresh DB)
```
Location: /migrations/002b-assessment-access.sql
Creates: assessment_access_requests, assessment_sharing_permissions, assessment_access_logs
Status: File exists, tables already exist in Neon
```

### FILE: `003-add-employer-system.sql` (EXISTS)
```
Location: /migrations/003-add-employer-system.sql
Creates: organizations, organization_users, sponsored_assessments, consent_records
Status: Already applied to Neon
```

### FILE: `004-simplify-auth.sql` (EXISTS)
```
Location: /migrations/004-simplify-auth.sql
Modifies: users table (adds password, activation fields)
Status: Already applied to Neon
```

### FILE: `004b-subscriptions.sql` (CREATED - MUST RUN ON NEON)
```
Location: /migrations/004b-subscriptions.sql
Creates: subscriptions table
Status: File exists, TABLE DOES NOT EXIST IN NEON - MUST RUN
```

### FILE: `005-payment-management.sql` (EXISTS - BROKEN)
```
Location: /migrations/005-payment-management.sql
Creates: payment_attempts, dunning_attempts, admin_actions
Status: CANNOT RUN - requires subscriptions table first
```

### FILE: `006-add-assessment-bonus-credits.sql` (EXISTS)
```
Location: /migrations/006-add-assessment-bonus-credits.sql
Modifies: organizations table (adds bonus_credits column)
Status: Already applied to Neon
```

### FILE: `007-seed-domains-questions.sql` (CREATED - MUST RUN ON NEON)
```
Location: /migrations/007-seed-domains-questions.sql
Inserts: 12 domains, 48 questions
Status: File exists, TABLES ARE EMPTY - MUST RUN
```

---

## EXECUTION ORDER FOR DEVELOPER

### For Fresh Database (Hetzner deployment):
```bash
psql -U user -d database -f migrations/001-initial-schema.sql
psql -U user -d database -f migrations/002-assessment-tables.sql
psql -U user -d database -f migrations/002b-assessment-access.sql
psql -U user -d database -f migrations/003-add-employer-system.sql
psql -U user -d database -f migrations/004-simplify-auth.sql
psql -U user -d database -f migrations/004b-subscriptions.sql
psql -U user -d database -f migrations/005-payment-management.sql
psql -U user -d database -f migrations/006-add-assessment-bonus-credits.sql
psql -U user -d database -f migrations/007-seed-domains-questions.sql
```

### For Existing Neon Database (to fix missing items):
```bash
# These are the ONLY migrations needed on the current Neon database:
psql $DATABASE_URL -f migrations/004b-subscriptions.sql   # Create missing subscriptions table
psql $DATABASE_URL -f migrations/005-payment-management.sql   # Now this will work
psql $DATABASE_URL -f migrations/007-seed-domains-questions.sql   # Populate empty tables
```

---

## VERIFICATION QUERIES

After running migrations, verify with these queries:

```sql
-- Check all tables exist (should return 23 rows)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check domains are seeded (should return 12 rows)
SELECT COUNT(*) FROM domains;

-- Check questions are seeded (should return 48 rows)  
SELECT COUNT(*) FROM questions;

-- Check subscriptions table exists (should not error)
SELECT COUNT(*) FROM subscriptions;

-- Check payment tables exist (should not error)
SELECT COUNT(*) FROM payment_attempts;
SELECT COUNT(*) FROM dunning_attempts;
SELECT COUNT(*) FROM admin_actions;
```

---

## SUMMARY

| Category | Expected | Actual | Gap |
|----------|----------|--------|-----|
| Tables in code | 23 | 19 in Neon | 4 missing |
| Migration files needed | 9 | 4 existed | 5 were missing (now created) |
| Seeded data rows | 60 | 0 | 60 missing |
| Blocking issues | 0 | 3 | Must fix before production |

### The 3 Blocking Issues:
1. `domains` table is EMPTY (app can't show assessments)
2. `questions` table is EMPTY (app can't run assessments)  
3. `subscriptions` table doesn't exist (migration 005 fails, payment features broken)

### Files Created by v0:
- `/migrations/001-initial-schema.sql`
- `/migrations/002-assessment-tables.sql`
- `/migrations/002b-assessment-access.sql`
- `/migrations/004b-subscriptions.sql`
- `/migrations/007-seed-domains-questions.sql`

### Developer Must Run on Neon NOW:
```bash
psql $DATABASE_URL -f migrations/004b-subscriptions.sql
psql $DATABASE_URL -f migrations/005-payment-management.sql
psql $DATABASE_URL -f migrations/007-seed-domains-questions.sql
```
