---
name: tac-deployment-manager
description: CI/CD and deployment expert for TAC Portal. Use when setting up GitHub Actions, deploying to Netlify/Vercel, configuring environment variables, or managing production releases.
metadata:
  author: tac-portal
  version: "1.0"
---

# TAC Deployment Manager

## Deployment Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │───▶│   Netlify    │───▶│   CDN Edge   │
│   Actions    │    │   Build      │    │   (Global)   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Supabase   │
                    │   (Backend)  │
                    └──────────────┘
```

---

## GitHub Actions Workflows

### CI Pipeline (Pull Requests)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
```

### CD Pipeline (Production Deploy)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_VERSION: ${{ github.sha }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Lighthouse Performance Check

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Environment Configuration

### Environment Files

```bash
# .env.local (development - DO NOT COMMIT)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=development

# .env.staging
VITE_SUPABASE_URL=https://xxx-staging.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=staging

# .env.production
VITE_SUPABASE_URL=https://xxx-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=production
```

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Supabase Migrations

### Migration Workflow

```bash
# Create migration
supabase migration new add_customer_tier

# Edit migration
code supabase/migrations/20260118_add_customer_tier.sql

# Apply locally
supabase db reset

# Push to production
supabase db push

# Pull remote changes
supabase db pull
```

### Edge Functions Deployment

```bash
# Deploy single function
supabase functions deploy generate-invoice-pdf

# Deploy all functions
supabase functions deploy

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
```

---

## Release Process

### Versioning (Semantic Versioning)

```bash
# Major release (breaking changes)
npm version major  # 1.0.0 → 2.0.0

# Minor release (new features)
npm version minor  # 1.0.0 → 1.1.0

# Patch release (bug fixes)
npm version patch  # 1.0.0 → 1.0.1
```

### Release Checklist

```markdown
## Pre-Release
- [ ] All tests passing (unit + E2E)
- [ ] Lighthouse score > 90
- [ ] No console errors in staging
- [ ] Database migrations tested
- [ ] Feature flags configured
- [ ] Rollback plan documented

## Release
- [ ] Create release branch
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create GitHub release
- [ ] Deploy to production
- [ ] Verify production health

## Post-Release
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics
- [ ] Update documentation
- [ ] Notify stakeholders
```

---

## Rollback Procedures

### Quick Rollback (Netlify)

```bash
# Via Netlify CLI
netlify deploy --prod --dir=dist-previous

# Via Dashboard
# 1. Go to Deploys tab
# 2. Find previous working deploy
# 3. Click "Publish deploy"
```

### Database Rollback

```sql
-- migrations/YYYYMMDD_rollback_xxx.sql

-- Revert schema changes
ALTER TABLE customers DROP COLUMN IF EXISTS tier;

-- Restore data if needed
UPDATE customers SET tier = 'STANDARD' WHERE tier IS NULL;
```

---

## Monitoring

### Error Tracking (Sentry)

```typescript
// main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Health Check Endpoint

```typescript
// pages/api/health.ts (or Supabase Edge Function)
export default async function handler() {
  const checks = {
    status: 'healthy',
    version: process.env.VITE_APP_VERSION,
    timestamp: new Date().toISOString(),
    database: await checkDatabase(),
  };
  
  return Response.json(checks);
}
```

---

## Security Checklist

### Secrets Management
- [ ] No secrets in code/commits
- [ ] GitHub Secrets configured
- [ ] Netlify env vars set
- [ ] Supabase secrets configured
- [ ] Rotation schedule documented

### Headers
- [ ] HTTPS enforced
- [ ] CSP configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

### Access Control
- [ ] Branch protection enabled
- [ ] Required reviews for main
- [ ] Deployment environments locked
- [ ] Audit logs enabled

---

## When to Use This Skill

- "Set up CI/CD pipeline"
- "Deploy to production"
- "Configure environment variables"
- "Create GitHub Actions workflow"
- "Rollback to previous version"
- "Set up monitoring"
