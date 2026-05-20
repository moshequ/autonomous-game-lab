# Event Collector Deployment

Generated: 2026-05-20T12:40:00.248Z
Status: blocked-needs-cloudflare-env
Provider: cloudflare-worker-r2
Cost posture: free-tier-friendly-no-paid-traffic
Auto-create R2 bucket: true

## Checks

- pass: worker-source - Cloudflare Worker collector source exists.
- pass: wrangler-config-template - Wrangler config template exists for the collector.
- pass: collector-smoke - Event collector smoke is pass.
- pass: deploy-workflow - GitHub Actions collector deploy workflow exists.
- missing-env: cloudflare-credentials - Cloudflare account id, API token, and admin export token are configured.
- missing-env: collector-runtime-env - Browser collector URL, export URL, and public write token are configured.

## Environment

- Browser collector configured: false
- Server export configured: false
- Cloudflare credentials configured: false
- Tokens configured: write=false, admin=false

## One-Time Setup

- Create or select a Cloudflare account; the deploy workflow creates or reuses the R2 bucket for collector event batches.
- Set repository variables CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, and AGL_EVENT_COLLECTOR_EXPORT_URL.
- Set repository secrets CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, and AGL_EVENT_COLLECTOR_ADMIN_TOKEN.
- Run the Event Collector Deploy workflow; it runs the collector smoke before deploying.

## Commands

- Smoke: npm run autonomous:event-collector-smoke
- Plan: npm run autonomous:collector-deploy-plan
- Deploy: Run Event Collector Deploy after Cloudflare variables and secrets are configured.
