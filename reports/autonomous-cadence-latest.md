# Autonomous Cadence

Generated: 2026-05-19T04:13:44.083Z
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

## Checks

- pass: codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && node scripts/event-ingest-smoke.mjs && node scripts/verify-autonomy.mjs.
- pass: browser-smoke - test:e2e is playwright test.
- pass: github-scheduled-workflow - GitHub Actions daily workflow can run the autonomous loop and upload evidence artifacts.
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
- githubWorkflowReadOnlyByDefault: true
- selfUpdateWorkflowWritePermissionGated: true
- selfUpdateStagesAllowlistedGeneratedFilesOnly: true

## Blockers

- none
