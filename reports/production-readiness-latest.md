# Production Readiness

Generated: 2026-05-25T19:41:18.162Z

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

Status: waiting-for-gh-auth
Mode: plan-only
Helper: ops/github/bootstrap-repository.sh
Local git: true
- done: repo-bootstrap-inspect-repository-channel - Repository readiness is repository-channel-ready.
- ready: repo-bootstrap-initialize-local-git - Git worktree is available at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new.
- ready: repo-bootstrap-create-initial-commit - The local repository has at least one commit.
- ready-for-explicit-snapshot-commit: repo-bootstrap-commit-current-snapshot - 4 non-generated source or artifact file(s) are not committed yet.
- ready: repo-bootstrap-set-or-create-origin - Origin remote resolves to moshequ/autonomous-game-lab.
- credential-gated: repo-bootstrap-create-github-repository - GitHub CLI auth or GH_TOKEN/GITHUB_TOKEN is required before remote repository creation.
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
- pass: organic-seed-loop - Organic seed loop is organic-seed-loop-ready; target market-pulse; player-initiated share guard active.
- pass: retention-loop - Retention loop is retention-loop-ready; daily challenge market-pulse; no-push/no-account guardrails active.
- pass: pwa-install-loop - PWA install loop is pwa-install-loop-ready; prompt surface autonomy-cockpit; cost $0.
- pass: performance-budget - Performance budget is performance-budget-ready; initial JS 689.3 KB / 186 KB gzip; deferred game chunk GameCanvas-B9Fg2GmF.js.
- pass: release-candidate - Release candidate is release-candidate-ready; files 72; smoke URLs 31.
- pass: post-deploy-smoke-runner - Post-deploy smoke is post-deploy-smoke-observed-live; origin https://moshequ.github.io/autonomous-game-lab; checks 32/32 passed, 0 blocked; local artifact predeploy-artifact-smoke-passed 32/32 passed.
- pass: live-site-monitor - Live monitor is live-site-monitor-passed; origin https://moshequ.github.io/autonomous-game-lab; checks 32/32 passed; live matches synced deploy true.
- pass: product-optimization - Product optimizer is product-optimization-ready; completion 0.397 vs gate 0.55; latest action already-applied.
- pass: first-move-coach - First-move coach is first-move-coach-ready; enabled targets 6; primary harbor-rings.
- pass: completion-loop - Completion loop is completion-loop-ready; prompt armed; target harbor-rings.
- pass: replay-loop - Replay loop is replay-loop-ready; prompt armed; target harbor-rings.
- pass: release-health - Release health guard is monitoring.
- pass: production-environment - Production environment status is production-env-missing.
- pass: production-bootstrap - Production bootstrap is production-bootstrap-ready; mode can-apply-configured-actions; external blockers 16.
- pass: production-blocker-handoff - Production blocker handoff is handoff-waiting-on-owner-inputs; owner inputs 4; next unlock production-analytics-browser.
- pass: production-unlock-runner - Production unlock runner is unlock-runner-idle; runnable 0; queued 0; unsafe 0.
- pass: production-activation - Production activation is activation-ready; mode dry-run; execution dry-run.
- pass: autonomous-operator - Autonomous operator is operator-held; selected none; execution not-requested.
- pass: autonomous-operator-history - Autonomous operator history is operator-history-ready; records 40; executed 2.
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
Target: market-pulse
Surface: portal-growth-loop
- armed: organic-open-seed-game - seed_campaign_clicked
- armed: organic-share-seed-link - organic_seed_share_clicked
- armed: organic-measure-seeded-start - game_started

## Retention Loop

Status: ready-local-loop
Daily challenge: market-pulse
Return prompt: armed (autonomy-cockpit-retention-card)
Return intent: armed (autonomy-cockpit-return-intent-card)
Return link: armed (return_intent)
Return calendar: armed (.ics)
- armed: finish-daily-challenge - daily_challenge_completed
- armed: return-tomorrow - daily_return_prompt_viewed
- armed: confirm-return-intent - daily_return_prompt_clicked
- armed: copy-return-link - daily_return_link_copied
- armed: save-return-reminder - daily_return_calendar_downloaded
- armed: activate-return-intent - daily_return_intent_started
- armed: share-daily-seed - share_clicked

