# Production Readiness

Generated: 2026-05-21T12:28:14.847Z

## Environment

Status: production-env-missing
Public origin: https://moshequ.github.io/autonomous-game-lab
Analytics: local-or-fixture

## Repository Channel

Status: repository-channel-ready
Repository: moshequ/autonomous-game-lab
Git worktree: true
Workflow dispatch ready: true
- pass: repository-local-git-worktree - Git worktree detected at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- pass: repository-github-target - Target repository is moshequ/autonomous-game-lab.
- pass: repository-origin-remote - Origin remote resolves to moshequ/autonomous-game-lab.
- pass: repository-gh-cli - gh version 2.92.0 (2026-04-28)
- pass: repository-gh-token - GitHub CLI authentication is available for repository operations.
- pass: repository-pages-workflow - Web PWA Deploy workflow exists and includes post-deploy smoke.
- pass: repository-pages-settings - GitHub Pages build type is workflow; HTTPS enforced true.
- pass: repository-deployable-artifact - Deployment ready-for-pages; release candidate release-candidate-ready; smoke post-deploy-smoke-observed-live.

## Repository Bootstrap

Status: repository-bootstrap-ready
Mode: plan-only
Helper: ops/github/bootstrap-repository.sh
Local git: true
- done: repo-bootstrap-inspect-repository-channel - Repository readiness is repository-channel-ready.
- ready: repo-bootstrap-initialize-local-git - Git worktree is available at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- ready: repo-bootstrap-create-initial-commit - The local repository has at least one commit.
- ready-for-explicit-snapshot-commit: repo-bootstrap-commit-current-snapshot - 6 non-generated source or artifact file(s) are not committed yet.
- ready: repo-bootstrap-set-or-create-origin - Origin remote resolves to moshequ/autonomous-game-lab.
- ready-for-explicit-create-or-attach: repo-bootstrap-create-github-repository - GitHub CLI can create or attach moshequ/autonomous-game-lab when explicitly allowed.
- waiting-for-clean-snapshot: repo-bootstrap-push-initial-snapshot - Push stays held until a committed local snapshot and origin remote exist.

## Web/PWA

Status: ready-after-build
- pass: manifest - PWA manifest exists in the production build.
- pass: install-icons - Generated install/store icons are icons-ready; 6 icons checked.
- pass: service-worker - Offline service worker exists.
- pass: privacy-control - External analytics opt-out is exposed in the app shell.
- pass: privacy-page - Generated privacy policy page is included in public assets and production build.
- pass: support-page - Generated support page is included in public assets and production build.
- pass: support-channel - Support channel is support-channel-ready; repository moshequ/autonomous-game-lab; public intake ready.
- pass: support-feedback - Support feedback is support-feedback-empty; issues 0; routable signals 0; aggregate notes 0.
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
- pass: performance-budget - Performance budget is performance-budget-ready; initial JS 674.4 KB / 183.2 KB gzip; deferred game chunk GameCanvas-C43tVjYr.js.
- pass: release-candidate - Release candidate is release-candidate-ready; files 44; smoke URLs 14.
- pass: post-deploy-smoke-runner - Post-deploy smoke is post-deploy-smoke-observed-live; origin https://moshequ.github.io/autonomous-game-lab; checks 15/15 passed, 0 blocked; local artifact predeploy-artifact-smoke-passed 15/15 passed.
- pass: live-site-monitor - Live monitor is live-site-monitor-passed; origin https://moshequ.github.io/autonomous-game-lab; checks 15/15 passed; live matches synced deploy true.
- pass: product-optimization - Product optimizer is product-optimization-ready; completion 0.397 vs gate 0.55; latest action already-applied.
- pass: first-move-coach - First-move coach is first-move-coach-ready; enabled targets 6; primary harbor-rings.
- pass: completion-loop - Completion loop is completion-loop-ready; prompt armed; target harbor-rings.
- pass: replay-loop - Replay loop is replay-loop-ready; prompt armed; target harbor-rings.
- pass: release-health - Release health guard is monitoring.
- pass: production-environment - Production environment status is production-env-missing.
- pass: production-bootstrap - Production bootstrap is production-bootstrap-ready; mode can-apply-configured-actions; external blockers 16.
- pass: production-blocker-handoff - Production blocker handoff is handoff-waiting-on-owner-inputs; owner inputs 5; next unlock support-contact.
- pass: production-activation - Production activation is activation-ready; mode dry-run; execution dry-run.
- pass: autonomous-operator - Autonomous operator is operator-held; selected none; execution not-requested.
- pass: autonomous-operator-history - Autonomous operator history is operator-history-ready; records 40; executed 9.
- pass: autonomous-cadence - Autonomous cadence is cadence-ready; Codex active-confirmed; GitHub scheduled.
- pass: autonomous-self-update - Autonomous self-update is self-update-ready; safe pending 17; unsafe pending 0; remote push held.
- pass: objective-audit - Objective audit is objective-in-progress; met 6 / 8; can complete false.

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
Sample target: 20 prompt view(s), 10 launch-mode event(s)
Installs: 0

