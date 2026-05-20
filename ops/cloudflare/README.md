# Cloudflare Event Collector

This Worker is a zero-cost-friendly production analytics path for the PWA when PostHog is not configured.

## Bindings

- `EVENT_BUCKET`: R2 bucket binding that stores sanitized event batches.
- `ALLOWED_ORIGINS`: comma-separated production origins allowed to post browser events.
- `PUBLIC_WRITE_TOKEN`: optional public write token sent by the PWA as `X-AGL-Write-Token`.
- `ADMIN_EXPORT_TOKEN`: secret token used by the autonomous daily job to pull events.

## Routes

- `GET /health`: verifies the Worker and bucket binding.
- `POST /events`: accepts `{ "events": [...] }`, strips sensitive fields, and stores a JSON batch in R2.
- `GET /events/export?from=YYYY-MM-DD&limit=250`: returns batches for `npm run autonomous:import-events`.

## Environment

Set these in the PWA host, CI/daily environment, and GitHub repository variables/secrets. The same keys are listed in `ops/production.env.example`.

```sh
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=replace_with_cloudflare_api_token
AGL_EVENT_COLLECTOR_R2_BUCKET=autonomous-game-lab-events
AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS=https://your-domain.example
VITE_EVENT_COLLECTOR_URL=https://events.your-domain.example/events
VITE_EVENT_COLLECTOR_WRITE_TOKEN=public-write-token
AGL_EVENT_COLLECTOR_EXPORT_URL=https://events.your-domain.example/events/export?limit=1000
AGL_EVENT_COLLECTOR_ADMIN_TOKEN=admin-export-token
```

The browser opt-out control disables both PostHog and this collector.