## PWA Install Loop

Status: ready-browser-controlled
Prompt surface: autonomy-cockpit
Sample target: 20 prompt view(s), 10 launch-mode event(s)
Installs: 0

## Performance Budget

Status: performance-budget-ready
Initial JS: 689.3 KB (186 KB gzip)
Deferred game chunk: GameCanvas-B9Fg2GmF.js
- monitor: performance-initial-js-target - Initial JS is 689.3 KB; target is 686 KB.
- pass: performance-initial-js-budget - Initial JS is 689.3 KB; deploy cap is 700 KB.
- pass: performance-initial-js-gzip-budget - Initial JS gzip is 186 KB; budget is 200 KB.
- pass: performance-initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: performance-manifest - PWA manifest exists in dist.
- pass: performance-service-worker - Service worker exists in dist.
- pass: performance-game-runtime-deferred - GameCanvas-B9Fg2GmF.js is deferred from the initial shell.
- pass: performance-largest-js-deferred - Largest JS chunk is phaser.esm-Bs14CRsP.js at 1321.4 KB.
- pass: performance-deferred-game-budget - Deferred game chunk is 3.3 KB; monitor budget is 1600 KB.

## Release Candidate

Status: release-candidate-ready
Candidate: pwa-3f7a2f317132
Files: 72
Aggregate SHA-256: 3f7a2f31713211f3edffdb60c03fb914df8f49f80eafb191a79e012ebb057d0b
- pass: release-dist-inventory - 72 dist files inventoried.
- pass: release-required-files - 36/36 required files present.
- pass: release-game-pages - 10 generated game page(s) in dist.
- pass: release-performance-budget - Performance budget is performance-budget-ready.
- pass: release-release-health - Release health is monitoring.
- pass: release-production-response - Deploy allowed is true.
- pass: release-spend-guard - Spend mode is no-spend.
- pass: release-post-deploy-smoke-plan - 31 post-deploy smoke URL(s) planned.

## Post-Deploy Smoke

Status: post-deploy-smoke-observed-live
Origin: https://moshequ.github.io/autonomous-game-lab
Candidate: pwa-3f7a2f317132
Checks: 32/32 passed (0 blocked)
Local artifact: predeploy-artifact-smoke-passed (32/32 passed)
- pass: smoke-app-shell - Live URL matched status and required text.
- pass: smoke-manifest-webmanifest - Live URL matched status and required text.
- pass: smoke-sw-js - Live URL matched status and required text.
- pass: smoke-privacy-html - Live URL matched status and required text.
- pass: smoke-support-html - Live URL matched status and required text.
- pass: smoke-measurement-status-html - Live URL matched status and required text.
- pass: smoke-measurement-status-json - Live URL matched status and required text.
- pass: smoke-owner-unlock-brief-json - Live URL matched status and required text.
- pass: smoke-owner-unlock-preflight-json - Live URL matched status and required text.
- pass: smoke-analytics-unlock-html - Live URL matched status and required text.
- pass: smoke-analytics-unlock-json - Live URL matched status and required text.
- pass: smoke-product-gate-recovery-html - Live URL matched status and required text.
- pass: smoke-product-gate-recovery-json - Live URL matched status and required text.
- pass: smoke-install-html - Live URL matched status and required text.
- pass: smoke-compliance-json - Live URL matched status and required text.
- pass: smoke-monetization-json - Live URL matched status and required text.
- pass: smoke-store-readiness-html - Live URL matched status and required text.
- pass: smoke-store-readiness-json - Live URL matched status and required text.
- pass: smoke-app-ads-txt - Live URL matched status and required text.
- pass: smoke-well-known-assetlinks-json - Live URL matched status and required text.
- pass: smoke-gate-sample-html - Live URL matched status and required text.
- pass: smoke-sample-next-html - Live URL matched status and required text.
- pass: smoke-sample-next-json - Live URL matched status and required text.
- pass: smoke-sample-fastest-html - Live URL matched status and required text.
- pass: smoke-sample-fastest-json - Live URL matched status and required text.
- pass: smoke-seed-kit-html - Live URL matched status and required text.
- pass: smoke-seed-next-html - Live URL matched status and required text.
- pass: smoke-seed-next-json - Live URL matched status and required text.
- pass: smoke-sitemap-xml - Live URL matched status and required text.
- pass: smoke-monetization-html - Live URL matched status and required text.
- pass: smoke-games-canopy-bloom-html - Live URL matched status and required text.
- pass: smoke-release-candidate-manifest - Live release manifest is reachable; it does not match the current local release candidate.

