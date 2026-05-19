# Production Readiness

Generated: 2026-05-19T17:26:20.241Z

## Environment

Status: production-env-missing
Public origin: missing
Analytics: local-or-fixture

## Repository Channel

Status: waiting-for-github-repository
Repository: missing
Git worktree: true
Workflow dispatch ready: false
- pass: repository-local-git-worktree - Git worktree detected at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- blocker: repository-github-target - Set GITHUB_REPOSITORY/GH_REPO, add a GitHub origin remote, or authenticate gh so the target can be inferred.
- blocker: repository-origin-remote - No GitHub origin remote is available from this workspace.
- pass: repository-gh-cli - gh version 2.90.0 (2026-04-16)
- external-blocker: repository-gh-token - Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for non-interactive workflow dispatch.
- pass: repository-pages-workflow - Web PWA Deploy workflow exists and includes post-deploy smoke.
- pass: repository-deployable-artifact - Deployment ready-for-pages; release candidate release-candidate-ready; smoke blocked-missing-origin.

## Repository Bootstrap

Status: waiting-for-github-target
Mode: plan-only
Helper: ops/github/bootstrap-repository.sh
Local git: true
- done: repo-bootstrap-inspect-repository-channel - Repository readiness is waiting-for-github-repository.
- ready: repo-bootstrap-initialize-local-git - Git worktree is available at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- ready: repo-bootstrap-create-initial-commit - The local repository has at least one commit.
- ready: repo-bootstrap-commit-current-snapshot - 40 repository evidence file(s) changed during this dry run; the outer verified commit will persist them.
- waiting-for-github-target: repo-bootstrap-set-or-create-origin - Set GITHUB_REPOSITORY/GH_REPO or authenticate gh so the target can be inferred before attaching origin.
- waiting-for-github-target: repo-bootstrap-create-github-repository - Set GITHUB_REPOSITORY/GH_REPO or authenticate gh so the target can be inferred before creating a GitHub repository.
- waiting-for-commit-and-origin: repo-bootstrap-push-initial-snapshot - Push stays held until an origin remote exists and AGL_ALLOW_PUSH=1 is set.

## Web/PWA

Status: ready-after-build
- pass: manifest - PWA manifest exists in the production build.
- pass: install-icons - Generated install/store icons are icons-ready; 6 icons checked.
- pass: service-worker - Offline service worker exists.
- pass: privacy-control - External analytics opt-out is exposed in the app shell.
- pass: privacy-page - Generated privacy policy page is included in public assets and production build.
- pass: support-page - Generated support page is included in public assets and production build.
- pass: compliance-manifest - Generated compliance manifest is included in public assets, production build, and post-deploy smoke handoff.
- pass: playable-prototypes - Every currently accepted generated concept is playable.
- pass: generated-runtime - Generated game factory has a concept-first portfolio of no-handoff playable runtime configs.
- pass: balance-severity - Bot simulator has no high-severity balance findings.
- pass: scheduled-ci-runner - Scheduled CI runner exists for the full autonomous loop and browser smoke tests.
- pass: organic-growth-plan - Generated growth plan has game pages for zero-cost discovery tests.
- pass: organic-growth-optimizer - Growth optimizer produced guarded acquisition actions that feed generated pages.
- pass: organic-growth-assets - Sitemap, robots, share manifest, and generated game pages are included in the production build.
- pass: organic-seed-loop - Organic seed loop is organic-seed-loop-ready; target canopy-bloom; player-initiated share guard active.
- pass: retention-loop - Retention loop is retention-loop-ready; daily challenge canopy-bloom; no-push/no-account guardrails active.
- pass: pwa-install-loop - PWA install loop is pwa-install-loop-ready; prompt surface autonomy-cockpit; cost $0.
- pass: performance-budget - Performance budget is performance-budget-ready; initial JS 659.9 KB / 174.4 KB gzip; deferred game chunk GameCanvas-U0f6jTHz.js.
- pass: release-candidate - Release candidate is release-candidate-ready; files 40; smoke URLs 11.
- pass: post-deploy-smoke-runner - Post-deploy smoke is blocked-missing-origin; origin missing; checks 0/12 passed, 12 blocked; local artifact predeploy-artifact-smoke-passed 12/12 passed.
- pass: product-optimization - Product optimizer is product-optimization-ready; completion 0.397 vs gate 0.55; latest action already-applied.
- pass: first-move-coach - First-move coach is first-move-coach-ready; enabled targets 6; primary harbor-rings.
- pass: completion-loop - Completion loop is completion-loop-ready; prompt armed; target harbor-rings.
- pass: replay-loop - Replay loop is replay-loop-ready; prompt armed; target harbor-rings.
- pass: release-health - Release health guard is monitoring.
- pass: production-environment - Production environment status is production-env-missing.
- pass: production-bootstrap - Production bootstrap is production-bootstrap-ready; mode waiting-for-external-credentials; external blockers 23.
- pass: autonomous-operator - Autonomous operator is operator-plan-ready; selected optimize-product-gates; execution not-requested.
- pass: autonomous-operator-history - Autonomous operator history is operator-history-ready; records 40; executed 20.
- pass: autonomous-cadence - Autonomous cadence is cadence-ready; Codex active-confirmed; GitHub scheduled.
- pass: autonomous-self-update - Autonomous self-update is self-update-ready; safe pending 0; unsafe pending 0; remote push held.
- pass: objective-audit - Objective audit is objective-in-progress; met 5 / 8; can complete false.

