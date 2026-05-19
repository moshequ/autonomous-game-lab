# Autonomous Cadence

Generated: 2026-05-19T02:21:09.036Z
Status: cadence-ready
Cadence: daily

## Schedulers

- Codex app: active-declared (autonomous-game-lab-daily-owner-loop)
- GitHub Actions: scheduled (17 3 * * *)

## Commands

- Operate: npm run autonomous:operate
- Daily: npm run autonomous:daily
- Automation verify: npm run test:automation
- Browser smoke: npm run test:e2e

## Checks

- pass: codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: local-operate-script - autonomous:operate is npm run autonomous:daily && npm run test:e2e.
- pass: cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && node scripts/event-ingest-smoke.mjs && node scripts/verify-autonomy.mjs.
- pass: browser-smoke - test:e2e is playwright test.
- pass: github-scheduled-workflow - GitHub Actions daily workflow can run the autonomous loop and upload evidence artifacts.
- pass: zero-spend-operation - Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.

## Guardrails

- zeroPaidSpend: true
- localLoopCanRunWithoutExternalAccounts: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noPaidAcquisition: true
- noExternalPosting: true
- remoteMutationRequiresRepositoryEvidence: true
- codexAutomationExpectedActive: true
- githubWorkflowReadOnlyByDefault: true

## Blockers

- none