## Post-Deploy Artifact Sync

Status: post-deploy-artifact-sync-passed
Workflow run: 26416191088
Artifact candidate: pwa-fe2016e57639
Live candidate: pwa-fe2016e57639
Live matches artifact: true
- pass: artifact-sync-gh-cli - gh version 2.92.0 (2026-04-28)
- pass: artifact-sync-github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: artifact-sync-successful-pages-run - Latest successful web-pwa-deploy.yml run is 26416191088.
- pass: artifact-sync-post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26416191088.
- pass: artifact-sync-strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 32/32.
- pass: artifact-sync-live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.

## Live Site Monitor

Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 32/32 passed (0 failed)
Live candidate: pwa-fe2016e57639
Live matches synced deploy: true
- pass: live-monitor-app-shell - Live read-only check passed.
- pass: live-monitor-manifest-webmanifest - Live read-only check passed.
- pass: live-monitor-sw-js - Live read-only check passed.
- pass: live-monitor-privacy-html - Live read-only check passed.
- pass: live-monitor-support-html - Live read-only check passed.
- pass: live-monitor-measurement-status-html - Live read-only check passed.
- pass: live-monitor-measurement-status-json - Live read-only check passed.
- pass: live-monitor-owner-unlock-brief-json - Live read-only check passed.

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
- enabled: coach-guild-garden - generated daily/portfolio game without live row yet
- monitor: coach-harbor-circuit - playable game without live row yet
- monitor: coach-lantern-relay - playable game without live row yet
- enabled: coach-market-pulse - generated daily/portfolio game without live row yet
- enabled: coach-metro-loom - generated daily/portfolio game without live row yet

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
- waiting-for-gh-auth: bootstrap-repository-bootstrap - Repository bootstrap waiting-for-gh-auth; helper ops/github/bootstrap-repository.sh; local git ready.
- waiting-for-origin-support: bootstrap-production-environment - Environment production-env-missing; public origin configured; support missing-production-address.
- ready-for-actions-pages: bootstrap-github-pages-hosting - Deployment plan is ready-for-pages; Pages workflow is .github/workflows/web-pwa-deploy.yml.
- ready-to-sync: bootstrap-github-pages-settings - GitHub CLI can configure Pages to use the Actions workflow source.
- waiting-for-self-update-gate: bootstrap-autonomous-self-update - Self-update gate missing; direct push held.
- partially-configured: bootstrap-github-actions-variables - 10/24 repository variable value(s) present in this environment.
- partially-configured: bootstrap-github-actions-secrets - 5/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: bootstrap-event-collector - Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: bootstrap-monetization-gate - Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: bootstrap-store-compliance-unblock - 3 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: bootstrap-android-release-unblock - Native package ready-for-bubblewrap-build; Android release blocked-needs-host-signing-play.

## Production Blocker Handoff

Status: handoff-waiting-on-owner-inputs
Detail: blocked-external-inputs
Owner inputs: 4
Missing env: 7
Missing secrets: 3
Next unlock: production-analytics-browser
Unlock kit: production-analytics-browser
- web-support-ready-store-email-deferred: handoff-support-contact - Web support channel and store support email
- owner-input-required: handoff-production-analytics-browser - Browser production analytics
- owner-input-required: handoff-autonomous-rollup-credentials - Autonomous production rollups
- needs-live-sample: handoff-product-gate-sample - Product-gate live sample
- blocked-by-product-gates: handoff-ad-provider-config - Ad provider configuration

## Production Unlock Runner

Status: unlock-runner-idle
Mode: execute-unlocked-local-followups
Runnable unlocks: 0
Queued commands: 0
Unsafe unlocks: 0
Execution: idle

## Autonomous Operator

Status: operator-held
Mode: plan-only
Selected action: none
Execution: not-requested

## Autonomous Operator History

Status: operator-history-ready
Records: 40
Executed: 2

