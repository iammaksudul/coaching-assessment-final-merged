# Coaching Digs - Final Merged Version

Coaching assessment platform merging the best features from all 4 development branches.

## Merge Sources

| Branch | Commits | What Was Taken |
|--------|---------|----------------|
| **participant-login-error** (base) | 50 | Full codebase: dashboard with referee tabs, privacy/terms/contact pages, AI recommendations, assessment archiving, one-off purchases, sponsored requests, 1678-line org dashboard with real DB |
| **v0-main-3b35b81a** | 2 | EmployerDashboard component (1187 lines), accept-invitation API, invited/[token] page, dashboard/preview page, enhanced email templates with referee emails |
| **v0-todd-3051-a4374fe9** | 11 | (Features already covered by participant-login-error base) |
| **main** | 3 | (Base branch, all features superseded) |

## Key Features

- **Participant Dashboard** (1037 lines) - 4 tabs: assessments, referee invitations, sponsored requests, access requests
- **Organization Dashboard** (1678 lines) - 4 tabs: overview, assessments, reports, subscription - with real API calls
- **EmployerDashboard Component** (1187 lines) - Clean reusable component from v0-main-3b35b81a (reference for future refactoring)
- **Referee System** - Survey, invitation, management, reminders
- **Stripe Integration** - Subscriptions, one-off purchases, webhooks
- **Admin Panel** - Payment management, subscription management
- **Privacy/Terms/Contact** pages
- **AI Recommendations** via GPT-4o-mini
- **Assessment Invitation Acceptance** flow with token validation

## Tech Stack

- Next.js (App Router)
- TypeScript
- PostgreSQL
- NextAuth.js
- Stripe
- Postmark (email)
- Tailwind CSS + shadcn/ui

## Setup

```bash
pnpm install
cp .env.example .env.local  # Configure environment variables
pnpm dev
```

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=...
POSTMARK_API_TOKEN=...
```
