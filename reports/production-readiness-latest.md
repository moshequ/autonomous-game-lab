# Production Readiness

Generated: 2026-05-19T02:07:07.495Z

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
- blocker: repository-github-target - Set GITHUB_REPOSITORY/GH_REPO or add a GitHub origin remote.
- blocker: repository-origin-remote - No GitHub origin remote is available from this workspace.
- pass: repository-gh-cli - gh version 2.90.0 (2026-04-16)
- external-blocker: repository-gh-token - GH_TOKEN or GITHUB_TOKEN is not configured for non-interactive workflow dispatch.
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
- ready: repo-bootstrap-commit-current-snapshot - The current generated production snapshot is committed.
- waiting-for-github-target: repo-bootstrap-set-or-create-origin - Set GITHUB_REPOSITORY or GH_REPO before attaching origin.
- waiting-for-github-target: repo-bootstrap-create-github-repository - Set GITHUB_REPOSITORY or GH_REPO before creating a GitHub repository.
- waiting-for-commit-and-origin: repo-bootstrap-push-initial-snapshot - Push stays held until an origin remote exists and AGL_ALLOW_PUSH=1 is set.

## Web/PWA

Status: ready-after-build
- pass: manifest - PWA manifest exists in the production build.
- pass: install-icons - Generated install/store icons are icons-ready; 6 icons checked.
- pass: service-worker - Offline service worker exists.
- pass: privacy-control - External analytics opt-out is exposed in the app shell.
- pass: privacy-page - Generated privacy policy page is included in public assets and production build.
- pass: support-page - Generated support page is included in public assets and production build.
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
- pass: performance-budget - Performance budget is performance-budget-ready; initial JS 655 KB / 174.2 KB gzip; deferred game chunk GameCanvas-DIpwTMzc.js.
- pass: release-candidate - Release candidate is release-candidate-ready; files 38; smoke URLs 7.
- pass: post-deploy-smoke-runner - Post-deploy smoke is blocked-missing-origin; origin missing; checks 0/8 passed, 8 blocked.
- pass: product-optimization - Product optimizer is product-optimization-ready; completion 0.397 vs gate 0.55; latest action already-applied.
- pass: first-move-coach - First-move coach is first-move-coach-ready; enabled targets 6; primary harbor-rings.
- pass: completion-loop - Completion loop is completion-loop-ready; prompt armed; target harbor-rings.
- pass: replay-loop - Replay loop is replay-loop-ready; prompt armed; target harbor-rings.
- pass: release-health - Release health guard is monitoring.
- pass: production-environment - Production environment status is production-env-missing.
- pass: production-bootstrap - Production bootstrap is production-bootstrap-ready; mode waiting-for-external-credentials; external blockers 26.
- pass: autonomous-operator - Autonomous operator is operator-plan-ready; selected prepare-repository-channel; execution not-requested.
- pass: autonomous-operator-history - Autonomous operator history is operator-history-ready; records 11; executed 0.
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
Initial JS: 655 KB (174.2 KB gzip)
Deferred game chunk: GameCanvas-DIpwTMzc.js
- pass: performance-initial-js-budget - Initial JS is 655 KB; budget is 675 KB.
- pass: performance-initial-js-gzip-budget - Initial JS gzip is 174.2 KB; budget is 200 KB.
- pass: performance-initial-css-budget - Initial CSS is 9.6 KB; budget is 40 KB.
- pass: performance-manifest - PWA manifest exists in dist.
- pass: performance-service-worker - Service worker exists in dist.
- pass: performance-game-runtime-deferred - GameCanvas-DIpwTMzc.js is deferred from the initial shell.
- pass: performance-largest-js-deferred - Largest JS chunk is GameCanvas-DIpwTMzc.js at 1360.8 KB.
- pass: performance-deferred-game-budget - Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB.

## Release Candidate