## Autonomous Cadence

Status: cadence-ready
Cadence: twice-daily-local-daily-ci
Codex app: active-confirmed
GitHub Actions: scheduled
Freshness: fresh; stale artifacts 0
- pass: cadence-codex-automation-manifest - Codex app automation manifest declares autonomous-game-lab-daily-owner-loop.
- pass: cadence-codex-automation-installed - Codex app automation autonomous-game-lab-daily-owner-loop is active, scheduled, local, and pointed at this workspace.
- pass: cadence-codex-automation-single-active-owner-loop - No duplicate active Codex owner-loop automations share this workspace.
- pass: cadence-local-operate-script - autonomous:operate is npm run autonomous:daily && npm run autonomous:operator -- --execute && npm run autonomous:after-action && npm run test:e2e; autonomous:after-action is npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:acquisition && npm run autonomous:retention && npm run autonomous:organic-seed-loop && npm run autonomous:pwa-install && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:player-evidence-watchdog && npm run autonomous:measurement-status && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:deploy-plan && npm run autonomous:readiness && npm run autonomous:objective-audit && npm run autonomous:readiness && npm run autonomous:owner-loop && npm run autonomous:operator && npm run test:automation.
- pass: cadence-cadence-refresh-script - autonomous:cadence is node scripts/autonomous-cadence.mjs.
- pass: cadence-self-update-script - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: cadence-public-repo-security-audit - Public repo security audit is ready for moshequ/autonomous-game-lab with 0 workflow risks.
- pass: cadence-gate-recovery-script - autonomous:gate-recovery is node scripts/product-gate-recovery.mjs.
- pass: cadence-player-evidence-watchdog - Player evidence watchdog is watchdog-ready-for-explicit-scan; explicit Downloads scan ready true.
- pass: cadence-daily-loop-script - autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.
- pass: cadence-automation-verifier - test:automation is npm run autonomous:security-audit && node scripts/event-collector-smoke.mjs && npm run autonomous:collector-deploy-plan && node scripts/event-ingest-smoke.mjs && node scripts/local-event-bridge.mjs && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:acquisition && npm run autonomous:retention && npm run autonomous:organic-seed-loop && npm run autonomous:pwa-install && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:player-evidence-watchdog && npm run autonomous:measurement-status && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:readiness && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && npm run autonomous:cadence && npm run autonomous:self-update && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:deploy-plan && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run autonomous:bundle-sync && node scripts/verify-autonomy.mjs.
- pass: cadence-browser-smoke - test:e2e is npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness && npm run build && npm run autonomous:performance && npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor && npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap && npm run autonomous:deploy-plan && npm run autonomous:bootstrap && npm run autonomous:activate-production && npm run autonomous:readiness && playwright test && npm run autonomous:objective-audit && npm run autonomous:owner-loop && npm run autonomous:operator && npm run autonomous:owner-loop && npm run autonomous:readiness.
- pass: cadence-fresh-generated-evidence - All 41 required generated evidence artifacts are fresh within 36h.
- pass: cadence-github-scheduled-workflow - GitHub Actions daily workflow can run the full autonomous owner loop and upload evidence artifacts.
- pass: cadence-github-self-update-workflow - Gated GitHub workflow can persist allowlisted verified generated changes after daily runs once matching post-deploy evidence sync is complete, with production env and workflow token evidence when explicitly enabled.
- pass: cadence-post-self-update-deploy - Pages deployment builds the committed PWA artifact from gated self-update, public-evidence, and production-input workflows, so persisted generated improvements can publish without manual dispatch.
- pass: cadence-production-input-watch-workflow - Production input watch refreshes production environment, deploy/readiness evidence, owner-unlock queue follow-ups, and measurement status after owner-provided repository variables or secrets, gates direct commits, and avoids workflow dispatch or raw event storage.
- pass: cadence-public-evidence-intake-workflow - Public evidence intake ingests read-only GitHub Issues with read-only repository permissions, blocks production secrets on issue-triggered runs, moves direct commits into a scheduled/maintainer-only write job, refreshes safe aggregate handoff evidence, and avoids raw events or issue mutation.
- pass: cadence-post-deploy-evidence-sync-workflow - Post-deploy evidence sync imports strict Pages smoke evidence, refreshes PWA/store dependencies and downstream readiness, and avoids direct workflow mutation.
- pass: cadence-zero-spend-operation - Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.

