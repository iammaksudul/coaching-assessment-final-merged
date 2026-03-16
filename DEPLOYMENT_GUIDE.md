# Coaching Digs - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying Coaching Digs to a Hetzner hosting environment with a PostgreSQL database.

---

## 1. Prerequisites

### Server Requirements
- Node.js 18.x or 20.x (LTS recommended)
- PostgreSQL 14+ database
- PM2 or similar process manager for Node.js
- Nginx or Caddy as reverse proxy
- SSL certificate (Let's Encrypt recommended)

### Required Services
- **Email Service**: Postmark account for transactional emails
- **Payment Processing**: Stripe account (if using paid subscriptions)
- **Domain**: DNS configured to point to your Hetzner server

---

## 2. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# ===========================================
# DATABASE (REQUIRED)
# ===========================================
# PostgreSQL connection string
# Format: postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
DATABASE_URL="postgresql://coaching_user:YOUR_SECURE_PASSWORD@localhost:5432/coaching_digs?sslmode=require"

# ===========================================
# AUTHENTICATION (REQUIRED)
# ===========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-character-random-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# ===========================================
# EMAIL SERVICE (REQUIRED FOR PRODUCTION)
# ===========================================
# Postmark API token from your Postmark account
POSTMARK_API_TOKEN="your-postmark-api-token"

# ===========================================
# PAYMENT PROCESSING (OPTIONAL - for paid features)
# ===========================================
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# ===========================================
# APPLICATION SETTINGS
# ===========================================
NODE_ENV="production"
```

---

## 3. PostgreSQL Database Setup

### 3.1 Install PostgreSQL on Hetzner

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database user
CREATE USER coaching_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';

# Create database
CREATE DATABASE coaching_digs OWNER coaching_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE coaching_digs TO coaching_user;

# Exit psql
\q
```

### 3.3 Database Schema

Create the following tables. Run this SQL script against your database:

```sql
-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    image VARCHAR(500),
    role VARCHAR(50) DEFAULT 'PARTICIPANT',
    account_type VARCHAR(50) DEFAULT 'SELF_CREATED',
    temporary_password BOOLEAN DEFAULT FALSE,
    account_activated BOOLEAN DEFAULT TRUE,
    email_verified TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ===========================================
-- ORGANIZATIONS TABLE
-- ===========================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    billing_email VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'TIER_1_5',
    assessments_used_current_period INTEGER DEFAULT 0,
    period_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- ORGANIZATION USERS (JUNCTION TABLE)
-- ===========================================
CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'EMPLOYER',
    invited_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_users_org ON organization_users(organization_id);
CREATE INDEX idx_org_users_user ON organization_users(user_id);

-- ===========================================
-- DOMAINS (Coachability Assessment Domains)
-- ===========================================
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- QUESTIONS
-- ===========================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_type VARCHAR(50) DEFAULT 'LIKERT',
    for_type VARCHAR(50) DEFAULT 'BOTH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_domain ON questions(domain_id);

-- ===========================================
-- ASSESSMENTS
-- ===========================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Untitled Assessment',
    assessment_type VARCHAR(50) DEFAULT 'SELF',
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    sponsored_by_organization UUID REFERENCES organizations(id),
    is_legacy BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_org ON assessments(sponsored_by_organization);

-- ===========================================
-- ASSESSMENT RESPONSES
-- ===========================================
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    response_value INTEGER,
    response_text TEXT,
    responder_type VARCHAR(50) DEFAULT 'SELF',
    responder_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_responses_assessment ON assessment_responses(assessment_id);

-- ===========================================
-- REFEREE INVITATIONS
-- ===========================================
CREATE TABLE referee_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    referee_name VARCHAR(255) NOT NULL,
    referee_email VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    token VARCHAR(255) UNIQUE,
    personal_message TEXT,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reminded_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_referee_inv_assessment ON referee_invitations(assessment_id);
CREATE INDEX idx_referee_inv_email ON referee_invitations(referee_email);
CREATE INDEX idx_referee_inv_token ON referee_invitations(token);

-- ===========================================
-- REFEREE POOL
-- ===========================================
CREATE TABLE referee_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referee_name VARCHAR(255) NOT NULL,
    referee_email VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, referee_email)
);

CREATE INDEX idx_referee_pool_user ON referee_pool(user_id);

-- ===========================================
-- ASSESSMENT ACCESS REQUESTS
-- ===========================================
CREATE TABLE assessment_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    candidate_user_id UUID REFERENCES users(id),
    requesting_organization_id UUID REFERENCES organizations(id),
    requested_by_user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    access_level VARCHAR(50) DEFAULT 'SCORES_ONLY',
    request_message TEXT,
    response_message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_access_req_assessment ON assessment_access_requests(assessment_id);
CREATE INDEX idx_access_req_candidate ON assessment_access_requests(candidate_user_id);
CREATE INDEX idx_access_req_org ON assessment_access_requests(requesting_organization_id);

-- ===========================================
-- SHARED REPORT LINKS
-- ===========================================
CREATE TABLE shared_report_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id),
    shared_with_organization_id UUID REFERENCES organizations(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    access_level VARCHAR(50) DEFAULT 'SCORES_ONLY',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_links_token ON shared_report_links(token);
CREATE INDEX idx_shared_links_assessment ON shared_report_links(assessment_id);

-- ===========================================
-- PAYMENT RECORDS
-- ===========================================
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    description TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_org ON payment_records(organization_id);
CREATE INDEX idx_payments_stripe ON payment_records(stripe_payment_intent_id);

-- ===========================================
-- SEED DEFAULT DOMAINS
-- ===========================================
INSERT INTO domains (name, description, order_index) VALUES
('Openness to Feedback', 'Your ability to receive and act on feedback from others.', 1),
('Self-Awareness', 'Your understanding of your own strengths and areas for development.', 2),
('Learning Orientation', 'Your drive to continuously learn and grow.', 3),
('Adaptability', 'Your ability to adjust to new situations and change.', 4),
('Resilience', 'Your capacity to recover from setbacks and persist through challenges.', 5),
('Goal Commitment', 'Your dedication to setting and achieving meaningful goals.', 6),
('Accountability', 'Your willingness to take responsibility for your actions and outcomes.', 7),
('Emotional Regulation', 'Your ability to manage emotions effectively.', 8),
('Trust Building', 'Your capacity to establish and maintain trust with others.', 9),
('Communication', 'Your effectiveness in expressing ideas and listening to others.', 10),
('Action Orientation', 'Your tendency to take initiative and follow through.', 11),
('Relationship Building', 'Your ability to develop and maintain positive professional relationships.', 12);
```

### 3.4 Configure PostgreSQL for Remote Access (if needed)

Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = 'localhost'  # Or specific IP for remote access
```

Edit `/etc/postgresql/14/main/pg_hba.conf` to allow connections:
```
# Local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 4. Application Deployment

### 4.1 Clone Repository

```bash
cd /var/www
git clone https://github.com/todd-source-1965/v0-coaching-assessment-overview.git coaching-digs
cd coaching-digs
```

### 4.2 Install Dependencies

```bash
npm install
# or if using pnpm
pnpm install
```

### 4.3 Build Application

```bash
npm run build
```

### 4.4 Set Up PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'coaching-digs',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/coaching-digs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

---

## 5. Nginx Reverse Proxy Setup

### 5.1 Install Nginx

```bash
sudo apt install nginx
```

### 5.2 Configure Nginx

Create `/etc/nginx/sites-available/coaching-digs`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (update paths after running certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 Enable Site and Get SSL Certificate

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/coaching-digs /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Restart nginx
sudo systemctl restart nginx
```

---

## 6. Security Hardening

### 6.1 Database Security

1. **Use strong passwords** - Generate with: `openssl rand -base64 32`
2. **Enable SSL connections** to PostgreSQL
3. **Regular backups**:
```bash
# Create backup script
cat > /var/www/coaching-digs/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/coaching-digs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U coaching_user coaching_digs > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete
EOF
chmod +x /var/www/coaching-digs/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /var/www/coaching-digs/backup.sh" | crontab -
```

### 6.2 Application Security

1. **Set secure cookies** - Already configured in auth
2. **Rate limiting** - Consider adding at Nginx level:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### 6.3 Firewall Configuration

```bash
# Install ufw
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 7. Important Code Changes Required

### 7.1 Replace Neon with Standard PostgreSQL

The current codebase uses `@neondatabase/serverless`. For standard PostgreSQL on Hetzner, update `lib/db.ts`:

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? `$${i + 1}` : '')
  }, '')
  
  const result = await pool.query(query, values)
  return result.rows
}
```

Install the pg package:
```bash
npm install pg @types/pg
```

### 7.2 Update Auth Configuration

The application uses a custom auth provider. Ensure `lib/auth-utils.ts` uses proper bcrypt:

```typescript
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