Status: release-candidate-ready
Candidate: pwa-d5ff5976c0cb
Files: 38
Aggregate SHA-256: d5ff5976c0cb15447794290ec5b0c4e1c8badc522b0fb27fab68617fcf2b477f
- pass: release-dist-inventory - 38 dist files inventoried.
- pass: release-required-files - 13/13 required files present.
- pass: release-game-pages - 10 generated game page(s) in dist.
- pass: release-performance-budget - Performance budget is performance-budget-ready.
- pass: release-release-health - Release health is monitoring.
- pass: release-production-response - Deploy allowed is true.
- pass: release-spend-guard - Spend mode is no-spend.
- pass: release-post-deploy-smoke-plan - 7 post-deploy smoke URL(s) planned.

## Post-Deploy Smoke

Status: blocked-missing-origin
Origin: missing
Candidate: pwa-d5ff5976c0cb
Checks: 0/8 passed (8 blocked)
- blocked: smoke-app-shell - No deployed origin configured.
- blocked: smoke-manifest-webmanifest - No deployed origin configured.
- blocked: smoke-sw-js - No deployed origin configured.
- blocked: smoke-privacy-html - No deployed origin configured.
- blocked: smoke-support-html - No deployed origin configured.
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
- partially-configured: bootstrap-github-actions-variables - 1/22 repository variable value(s) present in this environment.
- waiting-for-secrets: bootstrap-github-actions-secrets - 0/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: bootstrap-event-collector - Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: bootstrap-monetization-gate - Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: bootstrap-store-compliance-unblock - 4 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: bootstrap-android-release-unblock - Native package blocked-draft-ready; Android release blocked-needs-host-signing-play.

## Autonomous Operator

Status: operator-plan-ready
Mode: plan-only
Selected action: prepare-repository-channel
Execution: not-requested

## Autonomous Operator History

Status: operator-history-ready
Records: 11
Executed: 0

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
- pass: store-screenshots - Generated store screenshot assets are screenshots-ready; 4 screenshots attached.
- pass: store-compliance - Store compliance is draft-ready-external-blockers.

Store listing optimizer: store-listing-optimizer-ready
- focus: canopy-bloom
- lead screenshot: phone-canopy-bloom-generated

Store compliance: draft-ready-external-blockers
- pass: compliance-content-rating - Content rating drafts avoid gambling, UGC, real-money prizes, mature content, and unrestricted web access.
- pass: compliance-target-audience - Target audience is general audience and not child-directed.
- pass: compliance-ads-declaration - Ads declaration is ads-disabled; revenue enabled is false.
- pass: compliance-privacy-data - Data safety, App Privacy labels, and account-deletion stance are drafted.
- pass: compliance-app-access - Reviewer access does not require credentials because accounts are disabled.
- pass: compliance-store-screenshots - 4 generated screenshot asset(s) are available.
- external-blocker: compliance-hosted-privacy-url - Hosted privacy policy URL is required before public store submission.
- external-blocker: compliance-support-contact - Production support email is required before public store submission.
- external-blocker: compliance-google-play-account - Google Play developer account must be connected before Android submission.
- external-blocker: compliance-apple-developer-account - Apple Developer account remains deferred until iOS spend is justified.

Native package: blocked-draft-ready
- blocker: native-production-host - Production host is not configured.
- blocker: native-hosted-privacy - Privacy URL status is needs-hosted-domain.
- blocker: native-android-signing-fingerprint - Signing fingerprint is missing.
- pass: native-store-screenshots - 4 screenshot asset(s) available.
- pass: native-icon-assets - 6 icon asset(s) available.
- blocker: native-google-play-account - Google Play developer account is not connected.

Icon assets: icons-ready
- manifest icon: /icons/icon-192.png (192x192, any)
- manifest icon: /icons/icon-512.png (512x512, any)
- manifest icon: /icons/maskable-192.png (192x192, maskable)
- manifest icon: /icons/maskable-512.png (512x512, maskable)

- Google Play: blocked, $25 cost gate.
- iOS App Store: defer, $99/year cost gate.

## Promotion Rule

Do not package native apps until retention gates, privacy URL, and account credentials exist.
