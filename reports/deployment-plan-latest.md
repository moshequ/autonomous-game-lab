# Deployment Plan

Generated: 2026-05-19T04:35:25.564Z
Status: ready-for-pages
Target: github-pages
Cost: $0 platform hosting for public/internal experiment traffic

## Checks

- pass: web-promotion - Promote the current PWA build to an internal/public web experiment when hosting is connected.
- pass: web-readiness - Web readiness is ready-after-build.
- pass: release-health - Release health is monitoring.
- pass: unit-economics-guard - Spend mode is no-spend; max daily paid spend is $0.00.
- pass: production-response - Production response is guarded-operations; rollback required is false.
- pass: dist-index - Production index.html exists.
- pass: dist-service-worker - Production service worker exists.
- pass: dist-privacy - Privacy policy is included in the deployable build.
- pass: release-candidate - Release candidate is release-candidate-ready; candidate pwa-d0b2f5f37332.
- pass: deploy-workflow - GitHub Pages deployment workflow exists.
- pass: production-environment - Environment status is production-env-missing; public origin is missing.
- pass: event-collector-deployment - Event collector deployment is blocked-needs-cloudflare-env.

## Spend Guard

- Mode: no-spend
- Max daily spend: $0.00
- Paid acquisition: blocked
- Store spend: blocked

## Production Response

- Mode: guarded-operations
- Deploy allowed: true
- Rollback required: false
- Active actions: disable-revenue-features, enforce-zero-paid-spend

## Release Candidate

- Status: release-candidate-ready
- Candidate: pwa-d0b2f5f37332
- Files: 38
- Aggregate SHA-256: d0b2f5f373328604b2a16b99569261ac687d3bf63d55b153981ae27418604158
- Post-deploy smoke URLs: 7

## Repository Channel

- Status: waiting-for-github-repository
- Repository: missing
- Git worktree: true
- Workflow dispatch ready: false
- blocker: Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO.
- blocker: Configure GH_TOKEN or GITHUB_TOKEN for workflow dispatch and repository settings sync.

## Environment

- Status: production-env-missing
- Public origin: missing
- Analytics: local-or-fixture
- Event collector: blocked-needs-cloudflare-env

## One-Time Setup

- Set GitHub Pages source to GitHub Actions in repository settings.
- For project pages, set repository variable VITE_BASE_PATH to /repository-name/.
- Set Cloudflare collector variables and secrets only when live first-party analytics are needed.
- Optionally attach a custom domain before app-store submission so the privacy URL is stable.

## Commands

- Local verification: npm run autonomous:daily && npm run test:e2e
- Deploy workflow: Run Web PWA Deploy workflow or let it run after Autonomous Daily Studio succeeds.
- Collector workflow: Run Event Collector Deploy after Cloudflare variables and secrets are configured.