## Monetization

Status: blocked
- blocker: first-game-completion - First-game completion is 40%; gate is 55%.
- blocker: replay-rate - Replay rate is 31%; gate is 35%.
- blocker: d1-retention - D1 retention is 17%; gate is 18%; source is fixture-retention.

## Organic Seed Loop

Status: organic-seed-loop-ready
Target: canopy-bloom
Surface: portal-growth-loop
- armed: organic-open-seed-game - seed_campaign_clicked
- armed: organic-share-seed-link - organic_seed_share_clicked
- armed: organic-measure-seeded-start - game_started

## Retention Loop

Status: ready-local-loop
Daily challenge: canopy-bloom
Return prompt: armed (autonomy-cockpit-retention-card)
Return intent: armed (autonomy-cockpit-return-intent-card)
- armed: finish-daily-challenge - daily_challenge_completed
- armed: return-tomorrow - daily_return_prompt_viewed
- armed: confirm-return-intent - daily_return_prompt_clicked
- armed: activate-return-intent - daily_return_intent_started
- armed: share-daily-seed - share_clicked

## PWA Install Loop

Status: ready-browser-controlled
Prompt surface: autonomy-cockpit
Installs: 0

## Performance Budget

Status: performance-budget-ready
Initial JS: 659.9 KB (174.4 KB gzip)
Deferred game chunk: GameCanvas-U0f6jTHz.js
- pass: performance-initial-js-budget - Initial JS is 659.9 KB; budget is 675 KB.
- pass: performance-initial-js-gzip-budget - Initial JS gzip is 174.4 KB; budget is 200 KB.
- pass: performance-initial-css-budget - Initial CSS is 9.6 KB; budget is 40 KB.
- pass: performance-manifest - PWA manifest exists in dist.
- pass: performance-service-worker - Service worker exists in dist.
- pass: performance-game-runtime-deferred - GameCanvas-U0f6jTHz.js is deferred from the initial shell.
- pass: performance-largest-js-deferred - Largest JS chunk is GameCanvas-U0f6jTHz.js at 1360.8 KB.
- pass: performance-deferred-game-budget - Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB.

## Release Candidate

Status: release-candidate-ready
Candidate: pwa-6a80d3a248a9
Files: 40
Aggregate SHA-256: 6a80d3a248a977ca2bbcb564cf6cf8ae5a154311097410755f7f674193d289f3
- pass: release-dist-inventory - 40 dist files inventoried.
- pass: release-required-files - 15/15 required files present.
- pass: release-game-pages - 10 generated game page(s) in dist.
- pass: release-performance-budget - Performance budget is performance-budget-ready.
- pass: release-release-health - Release health is monitoring.
- pass: release-production-response - Deploy allowed is true.
- pass: release-spend-guard - Spend mode is no-spend.
- pass: release-post-deploy-smoke-plan - 11 post-deploy smoke URL(s) planned.

## Post-Deploy Smoke

Status: blocked-missing-origin
Origin: missing
Candidate: pwa-6a80d3a248a9
Checks: 0/12 passed (12 blocked)
Local artifact: predeploy-artifact-smoke-passed (12/12 passed)
- blocked: smoke-app-shell - No deployed origin configured.
- blocked: smoke-manifest-webmanifest - No deployed origin configured.
- blocked: smoke-sw-js - No deployed origin configured.
- blocked: smoke-privacy-html - No deployed origin configured.
- blocked: smoke-support-html - No deployed origin configured.
- blocked: smoke-compliance-json - No deployed origin configured.
- blocked: smoke-monetization-json - No deployed origin configured.
- blocked: smoke-app-ads-txt - No deployed origin configured.
- blocked: smoke-seed-kit-html - No deployed origin configured.
- blocked: smoke-sitemap-xml - No deployed origin configured.
- blocked: smoke-games-canopy-bloom-html - No deployed origin configured.
- blocked: smoke-release-candidate-manifest - No deployed origin configured.

## Product Optimization

