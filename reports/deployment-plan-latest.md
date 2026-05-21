# Deployment Plan

Generated: 2026-05-21T21:20:29.052Z
Status: ready-for-pages
Target: github-pages
Cost: $0 platform hosting for public/internal experiment traffic

## Checks

- pass: web-promotion - Promote the current PWA build to an internal/public web experiment when hosting is connected.
- pass: web-readiness - Pre-deploy web readiness passed; live post-deploy smoke remains ready-after-build.
- pass: release-health - Release health is monitoring.
- pass: unit-economics-guard - Spend mode is no-spend; max daily paid spend is $0.00.
- pass: production-response - Production response is guarded-operations; rollback required is false.
- pass: dist-index - Production index.html exists.
- pass: dist-service-worker - Production service worker exists.
- pass: dist-privacy - Privacy policy is included in the deployable build.
- pass: dist-install - PWA install handoff page is included in the deployable build.
- pass: release-candidate - Release candidate is release-candidate-ready; candidate pwa-f9086d71b0d3.
- pass: deploy-workflow - GitHub Pages deployment workflow exists.
- pass: production-environment - Environment status is production-env-missing; public origin is https://moshequ.github.io/autonomous-game-lab.
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
- Candidate: pwa-f9086d71b0d3
- Files: 47
- Aggregate SHA-256: f9086d71b0d3323cbaa01ef9cbaab56e3d4cc786d388ad0a41a09a4deb6a9a67
- Post-deploy smoke URLs: 16

## Repository Channel

- Status: repository-channel-ready
- Repository: moshequ/autonomous-game-lab
- Git worktree: true
- Workflow dispatch ready: true

## Environment

- Status: production-env-missing
- Public origin: https://moshequ.github.io/autonomous-game-lab
- Analytics: local-or-fixture
- Event collector: blocked-needs-cloudflare-env

## One-Time Setup

- Run the production bootstrap helper with gh credentials so it can set GitHub Pages source to GitHub Actions.
- For project pages, set repository variable VITE_BASE_PATH to /repository-name/.
- Set Cloudflare collector variables and secrets only when live first-party analytics are needed.
- Optionally attach a custom domain before app-store submission so the privacy URL is stable.

## Commands

- Local verification: npm run autonomous:operate
- Deploy workflow: Run Web PWA Deploy workflow or let it run after Autonomous Daily Studio succeeds.
- Collector workflow: Run Event Collector Deploy after Cloudflare variables and secrets are configured.