## Performance Budget

Status: performance-budget-ready
Initial JS: 674.4 KB (183.2 KB gzip)
Deferred game chunk: GameCanvas-C43tVjYr.js
- pass: performance-initial-js-budget - Initial JS is 674.4 KB; budget is 675 KB.
- pass: performance-initial-js-gzip-budget - Initial JS gzip is 183.2 KB; budget is 200 KB.
- pass: performance-initial-css-budget - Initial CSS is 10.4 KB; budget is 40 KB.
- pass: performance-manifest - PWA manifest exists in dist.
- pass: performance-service-worker - Service worker exists in dist.
- pass: performance-game-runtime-deferred - GameCanvas-C43tVjYr.js is deferred from the initial shell.
- pass: performance-largest-js-deferred - Largest JS chunk is GameCanvas-C43tVjYr.js at 1361.1 KB.
- pass: performance-deferred-game-budget - Deferred game chunk is 1361.1 KB; monitor budget is 1600 KB.

## Release Candidate

Status: release-candidate-ready
Candidate: pwa-28570234b8f2
Files: 44
Aggregate SHA-256: 28570234b8f206bc9e9d72fec23f1a038520537470ae00836550970d66c07c5f
- pass: release-dist-inventory - 44 dist files inventoried.
- pass: release-required-files - 19/19 required files present.
- pass: release-game-pages - 10 generated game page(s) in dist.
- pass: release-performance-budget - Performance budget is performance-budget-ready.
- pass: release-release-health - Release health is monitoring.
- pass: release-production-response - Deploy allowed is true.
- pass: release-spend-guard - Spend mode is no-spend.
- pass: release-post-deploy-smoke-plan - 14 post-deploy smoke URL(s) planned.

## Post-Deploy Smoke

Status: post-deploy-smoke-observed-live
Origin: https://moshequ.github.io/autonomous-game-lab
Candidate: pwa-28570234b8f2
Checks: 15/15 passed (0 blocked)
Local artifact: predeploy-artifact-smoke-passed (15/15 passed)
- pass: smoke-app-shell - Live URL matched status and required text.
- pass: smoke-manifest-webmanifest - Live URL matched status and required text.
- pass: smoke-sw-js - Live URL matched status and required text.
- pass: smoke-privacy-html - Live URL matched status and required text.
- pass: smoke-support-html - Live URL matched status and required text.
- pass: smoke-install-html - Live URL matched status and required text.
- pass: smoke-compliance-json - Live URL matched status and required text.
- pass: smoke-monetization-json - Live URL matched status and required text.
- pass: smoke-app-ads-txt - Live URL matched status and required text.
- pass: smoke-well-known-assetlinks-json - Live URL matched status and required text.
- pass: smoke-gate-sample-html - Live URL matched status and required text.
- pass: smoke-seed-kit-html - Live URL matched status and required text.
- pass: smoke-sitemap-xml - Live URL matched status and required text.
- pass: smoke-games-canopy-bloom-html - Live URL matched status and required text.
- pass: smoke-release-candidate-manifest - Live release manifest is reachable; it does not match the current local release candidate.

## Post-Deploy Artifact Sync

Status: post-deploy-artifact-sync-passed
Workflow run: 26225259228
Artifact candidate: pwa-cb073add0dce
Live candidate: pwa-cb073add0dce
Live matches artifact: true
- pass: artifact-sync-gh-cli - gh version 2.92.0 (2026-04-28)
- pass: artifact-sync-github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: artifact-sync-explicit-pages-run - Explicit web-pwa-deploy.yml run is 26225259228.
- pass: artifact-sync-post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26225259228.
- pass: artifact-sync-strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 15/15.
- pass: artifact-sync-live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.