Status: product-optimization-ready
Completion: 0.397 / 0.55
Replay: 0.309 / 0.35
- already-applied: product-target-score-curve-harbor-rings - Same analytics evidence already produced a target-score tuning change.
- armed: product-runtime-first-move-coach - Completion is 40% and tutorial completion is 65%; highlight one strong first move without auto-playing.
- armed: product-runtime-completion-nudge - First-game completion is 40%; show one optional mid-run nudge and measure completion_nudge_* against level_completed and game_abandoned.
- armed: product-runtime-finish-line-coach - First-game completion is 40%; show target pace only when a run falls behind after the midpoint.
- armed: product-runtime-replay-telemetry - Replay rate is 31%; keep reset and in-canvas restart telemetry wired to replay_clicked.
- armed: product-runtime-replay-prompt - Replay rate is 31%; show one optional completed-run prompt and measure replay_prompt_* against replay_clicked.
- armed: product-runtime-return-intent-activation - D1 retention is 17%; convert queued local return intent into a measured next-session start.

## First Move Coach

Status: first-move-coach-ready
Enabled targets: 6
Primary target: harbor-rings
- enabled: coach-harbor-rings - completion 39% and tutorial 67%
- enabled: coach-canopy-bloom - generated daily/portfolio game without live row yet
- monitor: coach-foundry-ledger - playable game without live row yet
- enabled: coach-grove-engine - generated daily/portfolio game without live row yet
- monitor: coach-harbor-circuit - playable game without live row yet
- monitor: coach-lantern-relay - playable game without live row yet
- enabled: coach-metro-loom - generated daily/portfolio game without live row yet
- enabled: coach-mosaic-haven - generated daily/portfolio game without live row yet

## Completion Loop

Status: completion-loop-ready
Target: harbor-rings
Prompt: armed (autonomy-cockpit-completion-card)
Finish line: armed (autonomy-cockpit-finish-line-card)
- armed: completion-reach-progress-checkpoint - completion_nudge_viewed
- armed: completion-choose-keep-playing - completion_nudge_clicked
- armed: completion-complete-after-nudge - level_completed
- armed: completion-view-finish-line-coach - finish_line_coach_viewed
- armed: completion-focus-after-finish-line-coach - finish_line_coach_clicked
- armed: completion-measure-abandonment - game_abandoned

## Replay Loop

Status: replay-loop-ready
Target: harbor-rings
Prompt: armed (autonomy-cockpit-replay-card)
- armed: replay-finish-run - level_completed
- armed: replay-show-replay-prompt - replay_prompt_viewed
- armed: replay-confirm-replay - replay_prompt_clicked
- armed: replay-respect-replay-dismissal - replay_prompt_dismissed

## Production Bootstrap

Status: production-bootstrap-ready
Mode: waiting-for-external-credentials
Setup script: ops/github/setup-production.sh
- waiting-for-github-repository: bootstrap-repository-channel - Repository missing; git worktree ready; workflow dispatch blocked.
- waiting-for-github-target: bootstrap-repository-bootstrap - Repository bootstrap waiting-for-github-target; helper ops/github/bootstrap-repository.sh; local git ready.
- waiting-for-origin-support: bootstrap-production-environment - Environment production-env-missing; public origin missing; support missing-production-address.
- ready-for-actions-pages: bootstrap-github-pages-hosting - Deployment plan is ready-for-pages; Pages workflow is .github/workflows/web-pwa-deploy.yml.
- waiting-for-gh-auth: bootstrap-github-pages-settings - GitHub CLI authentication is required before Pages settings can be synced.
- waiting-for-self-update-gate: bootstrap-autonomous-self-update - Self-update gate missing; direct push held.
- partially-configured: bootstrap-github-actions-variables - 3/24 repository variable value(s) present in this environment.
- partially-configured: bootstrap-github-actions-secrets - 3/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: bootstrap-event-collector - Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: bootstrap-monetization-gate - Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: bootstrap-store-compliance-unblock - 4 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: bootstrap-android-release-unblock - Native package blocked-draft-ready; Android release blocked-needs-host-signing-play.

## Autonomous Operator

Status: operator-plan-ready
Mode: plan-only
Selected action: optimize-product-gates
Execution: not-requested

## Autonomous Operator History

Status: operator-history-ready
Records: 40
Executed: 20

## Autonomous Cadence

