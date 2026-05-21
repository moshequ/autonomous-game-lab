# Autonomous Game Lab

A web-first PWA game portal for creating original board-game-inspired games, measuring player behavior, and feeding improvements back into an autonomous release loop.

## Quick Start

```bash
npm install
npm run dev
```

## Production Loop

```bash
npm run lint
npm run build
npm run autonomous:performance
npm run autonomous:trend
npm run autonomous:concepts
npm run autonomous:prototypes
npm run autonomous:env
npm run autonomous:icons
npm run autonomous:collector-deploy-plan
npm run autonomous:analytics
npm run autonomous:store-package
npm run autonomous:store-assets
npm run autonomous:store-compliance
npm run autonomous:native-package
npm run autonomous:android-release-plan
npm run autonomous:ios-release-plan
npm run autonomous:sync-config
npm run autonomous:sync-experiments
npm run autonomous:simulate
npm run autonomous:tune
npm run autonomous:analyze
npm run autonomous:product-optimize
npm run autonomous:first-move-coach
npm run autonomous:sync-config
npm run autonomous:simulate
npm run autonomous:portfolio
npm run autonomous:traffic
npm run autonomous:acquisition
npm run autonomous:release-health
npm run autonomous:experiments
npm run autonomous:improve
npm run autonomous:readiness
npm run autonomous:promote
npm run autonomous:monetization
npm run autonomous:unit-economics
npm run autonomous:respond
npm run autonomous:incident-drill
npm run autonomous:deploy-plan
npm run autonomous:bootstrap
npm run autonomous:owner-loop
npm run autonomous:operator
npm run autonomous:objective-audit
npm run test:automation
```

Optional PostHog forwarding:

