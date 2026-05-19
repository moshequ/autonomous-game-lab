# Deployment Plan

Generated: 2026-05-19T03:06:34.392Z
Status: blocked
Target: github-pages
Cost: $0 platform hosting for public/internal experiment traffic

## Checks

- blocker: web-promotion - Hold web deploy until readiness blockers clear.
- blocker: web-readiness - Web readiness is blocked.
- pass: release-health - Release health is monitoring.
- pass: unit-economics-guard - Spend mode is no-spend; max daily paid spend is $0.00.
- pass: production-response - Production response is guarded-operations; rollback required is false.
- pass: dist-index - Production index.html exists.
- pass: dist-service-worker - Production service worker exists.
- pass: dist-privacy - Privacy policy is included in the deployable build.
- blocker: release-candidate - Release candidate is release-candidate-blocked; candidate pwa-2d4916c47233.
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

- Status: release-candidate-blocked
- Candidate: pwa-2d4916c47233
- Files: 38
- Aggregate SHA-256: 2d4916c472336ae6f155e9b95a9b04ffa3a6dd992bb007898255b7f58c5f1cd2
- Post-deploy smoke URLs: 7

## Repository Channel

- Status: waiting-for-github-repository
- Repository: missing
- Git worktree: true
- Workflow dispatch ready: false
- blocker: Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO.
- blocker: Configure GH_TOKEN or GITHUB_TOKEN for workflow dispatch and repository settings sync.
- blocker: Refresh build, release candidate, post-deploy smoke, and deployment plan artifacts.

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