---

## 8. Post-Deployment Checklist

- [ ] Database migrations executed successfully
- [ ] Environment variables configured
- [ ] SSL certificate installed and working
- [ ] Application starts without errors
- [ ] Can register a new user
- [ ] Can log in successfully
- [ ] Email sending works (test with a real email)
- [ ] Database backups configured
- [ ] Firewall rules in place
- [ ] PM2 configured to restart on server reboot
- [ ] Monitoring set up (optional: PM2 monitoring, or external service)

---

## 9. Monitoring & Maintenance

### View Application Logs
```bash
pm2 logs coaching-digs
```

### Restart Application
```bash
pm2 restart coaching-digs
```

### Update Application
```bash
cd /var/www/coaching-digs
git pull origin main
npm install
npm run build
pm2 restart coaching-digs
```

### Database Maintenance
```bash
# Connect to database
psql -U coaching_user -d coaching_digs

# Analyze tables for query optimization
ANALYZE;

# Check database size
SELECT pg_size_pretty(pg_database_size('coaching_digs'));
```

---

## 10. Troubleshooting

### Application Won't Start
1. Check logs: `pm2 logs coaching-digs --lines 100`
2. Verify environment variables: `pm2 env 0`
3. Test database connection manually

### Database Connection Issues
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Test connection: `psql -U coaching_user -d coaching_digs -h localhost`
3. Check pg_hba.conf for authentication rules

### SSL Certificate Issues
1. Renew certificate: `sudo certbot renew`
2. Check certificate expiry: `sudo certbot certificates`

---

## Support

For additional support or questions about deployment, contact the development team or refer to the project documentation.
