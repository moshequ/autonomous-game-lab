# Event Collector Deployment

Generated: 2026-05-27T10:22:06.768Z
Status: blocked-needs-cloudflare-env
Provider: cloudflare-worker-r2
Cost posture: free-tier-friendly-no-paid-traffic
Auto-create R2 bucket: true
Runs after production input watch: true

## Checks

- pass: worker-source - Cloudflare Worker collector source exists.
- pass: wrangler-config-template - Wrangler config template exists for the collector.
- pass: collector-smoke - Event collector smoke is pass.
- pass: collector-aggregate-summary - Admin-only aggregate summary endpoint returns counts without raw events.
- pass: deploy-workflow - GitHub Actions collector deploy workflow exists.
- missing-env: cloudflare-credentials - Cloudflare account id and API token are configured.
- missing-env: collector-runtime-env - Browser collector URL, export URL, R2 bucket, and allowed origins are configured.
- missing-env: collector-tokens - Public write token and admin export token are configured before Worker deployment.

## Environment

- Browser collector configured: false
- Server export configured: false
- Cloudflare credentials configured: false
- Bucket and allowed origins configured: false
- Tokens configured: write=false, admin=false
- Aggregate summary endpoint: /events/summary
- Summary aggregate only: true

## One-Time Setup

- Create or select a Cloudflare account; the deploy workflow creates or reuses the R2 bucket for collector event batches.
- Set repository variables CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, and AGL_EVENT_COLLECTOR_EXPORT_URL.
- Set repository secrets CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, and AGL_EVENT_COLLECTOR_ADMIN_TOKEN.
- Let Production Input Watch or the Event Collector Deploy workflow run; it refreshes production environment evidence, runs the collector smoke, and only deploys when the full preflight passes.

## Commands

- Smoke: npm run autonomous:event-collector-smoke
- Plan: npm run autonomous:collector-deploy-plan
- Deploy: Production Input Watch triggers Event Collector Deploy after Cloudflare variables and secrets are configured.