Status: cadence-ready
Cadence: daily
Codex app: active-confirmed
GitHub Actions: scheduled
- pass: cadence-codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: cadence-codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: cadence-local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: cadence-self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: cadence-gate-recovery-script - autonomous:gate-recovery is node scripts/product-gate-recovery.mjs.
- pass: cadence-daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: cadence-automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && node scripts/event-ingest-smoke.mjs && node scripts/local-event-bridge.mjs && node scripts/verify-autonomy.mjs.
- pass: cadence-browser-smoke - test:e2e is playwright test.
- pass: cadence-github-scheduled-workflow - GitHub Actions daily workflow can run the autonomous loop and upload evidence artifacts.
- pass: cadence-github-self-update-workflow - Gated GitHub workflow can persist allowlisted verified generated changes when explicitly enabled.
- pass: cadence-zero-spend-operation - Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.

## Autonomous Self Update

Status: self-update-ready
Workflow: .github/workflows/autonomous-self-update.yml
Safe pending: 0
Unsafe pending: 0
Remote push ready: false
- pass: self-update-script-registered - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: self-update-daily-loop-refresh - autonomous:daily refreshes self-update evidence before owner/audit evidence.
- pass: self-update-daily-workflow-read-only - The ordinary daily workflow remains read-only and uploads evidence artifacts.
- pass: self-update-self-update-workflow - A separate gated workflow can reproduce the daily loop, verify it, and persist allowlisted changes.
- pass: self-update-safe-path-allowlist - 0 safe pending file(s), 0 unsafe pending file(s).
- pass: self-update-repository-optional - Git worktree is available on main.
- pass: self-update-remote-push-gated - Remote push remains held until GitHub credentials and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 are configured.
- pass: self-update-zero-spend-controls - Self-update only stages repository artifacts; it does not create accounts, stores, ads, paid traffic, or revenue.

## Objective Audit

Status: objective-in-progress
Met: 5 / 8
Can mark complete: false

## Distribution

Store package: draft-ready
- pass: store-listing - Generated store listing copy exists and fits Google Play short-description limits.
- pass: store-listing-optimizer - Store listing optimizer is store-listing-optimizer-ready; focus canopy-bloom.
- pass: google-data-safety - Google Play data safety draft exists.
- pass: apple-privacy-labels - Apple App Privacy label draft exists.
- pass: native-packaging-path - Android TWA packaging draft exists while signing remains blocked.
- pass: native-package-handoff - Android native handoff is blocked-draft-ready.
- pass: android-signing-prep - Android signing is signing-prepared; fingerprint available.
- pass: store-screenshots - Generated store screenshot assets are screenshots-ready; 4 screenshots attached.
- pass: store-compliance - Store compliance is draft-ready-external-blockers.
- pass: compliance-publication-pack - Compliance publication is waiting-for-production-inputs.

Store listing optimizer: store-listing-optimizer-ready
- focus: canopy-bloom
- lead screenshot: phone-canopy-bloom-generated

Store compliance: draft-ready-external-blockers
- pass: compliance-content-rating - Content rating drafts avoid gambling, UGC, real-money prizes, mature content, and unrestricted web access.
- pass: compliance-target-audience - Target audience is general audience and not child-directed.
- pass: compliance-ads-declaration - Ads declaration is ads-disabled; revenue enabled is false.
- pass: compliance-privacy-data - Data safety, App Privacy labels, and account-deletion stance are drafted.
- pass: compliance-app-access - Reviewer access does not require credentials because accounts are disabled.
- pass: compliance-compliance-publication - Deployable compliance manifest ties privacy, support, and post-deploy smoke checks together.
- pass: compliance-store-screenshots - 4 generated screenshot asset(s) are available.
- external-blocker: compliance-hosted-privacy-url - Hosted privacy policy URL is required before public store submission.
- external-blocker: compliance-support-contact - Production support email is required before public store submission.
- external-blocker: compliance-google-play-account - Google Play developer account must be connected before Android submission.
- external-blocker: compliance-apple-developer-account - Apple Developer account remains deferred until iOS spend is justified.

Native package: blocked-draft-ready
- blocker: native-production-host - Production host is not configured.
- blocker: native-hosted-privacy - Privacy URL status is needs-hosted-domain.
- pass: native-android-signing-fingerprint - SHA-256 certificate fingerprint is configured.
- pass: native-store-screenshots - 4 screenshot asset(s) available.
- pass: native-icon-assets - 6 icon asset(s) available.
- blocker: native-google-play-account - Google Play developer account is not connected.

Android signing: signing-prepared
- fingerprint: FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2
- local secrets configured: true

Icon assets: icons-ready
- manifest icon: /icons/icon-192.png (192x192, any)
- manifest icon: /icons/icon-512.png (512x512, any)
- manifest icon: /icons/maskable-192.png (192x192, maskable)
- manifest icon: /icons/maskable-512.png (512x512, maskable)

- Google Play: blocked, $25 cost gate.
- iOS App Store: defer, $99/year cost gate.

## Promotion Rule

Do not package native apps until retention gates, privacy URL, and account credentials exist.