```bash
VITE_POSTHOG_KEY=your_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

Without those variables, analytics are buffered locally in the browser so development remains free.
For a no-cost production feedback loop without PostHog, deploy `ops/cloudflare/event-collector-worker.mjs` with an R2 bucket and set `VITE_EVENT_COLLECTOR_URL` plus `AGL_EVENT_COLLECTOR_EXPORT_URL`; the daily ingestor can pull those events into the same rollup.

Optional BGG trend data:

```bash
BGG_XML_API_TOKEN=your_bgg_token
```

Without that token, the trend radar uses fixture trends and still produces build candidates.

## What Exists Now

- Vite + React PWA portal
- Phaser-powered playable games: Harbor Rings, Lantern Relay, Harbor Circuit, Foundry Ledger, and Orbit Atlas
- Local analytics buffer with optional PostHog or first-party Worker collector forwarding
- Analytics rollup from PostHog, local event-drop files, or fixture fallback
- Generated privacy policy and store submission draft package
- Experiment assignment
- Data-driven experiment policy with guarded automatic weight changes
- Trend radar with licensed BGG-token support, cache reuse, source-readiness reporting, and offline fixtures
- Original concept generator with IP guardrails
- Prototype planner with monetization and store-readiness gates
- Production environment resolver for host, analytics, support, ad, signing, and store account readiness
- Repository readiness and bootstrap preflights for local git, GitHub target, origin/commit transport, Pages workflow, and guarded workflow dispatch
- Icon asset generator for PWA install icons, maskable launcher icons, and app-store icon drafts
- Store packager for privacy policy, data safety drafts, App Privacy labels, and native packaging notes
- Store asset generator for real PWA screenshots captured from the production build
- Store compliance generator for content rating, target audience, ads disclosure, privacy, and reviewer-access drafts
- Native Android TWA handoff generator with Bubblewrap config and Digital Asset Links template
- iOS App Store handoff planner with Capacitor metadata, App Privacy labels, screenshot checklist, and zero-spend Apple account gates
- Performance budget automation that keeps Phaser/GameCanvas out of the initial PWA shell
- Bot simulator for pre-release balance checks
- Balance auto-tuner for safe target-score adjustments
- Improvement applier that turns analyst backlog items into bounded experiment updates
- Production readiness gate for PWA, privacy, monetization, and store blockers
- Release health guard for runtime errors, metric floors, experiment holds, and deployment holds
- Experiment evaluator that compares variant outcomes before applying guarded policy shifts
- Promotion decision gate for web, monetization, Android, and iOS channels
- Unit economics spend guard for paid acquisition and app-store fee payback
- Autonomous production responder for rollback holds, safe experiment fallbacks, revenue holds, and spend holds
- Isolated incident drill that proves rollback and safe experiment fallback behavior
- Product gate optimizer that applies one guarded gameplay tuning step when completion/replay/retention block monetization
- First-move coach that uses product-gate evidence to enable first-turn, no-auto-move hints with shown/used/skipped telemetry
- Mid-run completion nudge that targets first-game completion and abandonment with optional `completion_nudge_*` telemetry
- Completed-run replay prompt that targets the replay-rate gate with optional `replay_prompt_*` telemetry
- Daily return prompt and queued-return activation that turn the D1 retention gap into local return-intent telemetry and measured next-session starts without push, accounts, ads, or paid rewards
- Release candidate generator with content-hashed `dist/` inventory, post-deploy smoke URLs, and a read-only live Pages smoke runner
- GitHub Pages deployment plan and gated deploy workflow
- Production bootstrap generator for zero-spend GitHub repository transport, variables, secrets, setup scripts, and workflow handoff
- Zero-spend traffic seeding campaigns with UTM links, share metadata, and sample-size guardrails
- Session-level acquisition attribution and a campaign learning report for zero-spend traffic
- Organic seed loop that chooses the current sample-growth target and exposes player-initiated share/open actions in the portal
- Autonomous owner-loop state that picks the next safe zero-cost production action and lists credential-gated blockers
- Autonomous operator that dry-runs one allowlisted zero-spend local action with a capped durable audit trail
- Autonomous cadence manifest that mirrors the daily Codex app automation, scheduled CI runner, recovery policy, and zero-spend verification chain
- Objective audit that maps the original project goal to current evidence, prepared paths, and blockers
- Autonomous analyst script
- Scheduled GitHub Actions runner for the full autonomous loop and browser smoke tests
- Playwright smoke test
- Operating spec in `docs/AUTONOMOUS_STUDIO.md`

## Current Build Queue

`Lantern Relay`, `Harbor Circuit`, `Foundry Ledger`, and `Orbit Atlas` are now playable generated prototypes. The prototype queue is generated into `data/prototype-pipeline.json` and exported to the app through `src/data/prototypePipeline.ts`; when every accepted concept is playable, the loop reports that state instead of inventing a fake next build.

Balance checks are generated into `data/balance-report.json` and exported through `src/data/balanceReport.ts`.

Tunable gameplay values live in `data/game-balance.json`. `npm run autonomous:tune` can adjust safe target-score values from bot results, then `npm run autonomous:sync-config` regenerates the frontend export.

Generated playable game configs live in `data/generated-playable-games.json`, `src/data/generatedPlayableGames.ts`, and `reports/generated-playable-games-latest.md`. `npm run autonomous:game-factory` turns accepted concepts first, then remaining trend signals, into a no-handoff runtime portfolio of at least five games, registers each generated game in `data/playable-games.json`, prunes stale generated ids, and adds its balance model to `data/game-balance.json`.

Trend source readiness lives in `data/trend-source-readiness.json`, `data/trend-cache.json`, `reports/trend-source-readiness-latest.md`, and `reports/trend-radar-latest.md`. `npm run autonomous:trend` uses licensed BGG hotness when `BGG_XML_API_TOKEN` is configured, reuses a fresh licensed cache during temporary source failures, and falls back to deterministic fixtures when no authorized source is available.

Analytics rollups live in `data/analytics-rollup.json` and `reports/analytics-rollup-latest.md`. Browser events include an anonymous install id, session id, and session date so `npm run autonomous:analytics` can compute D1 retention from PostHog or JSON event exports in `data/player-events/`; without live data it falls back to `data/analytics-sample.json` and `data/retention-sample.json`. `npm run autonomous:import-events` runs before the rollup, scans `data/player-events/inbox/` for `player-events*.json` exports, can pull a configured Worker collector export, dedupes batches into `data/player-events/`, and writes `data/event-ingest.json`; set `AGL_EVENT_IMPORT_DIRS`, `AGL_EVENT_IMPORT_DOWNLOADS=true`, or `AGL_EVENT_COLLECTOR_EXPORT_URL` to include additional sources. `npm run autonomous:event-collector-smoke` writes `data/event-collector-smoke.json` and proves the Worker collector stores sanitized events, exports them, and feeds the rollup. `npm run autonomous:event-ingest-smoke` writes `data/event-ingest-smoke.json`, proving an exported batch becomes `local-event-drops` metrics without mutating production analytics. `npm run test:automation` runs both smoke checks before the verifier.

Production environment readiness lives in `data/production-environment.json`, `src/data/productionEnvironment.ts`, `reports/production-environment-latest.md`, and `ops/production.env.example`. `npm run autonomous:env` reads deployment variables such as `AGL_PUBLIC_ORIGIN`, `AGL_SUPPORT_EMAIL`, PostHog or Worker collector credentials, web/PWA AdSense test config, native AdMob publisher config, Android signing fingerprint, and store account flags, then feeds hosted privacy, analytics, monetization, and native packaging gates. Production-facing scripts also load git-ignored local env files (`.env`, `.env.local`, `.env.production`, `.env.production.local`, `ops/production.env`, and `ops/production.env.local`) so credentials can persist between autonomous runs; shell/CI env wins, reports show only file names and key names, and mutation gates such as `AGL_ALLOW_*` still require shell/CI env. `npm run autonomous:android-signing` can generate local ignored Android TWA signing material, sync the public SHA-256 fingerprint plus redacted CI secret readiness into evidence, and keep keystore bytes/passwords out of committed files.

Support intake lives in `data/support-channel.json`, `data/support-feedback.json`, `src/data/supportFeedback.ts`, and `reports/support-feedback-latest.md`. `npm run autonomous:support-channel` publishes zero-spend GitHub Issue intake with public privacy warnings, and `npm run autonomous:support-feedback` reads those public issues without mutation. Analytics evidence issues are aggregate-only: starts, completions, replays, and optional D1 counts can support diagnosis, but they never mark product gates as passed or replace production analytics/event-drop evidence.

Repository readiness lives in `data/repository-readiness.json`, `src/data/repositoryReadiness.ts`, and `reports/repository-readiness-latest.md`. `npm run autonomous:repo-readiness` is read-only: it checks whether this workspace is a git worktree, whether a GitHub target repository or origin remote exists, whether `gh`/token-based workflow dispatch can be used, whether the Pages workflow includes post-deploy smoke, and whether the current release/deployment artifacts are ready. If the workspace is not attached to a repository, the owner loop treats production deploy as repository-channel blocked instead of pretending the Pages workflow can already run.

Repository bootstrap lives in `data/repository-bootstrap.json`, `src/data/repositoryBootstrap.ts`, `reports/repository-bootstrap-latest.md`, and `ops/github/bootstrap-repository.sh`. `npm run autonomous:repo-bootstrap` is dry-run by default and records the next zero-cost git/GitHub transport actions. `npm run autonomous:repo-bootstrap -- --apply-local-git` can initialize local git; initial commit, current snapshot commit, origin, repository creation, and push remain behind explicit shell/CI `AGL_ALLOW_*` environment flags. The helper refuses to push a dirty generated snapshot and never dispatches workflows.

Production bootstrap lives in `data/production-bootstrap.json`, `src/data/productionBootstrap.ts`, `reports/production-bootstrap-latest.md`, and `ops/github/`. `npm run autonomous:bootstrap` reads repository readiness/bootstrap, the production environment, deployment plan, collector plan, monetization, compliance, and Android release gates; it generates the exact GitHub variable/secret sync commands and guarded workflow helper while keeping account creation, paid resources, store submission, and revenue enablement blocked.

Icon assets live in `data/icon-assets.json`, `src/data/iconAssets.ts`, `reports/icon-assets-latest.md`, and `public/icons/`. `npm run autonomous:icons` renders deterministic PWA install icons, maskable Android launcher icons, Apple touch icon drafts, and a 1024px store icon, then production readiness verifies those files exist in the built app.

Release health lives in `data/release-health.json`, `src/data/releaseHealth.ts`, and `reports/release-health-latest.md`. `npm run autonomous:release-health` checks runtime errors, sample size, abandonment, completion, replay, and D1 retention; promotion, deployment, and automatic experiment changes are held when health is blocked.

Experiment results live in `data/experiment-results.json`, `src/data/experimentResults.ts`, and `reports/experiment-results-latest.md`. `npm run autonomous:experiments` compares assigned variants from PostHog, local event drops, or `data/experiment-sample.json`; `npm run autonomous:improve` consumes those recommendations first, then falls back to the analyst backlog. The analyst also writes `data/improvement-routing.json` so historical analytics rows for games that are no longer in `data/playable-games.json` are skipped instead of receiving automatic changes.

Product gate optimization lives in `data/product-optimization.json`, `src/data/productOptimization.ts`, and `reports/product-optimization-latest.md`. `npm run autonomous:product-optimize` consumes analytics, production gates, release health, playable registry, and balance config; it applies at most one target-score step for a playable game when completion blocks monetization, records history so the same evidence cannot repeat the same change, keeps generated runtime targets synced, and keeps first-move coaching, mid-run completion nudges, replay telemetry, completed-run replay prompts, and queued-return activation armed when product gates block monetization.

Completion loop policy lives in `data/completion-loop.json`, `src/data/completionLoop.ts`, and `reports/completion-loop-latest.md`. `npm run autonomous:completion-loop` turns completion and abandonment evidence into one optional mid-run checkpoint prompt with `completion_nudge_viewed`, `completion_nudge_clicked`, and `completion_nudge_dismissed` telemetry, plus a behind-pace finish-line coach with `finish_line_coach_viewed`, `finish_line_coach_clicked`, and `finish_line_coach_dismissed` telemetry. Both surfaces block forced tutorials, auto moves, score manipulation, rule changes, paid rewards, and revenue enablement until gates pass.

Replay loop policy lives in `data/replay-loop.json`, `src/data/replayLoop.ts`, and `reports/replay-loop-latest.md`. `npm run autonomous:replay-loop` turns replay-gate evidence into one optional after-completion prompt with `replay_prompt_viewed`, `replay_prompt_clicked`, `replay_prompt_dismissed`, and `replay_clicked` telemetry while blocking forced replay, auto-restarts, paid rewards, and revenue enablement until product gates pass.

Portfolio policy lives in `data/portfolio-policy.json`, `src/data/portfolioPolicy.ts`, and `reports/portfolio-policy-latest.md`. `npm run autonomous:portfolio` ranks every playable game from analytics, growth quality, and backlog pressure, chooses the daily challenge, seeds under-measured games with free traffic, and keeps no-paid-promotion/no-retirement guardrails active until live data justifies changes.

Traffic seeding lives in `data/traffic-seeding.json`, `src/data/trafficSeeding.ts`, `reports/traffic-seeding-latest.md`, and `public/share-manifest.json`. `npm run autonomous:traffic` turns the portfolio's seed list into zero-cost internal, organic-page, and player-share campaigns with UTM links, `seed_campaign_clicked` telemetry, and a minimum 40-start sample before quality judgment.

Acquisition learning lives in `data/acquisition-learning.json`, `src/data/acquisitionLearning.ts`, and `reports/acquisition-learning-latest.md`. `npm run autonomous:acquisition` connects traffic campaigns to session acquisition attribution, attributed starts, aggregate fallback metrics, channel rows, and the next zero-spend placement decision. The app enriches gameplay events with `acquisitionSource`, `acquisitionCampaign`, `acquisitionGameId`, and `acquisitionChannel` so exported events can prove which organic campaign produced real play.

Organic seed loop lives in `data/organic-seed-loop.json`, `src/data/organicSeedLoop.ts`, and `reports/organic-seed-loop-latest.md`. `npm run autonomous:organic-seed-loop` ranks active seed campaigns by sample gap and priority, arms a zero-cost portal card, and records `organic_seed_card_viewed` plus `organic_seed_share_clicked` while blocking automated external posting and paid incentives.

Retention loop policy lives in `data/retention-loop.json`, `src/data/retentionLoop.ts`, and `reports/retention-loop-latest.md`. `npm run autonomous:retention` turns the portfolio's daily challenge, analytics retention source, and reward-offer experiment winner into a local-only daily streak loop with `daily_challenge_*`, `daily_return_prompt_*`, `daily_return_intent_*`, and `streak_updated` telemetry while blocking push notifications, accounts, paid retention rewards, notification permission prompts, background wakeups, and ads until monetization gates pass.

PWA install-loop policy lives in `data/pwa-install-loop.json`, `src/data/pwaInstallLoop.ts`, and `reports/pwa-install-loop-latest.md`. `npm run autonomous:pwa-install` checks the manifest, service worker, install icons, growth channel, and browser-controlled install telemetry, then exposes optional `pwa_install_prompt_*`, `pwa_installed`, and `pwa_launch_mode_detected` events without forced prompts, install walls, notification permission asks, or paid install rewards.

Owner-loop state lives in `data/autonomous-owner-loop.json`, `src/data/autonomousOwnerLoop.ts`, and `reports/autonomous-owner-loop-latest.md`. `npm run autonomous:owner-loop` turns all subsystem reports into one production command state: current mode, autonomy score, next safe no-cost action, safe autonomous commands, completion/replay/retention/product guardrails, production bootstrap state, operator state, and the exact external credentials/accounts that block production learning, monetization, or app-store work.

Autonomous operator state lives in `data/autonomous-operator.json`, `src/data/autonomousOperator.ts`, and `reports/autonomous-operator-latest.md`. Its capped history lives in `data/autonomous-operator-history.json`, `src/data/autonomousOperatorHistory.ts`, and `reports/autonomous-operator-history-latest.md`. `npm run autonomous:operator` is dry-run by default: it reads the owner loop, selects one eligible zero-cost local action from an exact command allowlist, blocks recursive daily runs and external workflow commands, and records the plan or execution in a durable audit trail. Add `-- --execute --action=<id>` only when you want it to run exactly one allowlisted local action.

Autonomous cadence evidence lives in `data/autonomous-cadence.json`, `src/data/autonomousCadence.ts`, `reports/autonomous-cadence-latest.md`, and `ops/codex/autonomous-game-lab-daily-owner-loop.json`. `npm run autonomous:cadence` audits the daily Codex app automation manifest, confirms the saved local Codex automation when desktop automation storage is available, checks the scheduled GitHub workflow, `npm run autonomous:operate`, verification commands, recovery behavior, and zero-spend/no-store/no-revenue controls so unattended operation is visible in the portal and production readiness.

Objective audit state lives in `data/objective-audit.json`, `src/data/objectiveAudit.ts`, and `reports/objective-audit-latest.md`. `npm run autonomous:objective-audit` maps the original business goal to concrete evidence across the PWA, trend/game generation, telemetry, improvement loop, monetization path, app-store path, operator, bootstrap, and zero-spend controls; it explicitly keeps completion false while production credentials, live data, monetization gates, hosted compliance URLs, or store account/signing blockers remain.

Store package drafts live in `data/store-package.json`, `reports/store-package-latest.md`, and `public/privacy.html`. `npm run autonomous:store-package` regenerates the privacy policy, Google Play data safety draft, Apple App Privacy label draft, and Android TWA packaging notes.

Store screenshot assets live in `data/store-assets.json`, `src/data/storeAssets.ts`, `reports/store-assets-latest.md`, and `public/store-assets/screenshots/`. After `npm run build`, `npm run autonomous:store-assets` serves the built PWA, captures real mobile/desktop screenshots with Playwright, copies them into `dist/`, and attaches them to the store package.

Store listing optimization lives in `data/store-listing-optimizer.json`, `src/data/storeListingOptimizer.ts`, and `reports/store-listing-optimizer-latest.md`. `npm run autonomous:store-listing-optimize` uses growth quality, portfolio rank, acquisition focus, daily challenge status, and generated screenshot coverage to choose the data-led store focus, update store-package copy, order screenshot assets, and keep ASO guardrails active before compliance regenerates.

Performance budget automation lives in `data/performance-budget.json`, `src/data/performanceBudget.ts`, and `reports/performance-budget-latest.md`. `npm run autonomous:performance` reads the built PWA, enforces the initial JS/CSS budgets, verifies the Phaser/GameCanvas runtime stays deferred from the initial shell, and feeds readiness plus the owner loop.

Store compliance drafts live in `data/store-compliance.json`, `src/data/storeCompliance.ts`, and `reports/store-compliance-latest.md`. `npm run autonomous:store-compliance` turns the store package and monetization state into content rating, target audience, ads declaration, privacy/data, account-access, and reviewer-note drafts while keeping hosted privacy, support, signing, and developer accounts as external blockers.

Android signing prep lives in `data/android-signing.json`, `src/data/androidSigning.ts`, `reports/android-signing-latest.md`, and git-ignored local files under `ops/android/signing/` plus `ops/production.env.local`. `npm run autonomous:android-signing` uses keytool when available, falls back to OpenSSL PKCS#12 material when needed, writes only redacted readiness evidence to committed artifacts, and gives native packaging a public SHA-256 certificate fingerprint for Digital Asset Links.

Native app handoff assets live in `data/native-package.json`, `src/data/nativePackage.ts`, `reports/native-package-latest.md`, and `native/android/`. `npm run autonomous:native-package` generates a Trusted Web Activity manifest, Bubblewrap command config, and Digital Asset Links template; it keeps Android distribution blocked until a real production host, hosted privacy URL, screenshots, and Google Play account exist even when local signing is prepared. Android release planning lives in `data/android-release.json`, `src/data/androidRelease.ts`, and `reports/android-release-latest.md`; `npm run autonomous:android-release-plan` gates Bubblewrap packaging and internal testing behind native readiness, CI signing secret sync, Play credentials, and the unit-economics store-spend guard.

iOS App Store handoff assets live in `data/ios-release.json`, `src/data/iosRelease.ts`, `reports/ios-release-latest.md`, and `native/ios/`. `npm run autonomous:ios-release-plan` prepares Capacitor metadata, App Store checklist data, privacy labels, screenshot references, and native-value evidence while blocking Apple account creation, Xcode project generation, TestFlight, IAP setup, and store submission until payback and account gates clear.

Growth assets live in `data/growth-plan.json`, `data/growth-policy.json`, `data/growth-optimizer.json`, `reports/growth-plan-latest.md`, `reports/growth-optimizer-latest.md`, `public/games/`, `public/sitemap.xml`, `public/robots.txt`, and `public/share-manifest.json`. `npm run autonomous:growth-optimize` adjusts guarded page copy and CTA policy from acquisition/share analytics; `npm run autonomous:growth` gives every playable game an indexable page, share URL, channel focus, and no-cost acquisition metric.

Monetization plans live in `data/monetization-plan.json`, `src/data/monetizationPlan.ts`, `reports/monetization-plan-latest.md`, `public/monetization.json`, and `public/app-ads.txt`. `npm run autonomous:monetization` keeps revenue disabled until completion, replay, D1 retention, promotion, privacy, and ad-network gates pass, then exposes only low-risk rewarded/cosmetic tests. The app now consumes the generated runtime policy directly: before gates pass it shows a guarded revenue surface, records `store_gate_viewed`, and blocks `rewarded_ad_started`, `rewarded_ad_completed`, and `revenue_cents` telemetry.

Unit economics controls live in `data/unit-economics.json`, `src/data/unitEconomics.ts`, and `reports/unit-economics-latest.md`. `npm run autonomous:unit-economics` keeps paid acquisition and app-store fee spend at $0 until live revenue, retention gates, hosted privacy, promotion status, and payback windows justify capped reinvestment.

Production response controls live in `data/production-response.json`, `src/data/productionResponse.ts`, and `reports/production-response-latest.md`. `npm run autonomous:respond` consumes release health, experiment results, monetization state, and unit economics; when health is blocked it freezes risky experiment movement and restores safe fallback variants, and in guarded operation it keeps revenue and paid spend disabled until gates open.

Incident drill results live in `data/incident-drill.json`, `src/data/incidentDrill.ts`, and `reports/incident-drill-latest.md`. `npm run autonomous:incident-drill` runs the production responder against isolated synthetic blocked health data and verifies rollback holds, experiment freezes, and fallback weights without mutating live production artifacts.

Experiment values live in `data/experiment-policy.json`. `npm run autonomous:improve` can apply bounded changes from `data/improvement-backlog.json`, then `npm run autonomous:sync-experiments` regenerates the frontend export.

Production readiness checks are generated into `data/production-readiness.json` and `reports/production-readiness-latest.md`. Web/PWA can pass without paid services when release health is not blocked, the performance budget proves the initial shell is under budget, the release candidate records content hashes for the exact `dist/` artifact, the post-deploy smoke runner is ready to compare the live Pages build against that release manifest, completion/replay/retention improvement loops are wired, repository bootstrap and production bootstrap handoffs are generated, the autonomous operator has a dry-run one-action plan, the autonomous cadence is scheduled and guarded, and the objective audit is current, while monetization and app stores remain blocked until completion, replay, D1 retention, privacy assets, screenshot assets, and account credentials clear their gates.

Promotion decisions are generated into `data/promotion-decision.json`, `src/data/promotionDecision.ts`, and `reports/promotion-decision-latest.md`. `npm run autonomous:promote` allows web/PWA promotion when readiness passes, while preserving a no-new-spend posture for monetization and stores until gates are real.

Release candidates are generated into `data/release-candidate.json`, `src/data/releaseCandidate.ts`, `reports/release-candidate-latest.md`, and `dist/release-candidate.json`. `npm run autonomous:release-candidate` inventories the exact production build, records SHA-256 hashes, checks required PWA/compliance files, publishes cache-policy guidance, and creates the post-deploy smoke URL plan without executing external workflows. `npm run autonomous:post-deploy-smoke` then uses `AGL_DEPLOYED_PWA_ORIGIN` after a real deployment to perform read-only URL checks and compare `/release-candidate.json` with the local candidate hash; without an origin it reports `blocked-missing-origin` rather than faking a pass.

Continuous live-site monitoring is generated into `data/live-site-monitor.json`, `src/data/liveSiteMonitor.ts`, and `reports/live-site-monitor-latest.md`. `npm run autonomous:live-monitor` performs zero-spend, read-only checks against the public PWA between deploys, verifies privacy/support/compliance assets, and compares the live release manifest to the latest synced deploy artifact instead of assuming the current local build is deployed.

Deployment plans are generated into `data/deployment-plan.json`, `src/data/deploymentPlan.ts`, and `reports/deployment-plan-latest.md`. `npm run autonomous:deploy-plan` targets GitHub Pages and `.github/workflows/web-pwa-deploy.yml` deploys `dist/` only after the autonomous gate passes, including generated growth pages, sitemap assets, and the release-candidate manifest. The plan carries repository-channel readiness separately from artifact readiness, so a build can be deployable while the GitHub repository/Pages channel remains blocked. After `actions/deploy-pages` returns a Pages URL, the workflow runs `npm run autonomous:post-deploy-smoke -- --assert` with `AGL_DEPLOYED_PWA_ORIGIN` and uploads the smoke report artifacts. `npm run autonomous:repo-bootstrap` writes the guarded local/git/GitHub transport helper, and `npm run autonomous:bootstrap` writes `ops/github/setup-production.sh`, which can sync configured GitHub variables/secrets and optionally trigger the web/collector workflows without creating paid resources. The first-party analytics collector has its own deployment plan in `data/event-collector-deployment.json`, `src/data/eventCollectorDeployment.ts`, and `reports/event-collector-deployment-latest.md`; `.github/workflows/event-collector-deploy.yml` smoke-tests the Worker and deploys it with Wrangler once Cloudflare variables and secrets exist. `.github/workflows/android-twa-release.yml` runs the Android release planner and only attempts Bubblewrap packaging when host, signing, Play, and spend gates are open.

The scheduled production runner lives at `.github/workflows/autonomous-daily.yml`, with the local Codex automation mirrored in `ops/codex/autonomous-game-lab-daily-owner-loop.json`. `npm run autonomous:operate` runs the full local autonomy loop followed by browser smoke tests. `npm run autonomous:cadence` keeps the scheduler manifest, saved Codex automation status, CI workflow, recovery behavior, and zero-spend guardrails auditable.