## Live Site Monitor

Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 15/15 passed (0 failed)
Live candidate: pwa-cb073add0dce
Live matches synced deploy: true
- pass: live-monitor-app-shell - Live read-only check passed.
- pass: live-monitor-manifest-webmanifest - Live read-only check passed.
- pass: live-monitor-sw-js - Live read-only check passed.
- pass: live-monitor-privacy-html - Live read-only check passed.
- pass: live-monitor-support-html - Live read-only check passed.
- pass: live-monitor-install-html - Live read-only check passed.
- pass: live-monitor-compliance-json - Live read-only check passed.
- pass: live-monitor-monetization-json - Live read-only check passed.

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
Mode: can-apply-configured-actions
Setup script: ops/github/setup-production.sh
- repository-channel-ready: bootstrap-repository-channel - Repository moshequ/autonomous-game-lab; git worktree ready; workflow dispatch ready.
- repository-bootstrap-ready: bootstrap-repository-bootstrap - Repository bootstrap repository-bootstrap-ready; helper ops/github/bootstrap-repository.sh; local git ready.
- waiting-for-origin-support: bootstrap-production-environment - Environment production-env-missing; public origin configured; support missing-production-address.
- ready-for-actions-pages: bootstrap-github-pages-hosting - Deployment plan is ready-for-pages; Pages workflow is .github/workflows/web-pwa-deploy.yml.
- ready-to-sync: bootstrap-github-pages-settings - GitHub CLI can configure Pages to use the Actions workflow source.
- waiting-for-self-update-gate: bootstrap-autonomous-self-update - Self-update gate missing; direct push held.
- partially-configured: bootstrap-github-actions-variables - 10/24 repository variable value(s) present in this environment.
- partially-configured: bootstrap-github-actions-secrets - 5/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: bootstrap-event-collector - Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: bootstrap-monetization-gate - Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: bootstrap-store-compliance-unblock - 3 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: bootstrap-android-release-unblock - Native package blocked-draft-ready; Android release blocked-needs-host-signing-play.

## Production Blocker Handoff

Status: handoff-waiting-on-owner-inputs
Detail: blocked-external-inputs
Owner inputs: 5
Missing env: 7
Missing secrets: 3
Next unlock: support-contact
- owner-input-required: handoff-support-contact - Production support email
- owner-input-required: handoff-production-analytics-browser - Browser production analytics
- owner-input-required: handoff-autonomous-rollup-credentials - Autonomous production rollups
- needs-live-sample: handoff-product-gate-sample - Product-gate live sample
- blocked-by-product-gates: handoff-ad-provider-config - Ad provider configuration

## Autonomous Operator

Status: operator-held
Mode: plan-only
Selected action: none
Execution: not-requested

## Autonomous Operator History

Status: operator-history-ready
Records: 40
Executed: 9

## Autonomous Cadence

Status: cadence-ready
Cadence: twice-daily-local-daily-ci
Codex app: active-confirmed
GitHub Actions: scheduled
Freshness: fresh; stale artifacts 0
- pass: cadence-codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: cadence-codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: cadence-codex-automation-single-active-owner-loop - No duplicate active Codex owner-loop automations share this workspace.
- pass: cadence-local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: cadence-self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: cadence-gate-recovery-script - autonomous:gate-recovery is node scripts/product-gate-recovery.mjs.
- pass: cadence-daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: cadence-automation-verifier - test:automation is node scripts/event-collector-smoke.mjs && npm run autonomous:collector-deploy-plan && node scripts/event-ingest-smoke.mjs && node scripts/local-event-bridge.mjs && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:retention && npm run autonomous:pwa-install && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:cadence && npm run autonomous:self-update && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:bundle-sync && node scripts/verify-autonomy.mjs.
- pass: cadence-browser-smoke - test:e2e is npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && playwright test && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness.
- pass: cadence-fresh-generated-evidence - All 39 required generated evidence artifacts are fresh within 36h.
- pass: cadence-github-scheduled-workflow - GitHub Actions daily workflow can run the full autonomous owner loop and upload evidence artifacts.
- pass: cadence-github-self-update-workflow - Gated GitHub workflow can persist allowlisted verified generated changes with production env and workflow token evidence when explicitly enabled.
- pass: cadence-post-self-update-deploy - Pages deployment builds the committed PWA artifact from the gated self-update workflow, so persisted generated improvements can publish without manual dispatch.
- pass: cadence-post-deploy-evidence-sync-workflow - Post-deploy evidence sync imports the strict Pages smoke artifact, refreshes live-site monitor evidence, and avoids creating an undeployed release candidate during evidence import.
- pass: cadence-zero-spend-operation - Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.

