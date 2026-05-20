# Deployment Plan

Generated: 2026-05-20T05:18:23.150Z
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
- pass: dist-install - PWA install handoff page is included in the deployable build.
- pass: release-candidate - Release candidate is release-candidate-ready; candidate pwa-2f6f1deff9d6.
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
- Candidate: pwa-2f6f1deff9d6
- Files: 43
- Aggregate SHA-256: 2f6f1deff9d6fa66af621a0174d7ba44aa43e6c5af69fdbfa829614573edbee4
- Post-deploy smoke URLs: 14

## Repository Channel

- Status: waiting-for-github-repository
- Repository: missing
- Git worktree: true
- Workflow dispatch ready: false
- blocker: Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh to infer the target repository.
- blocker: Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for workflow dispatch and repository settings sync.

## Environment

- Status: production-env-missing
- Public origin: missing
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
