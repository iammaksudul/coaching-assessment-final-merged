# Coaching Digs: Roles & Placeholders Audit

## User Roles (5 Roles Identified)

| Role | Dashboard | Functional Status | Notes |
|------|-----------|------------------|-------|
| **PARTICIPANT** | `/dashboard` | PARTIAL | Mock data for assessments. Real API integration incomplete. |
| **EMPLOYER** | `/organization-dashboard` | PARTIAL | Mock organization data. Stripe payment integration stubbed. |
| **REFEREE** | `/referee-dashboard` | MOCK ONLY | No persistent database queries. Only hardcoded referee invitations. |
| **ADMIN** | `/admin/*` | STUB | Component exists but payment/subscription logic stubbed. Redirects from `/dashboard`. |
| **ACCOUNT_HOLDER** | N/A (Internal Role) | N/A | Used for organization role hierarchy. No dedicated dashboard. |

---

## Dashboard Breakdown

### 1. PARTICIPANT Dashboard (`/dashboard`)

**Location:** `app/dashboard/page.tsx`

**Features:**
- Manage personal assessments
- View access requests from organizations
- Track referee invitations
- View sponsored assessment requests
- Respond to sponsored requests

**Functional Status:** 50% Complete
- ✅ Frontend UI complete
- ✅ Mock data structure defined
- ❌ No real database queries
- ❌ All data from hardcoded `getUserData()` map
- ❌ Sponsored request responses stubbed

**Mock Data Provided For:**
- 3 test users: alex-johnson-preview, sarah-wilson-preview, mike-chen-preview
- Each has 2-4 assessments, access requests, and referee invitations
- Stored in `getUserData()` function as hardcoded JavaScript objects

**Related Pages:**
- `/dashboard/assessments/create` - Create new assessment
- `/dashboard/assessments/new` - Assessment wizard
- `/dashboard/referees/page` - Manage referees
- `/dashboard/referees/nominate` - Invite new referees
- `/dashboard/reports/[id]` - View assessment reports
- `/dashboard/commission/page` - Bulk referee invitations
- `/dashboard/settings` - User settings

---

### 2. EMPLOYER Dashboard (`/organization-dashboard`)

**Location:** `app/organization-dashboard/page.tsx`

**Features:**
- Manage organization assessments
- Sponsor assessments to candidates
- Review candidate assessments
- Manage team members
- Track assessment usage/credits
- Access reporting and analytics

**Functional Status:** 40% Complete
- ✅ Complex UI with tabs and filtering
- ✅ Mock data structure for assessments and candidates
- ❌ Stripe integration stubbed (purchase assessments returns mock)
- ❌ No persistent storage of sponsored requests
- ❌ No real subscription management

**Mock Data Provided For:**
- Single employer: `employer-preview` / "John Smith"
- 5 sample candidates
- 3 sample assessments
- Mock subscription data

**Related Pages:**
- `/subscription/manage` - Manage subscription (Stripe stubbed)
- `/organization-report` - View organization reports

---

### 3. REFEREE Dashboard (`/referee-dashboard`)

**Location:** `app/referee-dashboard/page.tsx`

**Features:**
- View pending referee invitations
- Accept/decline invitations
- Complete referee survey

**Functional Status:** MOCK ONLY (5%)
- ✅ Basic UI present
- ❌ Completely hardcoded mock data
- ❌ No database queries
- ❌ No form submissions
- ❌ No survey completion flow

**Mock Data Provided For:**
- Sarah Wilson as referee
- 3 hardcoded referee invitations
- No persistent state

---

### 4. ADMIN Dashboard (`/admin/*`)

**Location:** `components/admin-dashboard.tsx` (Main component) & `app/admin/subscriptions/page.tsx`

**Features:**
- View all users and subscriptions
- Manage payment attempts and failures
- Send dunning emails
- Retry failed payments
- Cancel subscriptions
- Audit logs

**Functional Status:** 30% Complete
- ✅ Admin UI components built
- ✅ Mock user/subscription data
- ❌ Stripe webhook integration stubbed
- ❌ Payment retry logic not implemented
- ❌ Dunning email flow commented out
- ❌ No real subscription state management

**Mock Data Provided For:**
- 4 admin test users
- Mock subscription data with various statuses

---

## Placeholder & Stub Count Summary

### By Category

| Category | Count | Files Affected |
|----------|-------|-----------------|
| **Preview Mode Checks** | 15+ | db.ts, email.ts, API routes |
| **Mock Data Objects** | 50+ | Dashboard pages, db.ts |
| **Hardcoded Test Accounts** | 4 | auth-provider.tsx, login.tsx |
| **TODO/Commented Code** | 8+ | API routes, components |
| **Database Fallbacks** | 12+ | db.ts functions |
| **Mock API Responses** | 6+ | API routes |
| **Preview-Only Pages** | 5 | `/tour/*`, `/preview/*`, etc. |

### Total Placeholder Content: 90+ Items

---

## Key Preview Mode Placeholders