## Autonomous Self Update

Status: self-update-ready
Workflow: .github/workflows/autonomous-self-update.yml
Safe pending: 17
Unsafe pending: 0
Remote push ready: false
- pass: self-update-script-registered - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: self-update-daily-loop-refresh - autonomous:daily refreshes self-update evidence before owner/audit evidence.
- pass: self-update-daily-workflow-read-only - The ordinary daily workflow remains read-only, runs the owner loop, and uploads evidence artifacts.
- pass: self-update-self-update-workflow - A separate gated workflow can reproduce the owner loop with production env, verify it with gate env, and persist allowlisted changes.
- pass: self-update-post-self-update-deploy - Pages redeploys after the gated self-update workflow, then repeats deployability and post-deploy smoke checks.
- pass: self-update-safe-path-allowlist - 17 safe pending file(s), 0 unsafe pending file(s).
- pass: self-update-repository-optional - Git worktree is available on main.
- pass: self-update-remote-push-gated - Remote push remains held until GitHub credentials and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 are configured.
- pass: self-update-zero-spend-controls - Self-update owner-loop verification includes browser smoke coverage and does not create accounts, stores, ads, paid traffic, or revenue.

## Objective Audit

Status: objective-in-progress
Met: 6 / 8
Can mark complete: false

## Distribution

Store package: draft-ready
- pass: store-listing - Generated store listing copy exists and fits Google Play short-description limits.
- pass: store-listing-optimizer - Store listing optimizer is store-listing-optimizer-ready; focus canopy-bloom.
- pass: google-data-safety - Google Play data safety draft exists.
- pass: apple-privacy-labels - Apple App Privacy label draft exists.
- pass: native-packaging-path - Android TWA packaging draft exists while signing remains blocked.
- pass: native-package-handoff - Android native handoff is blocked-draft-ready.
- pass: ios-app-store-handoff - iOS App Store handoff is deferred-until-ios-payback.
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
- pass: compliance-hosted-privacy-url - Hosted privacy policy URL is required before public store submission.
- external-blocker: compliance-support-contact - Production support email is required before public store submission.
- external-blocker: compliance-google-play-account - Google Play developer account must be connected before Android submission.
- external-blocker: compliance-apple-developer-account - Apple Developer account remains deferred until iOS spend is justified.

Native package: blocked-draft-ready
- pass: native-production-host - Host is moshequ.github.io.
- pass: native-hosted-privacy - Privacy URL status is hosted.
- pass: native-android-signing-fingerprint - SHA-256 certificate fingerprint is configured.
- pass: native-store-screenshots - 4 screenshot asset(s) available.
- pass: native-icon-assets - 6 icon asset(s) available.
- blocker: native-google-play-account - Google Play developer account is not connected.

iOS release: deferred-until-ios-payback
- pass: ios-store-listing - Store listing metadata is ready for App Store Connect draft entry.
- pass: ios-apple-privacy-labels - Apple App Privacy labels are drafted from the store package.
- pass: ios-age-rating - Apple 4+ age-rating answers are drafted.
- pass: ios-store-screenshots - 4 screenshot asset(s) are available.
- pass: ios-hosted-privacy-url - Hosted privacy policy URL is available for App Review.
- external-blocker: ios-support-contact - Production support email is required before public store submission.
- pass: ios-native-app-like-value - PWA install, daily challenge, completion, replay, and multi-game catalog evidence prepare the native-value review story.
- deferred-paid-account: ios-apple-developer-account - Apple Developer Program account is not connected.
- missing-env: ios-app-store-connect-api - App Store Connect API credentials are not available to CI.
- held-by-economics: ios-annual-fee-payback - Store spend allowed is false; projected Apple payback is not available.

Android signing: signing-prepared
- fingerprint: FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2
- local secrets configured: true

Icon assets: icons-ready
- manifest icon: /icons/icon-192.png (192x192, any)
- manifest icon: /icons/icon-512.png (512x512, any)
- manifest icon: /icons/maskable-192.png (192x192, maskable)
- manifest icon: /icons/maskable-512.png (512x512, maskable)

- Google Play: blocked, $25 cost gate.
- iOS App Store: deferred-until-ios-payback, $99/year cost gate.

## Promotion Rule

Do not package native apps until retention gates, privacy URL, and account credentials exist.
