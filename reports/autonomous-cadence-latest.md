# Autonomous Cadence

Generated: 2026-05-22T03:19:00.139Z
Status: cadence-ready
Cadence: twice-daily-local-daily-ci

## Schedulers

- Codex app: active-confirmed (autonomous-game-lab-daily-owner-loop)
- Codex app actual: ACTIVE; schedule matches true; workspace matches true
- GitHub Actions: scheduled (17 3 * * *)
- GitHub self-update: gated (.github/workflows/autonomous-self-update.yml)
- GitHub post-self-update deploy: scheduled (.github/workflows/web-pwa-deploy.yml)
- GitHub post-deploy evidence sync: gated (.github/workflows/post-deploy-evidence-sync.yml)

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
- Required artifacts: 39
- Fresh artifacts: 39
- Stale/invalid artifacts: 0
- Stale after: 36h
- Oldest age: 1.21h

- fresh: owner-loop - data/autonomous-owner-loop.json is 0.02h old.
- fresh: operator - data/autonomous-operator.json is 0.02h old.
- fresh: autonomous-self-update - data/autonomous-self-update.json is 0.17h old.
- fresh: production-readiness - data/production-readiness.json is 0h old.
- fresh: deployment-plan - data/deployment-plan.json is 0h old.
- fresh: repository-readiness - data/repository-readiness.json is 0h old.
- fresh: repository-bootstrap - data/repository-bootstrap.json is 0h old.
- fresh: production-bootstrap - data/production-bootstrap.json is 0h old.
- fresh: production-activation - data/production-activation.json is 0h old.
- fresh: production-environment - data/production-environment.json is 1.21h old.
- fresh: event-collector-deployment - data/event-collector-deployment.json is 0.01h old.
- fresh: event-collector-smoke - data/event-collector-smoke.json is 0.01h old.
- fresh: local-event-bridge - data/local-event-bridge.json is 0.01h old.
- fresh: event-ingest - data/event-ingest.json is 0.01h old.
- fresh: event-ingest-smoke - data/event-ingest-smoke.json is 0.01h old.
- fresh: analytics-rollup - data/analytics-rollup.json is 0.01h old.
- fresh: experiment-results - data/experiment-results.json is 1.21h old.
- fresh: growth-plan - data/growth-plan.json is 0.4h old.
- fresh: portfolio-policy - data/portfolio-policy.json is 0.4h old.
- fresh: traffic-seeding - data/traffic-seeding.json is 0.4h old.
- fresh: acquisition-learning - data/acquisition-learning.json is 0.01h old.
- fresh: organic-seed-loop - data/organic-seed-loop.json is 0.01h old.
- fresh: retention-loop - data/retention-loop.json is 0.01h old.
- fresh: release-candidate - data/release-candidate.json is 0.01h old.
- fresh: post-deploy-smoke - data/post-deploy-smoke.json is 0h old.
- fresh: post-deploy-artifact-sync - data/post-deploy-artifact-sync.json is 0.08h old.
- fresh: live-site-monitor - data/live-site-monitor.json is 0h old.
- fresh: release-health - data/release-health.json is 1.21h old.
- fresh: product-optimization - data/product-optimization.json is 1.21h old.
- fresh: product-gate-recovery - data/product-gate-recovery.json is 0.01h old.
- fresh: product-gate-sample-plan - data/product-gate-sample-plan.json is 0.01h old.
- fresh: completion-loop - data/completion-loop.json is 0.03h old.
- fresh: replay-loop - data/replay-loop.json is 0.03h old.
- fresh: first-move-coach - data/first-move-coach.json is 0.03h old.
- fresh: pwa-install-loop - data/pwa-install-loop.json is 0.01h old.
- fresh: applied-improvements - data/applied-improvements.json is 1.21h old.
- fresh: improvement-backlog - data/improvement-backlog-summary.json is 1.21h old.
- fresh: improvement-routing - data/improvement-routing.json is 1.21h old.
- fresh: objective-audit - data/objective-audit.json is 0.03h old.

## Checks

- pass: codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: codex-automation-single-active-owner-loop - No duplicate active Codex owner-loop automations share this workspace.
- pass: local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:acquisition && npm run autonomous:retention && npm run autonomous:organic-seed-loop && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:measurement-status && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: gate-recovery-script - autonomous:gate-recovery is node scripts/product-gate-recovery.mjs.
- pass: daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && npm run autonomous:collector-deploy-plan && node scripts/event-ingest-smoke.mjs && node scripts/local-event-bridge.mjs && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:acquisition && npm run autonomous:retention && npm run autonomous:organic-seed-loop && npm run autonomous:pwa-install && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:measurement-status && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:cadence && npm run autonomous:self-update && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:bundle-sync && node scripts/verify-autonomy.mjs.
- pass: browser-smoke - test:e2e is npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && playwright test && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness.
- pass: fresh-generated-evidence - All 39 required generated evidence artifacts are fresh within 36h.
- pass: github-scheduled-workflow - GitHub Actions daily workflow can run the full autonomous owner loop and upload evidence artifacts.
- pass: github-self-update-workflow - Gated GitHub workflow can persist allowlisted verified generated changes with production env and workflow token evidence when explicitly enabled.
- pass: post-self-update-deploy - Pages deployment builds the committed PWA artifact from the gated self-update workflow, so persisted generated improvements can publish without manual dispatch.
- pass: post-deploy-evidence-sync-workflow - Post-deploy evidence sync imports strict Pages smoke evidence, refreshes downstream readiness, and avoids creating an undeployed release candidate during evidence import.
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
- postDeployEvidenceSyncWritePermissionGated: true
- selfUpdateStagesAllowlistedGeneratedFilesOnly: true

## Blockers

- none