### 1. Authentication Preview (`/login`)
- 4 hardcoded test accounts
- localStorage-based session (NOT secure)
- No real password verification
- Accepts ANY password for non-test accounts

**File:** `app/login/page.tsx`

### 2. Database Preview Mode (`lib/db.ts`)
- 50+ hardcoded data objects
- Automatic fallback to mock data if no DATABASE_URL
- Mock responses for all CRUD operations
- Assessment, organization, and user mock data

**Lines affected:** ~300 lines of preview logic

### 3. Assessment Preview (`/assessment-preview`)
- Shows only 1 of 12 domains
- Mock domain and question data
- No actual response saving

**File:** `app/assessment-preview/page.tsx`

### 4. Referee Survey Preview (`/referee-survey/[token]` & `/referee-responses/[token]`)
- Mock survey data
- No real response persistence
- Preview-only tokens

### 5. Stripe Payment Preview
- Purchase assessment: Returns success immediately (no Stripe charge)
- Subscription: Mocked response with `preview: true` flag
- Credit addition: Simulated locally only

**Files:** 
- `app/api/stripe/purchase-assessment/route.ts`
- `app/api/stripe/create-subscription/route.ts`

### 6. Email Service Preview (`lib/email.ts`)
- Returns `{ success: true, messageId: "preview-mode" }` if no POSTMARK_API_TOKEN
- No actual email sent
- Logs to console only

---

## Preview/Test Pages (Not Production)

These pages exist purely for demonstration:

1. `/tour/overview` - Product tour overview
2. `/tour/assessment-process` - How assessments work
3. `/tour/individual-dashboard` - Dashboard walkthrough
4. `/tour/employer-dashboard` - Employer features
5. `/tour/reports-analytics` - Reports examples
6. `/login-preview` - Login demo
7. `/assessment-preview` - Assessment demo
8. `/report-preview` - Report demo
9. `/referee-preview` - Referee dashboard demo
10. `/employer-preview` - Employer dashboard demo
11. `/settings-preview` - Settings demo
12. `/register-preview` - Registration demo
13. `/test-full-domains` - Internal testing
14. `/test-report-pagination` - Internal testing
15. `/test-shared-reports` - Internal testing

**Total:** 15 non-production pages

---

## Components with Preview-Only Rendering

| Component | Location | Preview Elements |
|-----------|----------|------------------|
| `AdminDashboard` | `components/admin-dashboard.tsx` | Hardcoded user list, mock subscription data |
| `DashboardPreview` | `components/previews/dashboard-preview.tsx` | Sample dashboard state |
| `SettingsPreview` | `components/previews/settings-preview.tsx` | Sample user settings |
| `ReportPreview` | `components/previews/report-preview.tsx` | Sample report data |
| `AuthProvider` | `components/auth-provider.tsx` | Test accounts, localStorage sessions |

---

## API Routes with Stubbed Logic

| Route | Stub Type | What's Stubbed |
|-------|-----------|-----------------|
| `/api/register` | Preview Mode | Returns success without DB insert in preview |
| `/api/stripe/purchase-assessment` | Mock Response | Returns immediate success without Stripe |
| `/api/stripe/create-subscription` | Mock Response | Returns mock subscription object |
| `/api/webhook/stripe` | Partial Stub | Receives webhooks but DB updates commented |
| `/api/admin/payments/retry` | Commented Out | Payment retry logic not implemented |
| `/api/admin/payments/send-dunning` | Commented Out | Dunning email logic not implemented |
| `/api/sponsored-requests/respond` | Preview Mode | Returns success without DB updates in preview |

---

## Production Readiness Assessment

### What's Ready for Production
- ✅ Database schema (19 tables exist)
- ✅ Core domain model (12 coachability domains)
- ✅ UI components (fully styled and responsive)
- ✅ Email service (Postmark integration ready)
- ✅ Stripe payment framework (scaffolding complete)

### What Needs Implementation Before Production
- ❌ **Authentication:** Replace preview auth with real password verification
- ❌ **Database Queries:** Uncomment and activate all DB calls currently in preview fallback
- ❌ **Session Management:** Replace localStorage with HTTP-only session cookies
- ❌ **Stripe:** Uncomment payment processing, webhook handling
- ❌ **Admin Features:** Implement payment retry and dunning email logic
- ❌ **Referee Workflow:** Connect referee survey to real database persistence

### Estimated Work: 60-80 hours for full production implementation

---

## Recommendations for Developer

1. **Remove preview pages** - Delete `/tour/*`, `/*-preview/*` pages (15 pages)
2. **Activate database queries** - Uncomment real SQL queries in `lib/db.ts`
3. **Implement auth** - Build `/api/login` with real password verification
4. **Enable Stripe** - Uncomment Stripe code in payment routes
5. **Complete admin features** - Implement payment retry and dunning logic
6. **Remove test accounts** - Delete hardcoded accounts from auth-provider
7. **Seed production data** - Add real domains/questions (already done)
8. **Environment variables** - Set DATABASE_URL, Stripe keys, Postmark token
9. **Database backups** - Configure automated backups
10. **Monitoring** - Set up error logging and monitoring

