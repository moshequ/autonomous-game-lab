# Autonomous Cadence

Generated: 2026-05-20T04:06:00.121Z
Status: cadence-ready
Cadence: daily

## Schedulers

- Codex app: active-confirmed (autonomous-game-lab-daily-owner-loop)
- Codex app actual: ACTIVE; schedule matches true; workspace matches true
- GitHub Actions: scheduled (17 3 * * *)
- GitHub self-update: gated (.github/workflows/autonomous-self-update.yml)

## Commands

- Operate: npm run autonomous:operate
- Execute one local action: npm run autonomous:operator -- --execute
- After action: npm run autonomous:after-action
- Daily: npm run autonomous:daily
- Self-update: npm run autonomous:self-update
- Automation verify: npm run test:automation
- Browser smoke: npm run test:e2e

## Freshness

- Status: fresh
- Required artifacts: 21
- Fresh artifacts: 21
- Stale/invalid artifacts: 0
- Stale after: 36h
- Oldest age: 1.37h

- fresh: owner-loop - data/autonomous-owner-loop.json is 0h old.
- fresh: operator - data/autonomous-operator.json is 0h old.
- fresh: autonomous-self-update - data/autonomous-self-update.json is 0.07h old.
- fresh: production-readiness - data/production-readiness.json is 0h old.
- fresh: deployment-plan - data/deployment-plan.json is 0h old.
- fresh: repository-readiness - data/repository-readiness.json is 0h old.
- fresh: repository-bootstrap - data/repository-bootstrap.json is 0h old.
- fresh: production-bootstrap - data/production-bootstrap.json is 0.05h old.
- fresh: production-environment - data/production-environment.json is 1.37h old.
- fresh: event-collector-deployment - data/event-collector-deployment.json is 0.08h old.
- fresh: local-event-bridge - data/local-event-bridge.json is 0.08h old.
- fresh: growth-plan - data/growth-plan.json is 0.16h old.
- fresh: portfolio-policy - data/portfolio-policy.json is 0.16h old.
- fresh: traffic-seeding - data/traffic-seeding.json is 0.16h old.
- fresh: acquisition-learning - data/acquisition-learning.json is 0.16h old.
- fresh: organic-seed-loop - data/organic-seed-loop.json is 0.16h old.
- fresh: release-candidate - data/release-candidate.json is 0h old.
- fresh: post-deploy-smoke - data/post-deploy-smoke.json is 0h old.
- fresh: product-gate-sample-plan - data/product-gate-sample-plan.json is 0.78h old.
- fresh: pwa-install-loop - data/pwa-install-loop.json is 0.6h old.
- fresh: objective-audit - data/objective-audit.json is 0h old.

## Checks

- pass: codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: codex-automation-single-active-owner-loop - No duplicate active Codex owner-loop automations share this workspace.
- pass: local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: gate-recovery-script - autonomous:gate-recovery is node scripts/product-gate-recovery.mjs.
- pass: daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && npm run autonomous:collector-deploy-plan && node scripts/event-ingest-smoke.mjs && node scripts/local-event-bridge.mjs && node scripts/verify-autonomy.mjs.
- pass: browser-smoke - test:e2e is playwright test.
- pass: fresh-generated-evidence - All 21 required generated evidence artifacts are fresh within 36h.
- pass: github-scheduled-workflow - GitHub Actions daily workflow can run the full autonomous owner loop and upload evidence artifacts.
- pass: github-self-update-workflow - Gated GitHub workflow can persist allowlisted verified generated changes when explicitly enabled.
- pass: zero-spend-operation - Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.

## Guardrails

- zeroPaidSpend: true
- localLoopCanRunWithoutExternalAccounts: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noPaidAcquisition: true
- noExternalPosting: true
- scheduledLocalActionExecution: true
- scheduledExecutionUsesOperatorAllowlist: true
- postActionBuildRefresh: true
- postActionVerification: true
- remoteMutationRequiresRepositoryEvidence: true
- codexAutomationExpectedActive: true
- codexAutomationActualStatusAudited: true
- staleEvidenceBlocksUnattendedTrust: true
- githubWorkflowReadOnlyByDefault: true
- selfUpdateWorkflowWritePermissionGated: true
- selfUpdateStagesAllowlistedGeneratedFilesOnly: true

## Blockers

- none