## Autonomous Self Update

Status: self-update-ready
Workflow: .github/workflows/autonomous-self-update.yml
Safe pending: 0
Unsafe pending: 0
Remote push ready: false
- pass: self-update-script-registered - autonomous:self-update is node scripts/autonomous-self-update.mjs.
- pass: self-update-daily-loop-refresh - autonomous:daily refreshes self-update evidence before owner/audit evidence.
- pass: self-update-daily-workflow-read-only - The ordinary daily workflow remains read-only, runs the owner loop, and uploads evidence artifacts.
- pass: self-update-self-update-workflow - A separate gated workflow starts from the daily run, waits for matching post-deploy evidence sync, refreshes main, verifies with production env, and persists allowlisted changes.
- pass: self-update-post-self-update-deploy - Pages redeploys after gated self-update, public-evidence, and production-input workflows, then repeats deployability and post-deploy smoke checks.
- pass: self-update-safe-path-allowlist - 0 safe pending file(s), 0 unsafe pending file(s).
- pass: self-update-repository-optional - Git worktree is available on main.
- pass: self-update-remote-push-gated - Remote push remains held until GitHub credentials and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 are configured.
- pass: self-update-zero-spend-controls - Self-update owner-loop verification includes browser smoke coverage and does not create accounts, stores, ads, paid traffic, or revenue.

## Objective Audit

Status: objective-in-progress
Met: 5 / 8
Can mark complete: false

## Distribution

Store package: draft-ready
- pass: store-listing - Generated store listing copy exists and fits Google Play short-description limits.
- pass: store-listing-optimizer - Store listing optimizer is store-listing-optimizer-ready; focus market-pulse.
- pass: google-data-safety - Google Play data safety draft exists.
- pass: apple-privacy-labels - Apple App Privacy label draft exists.
- pass: native-packaging-path - Android TWA packaging draft exists while signing remains blocked.
- pass: native-package-handoff - Android native handoff is ready-for-bubblewrap-build.
- pass: android-root-assetlinks-handoff - Android root asset links handoff is root-assetlinks-live.
- pass: ios-app-store-handoff - iOS App Store handoff is deferred-until-ios-payback.
- pass: android-signing-prep - Android signing is signing-prepared; fingerprint available.
- pass: store-screenshots - Generated store screenshot assets are screenshots-ready; 4 screenshots attached.
- pass: store-compliance - Store compliance is draft-ready-external-blockers.
- pass: compliance-publication-pack - Compliance publication is waiting-for-production-inputs.

Store listing optimizer: store-listing-optimizer-ready
- focus: market-pulse
- lead screenshot: phone-market-pulse-generated

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

Native package: ready-for-bubblewrap-build
- pass: native-production-host - Host is moshequ.github.io; base path is /autonomous-game-lab/.
- pass: native-assetlinks-domain-verification - Digital Asset Links can be served from https://moshequ.github.io/.well-known/assetlinks.json; root verification is live-match.
- pass: native-hosted-privacy - Privacy URL status is hosted.
- pass: native-android-signing-fingerprint - SHA-256 certificate fingerprint is configured.
- pass: native-store-screenshots - 4 screenshot asset(s) available.
- pass: native-icon-assets - 6 icon asset(s) available.
- external-blocker: native-google-play-account - Google Play developer account is not connected; local TWA handoff can still be prepared.

Android root asset links: root-assetlinks-live
- actionable: android-root-assetlinks-root-assetlinks-needed - Android requires https://moshequ.github.io/.well-known/assetlinks.json; project Pages currently publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json.
- pass: android-root-assetlinks-source-assetlinks - Generated public assetlinks file is ready.
- pass: android-root-assetlinks-target-repository - Prepared to sync into moshequ/moshequ.github.io:main:.well-known/assetlinks.json.
- pass: android-root-assetlinks-root-live-verification - Root Digital Asset Links match app.autonomousgamelab.portal.
- owner-input-required: android-root-assetlinks-github-cli - A GitHub token with access to the root Pages repository is required before syncing.

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
