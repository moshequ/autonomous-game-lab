# Autonomous Game Lab Operating Spec

## Mission

Build a low-cost web-first game studio that detects board-game trends, creates original mobile-friendly games, measures player behavior, and improves winners through automated experiments.

The product must never clone protected expression. Trend data is only a signal for mechanics, session shape, audience taste, and theme direction.

## Autonomy Loop

1. Trend radar scores mechanics, themes, and audience demand.
2. Concept generator creates original game briefs and rejects high IP-risk similarity.
3. Game factory builds from reusable templates.
4. QA runs rule tests, screenshot tests, build checks, and bot simulations.
5. Web/PWA release collects analytics and rolls it up from PostHog, the first-party Worker collector, local event drops, or fixtures.
6. Retention loop chooses the daily challenge mission, local streak policy, and safe return prompts from analytics and experiment results.
7. PWA install loop measures browser-controlled install prompts and standalone launches as the zero-cost distribution path.
8. Performance budget checks the built PWA shell and keeps the Phaser/GameCanvas runtime deferred.
9. Product gate optimizer applies one guarded gameplay tuning step when completion, replay, or retention blocks monetization.
10. First-move coach turns first-session gate failures into first-turn, no-auto-move hints and measures shown/used/skipped behavior.
11. Analyst job ranks friction, retention, monetization, and next experiments.
12. Release health guard checks runtime errors, sample size, retention floors, abandonment, and whether rollout or experiment changes should pause.
13. Experiment evaluator compares variant outcomes from PostHog, local event drops, or fixtures.
14. Improvement applier makes bounded experiment-policy changes from winning variants or high-confidence backlog items only when release health allows it.
15. Store packager prepares privacy policy, data safety drafts, App Privacy label drafts, native packaging notes, and generated screenshots.
16. Store listing optimizer picks the data-led store focus, copy, keyword themes, and screenshot order from growth and retention signals.
17. Production readiness gate checks PWA artifacts, install-loop guardrails, performance budget, privacy controls, retention loop guardrails, product-gate optimization, first-move coaching, post-deploy smoke readiness, monetization thresholds, store package drafts, screenshot assets, and app-store blockers.
18. Promotion gate decides whether web, monetization, Android, or iOS can advance while preserving no-new-spend constraints.
19. Release candidate generator records the exact `dist/` inventory, content hashes, cache guidance, and post-deploy smoke URLs.
20. Post-deploy smoke runner verifies a live Pages URL with read-only checks and compares `/release-candidate.json` against the local candidate hash.
21. Repository readiness checks the local git/GitHub Pages deployment channel without mutating git or dispatching workflows.
22. Repository bootstrap prepares the local git, initial commit, origin, GitHub repository, and push path behind explicit zero-spend mutation gates.
23. Deployment planner prepares GitHub Pages release artifacts and keeps deploys gated.
24. Production bootstrap generates zero-spend GitHub setup commands, secrets handoff, and guarded workflow triggers.
25. Autonomous operator plans exactly one safe local action from the owner loop and records a capped durable audit trail.
26. Objective audit maps the original goal to evidence, prepared states, and blockers before completion is claimed.
26. Improvements ship behind feature flags.
27. Winning games graduate to Android, then iOS when revenue justifies it.

## Guardrails

- No copied names, rule text, art, board layouts, card text, or distinctive trade dress.
- No paid infrastructure without budget caps.
- No store submission without explicit account credentials and final review.
- No monetization experiment that violates platform rules or damages first-session trust.
- No push notifications, accounts, paid rewards, or ads as retention mechanics before product and monetization gates pass.
- No forced PWA install wall, notification permission prompt, or paid install reward.
- No performance claim without a fresh production-build budget artifact.
- No repository or production bootstrap action that creates accounts, buys resources, submits stores, enables revenue, or dispatches workflows without explicit gates.
- No autonomous operator run without exact command allowlisting, one-action limits, zero-spend checks, capped history, and external workflow blocks.
- No deploy without a fresh release-candidate manifest for the exact `dist/` artifact.
- No completion claim without objective-audit evidence for every original requirement and no remaining blockers.
- No deploy if lint, build, and smoke checks fail.
- No unattended CI promotion without uploaded artifacts for data, reports, and the production build.
- Roll back if crash, abandonment, or retention metrics move sharply against the release.

## Metrics

- `game_viewed`
- `game_started`
- `tutorial_completed`
- `turn_taken`
- `level_completed`
- `game_abandoned`
- `experiment_assigned`
- `improvement_requested`
- `runtime_error`
- `daily_challenge_viewed`
- `daily_challenge_started`
- `daily_challenge_completed`
- `daily_return_prompt_viewed`
- `daily_return_prompt_clicked`
- `daily_return_prompt_dismissed`
- `daily_return_intent_viewed`
- `daily_return_intent_started`
- `daily_return_intent_cleared`
- `completion_nudge_viewed`
- `completion_nudge_clicked`
- `completion_nudge_dismissed`
- `replay_prompt_viewed`
- `replay_prompt_clicked`
- `replay_prompt_dismissed`
- `streak_updated`
- `pwa_install_prompt_viewed`
- `pwa_install_prompt_clicked`
- `pwa_install_prompt_accepted`
- `pwa_install_prompt_dismissed`
- `pwa_installed`
- `pwa_launch_mode_detected`
- `first_move_coach_shown`
- `first_move_coach_used`
- `first_move_coach_skipped`

Core KPIs:

- game start rate
- first-game completion
- average score distribution
- replay rate
- session length
- day-1 retention
- ad offer acceptance
- revenue per active user

## First Product Slice

- Web/PWA portal
- Five playable original games: Harbor Rings, generated prototype Lantern Relay, generated prototype Harbor Circuit, generated prototype Foundry Ledger, and generated prototype Orbit Atlas
- Generic generated-game runtime that can play a portfolio of factory-created puzzle configs without a bespoke scene handoff
- Local analytics buffer with anonymous cohort ids and optional PostHog or Worker collector forwarding
- Local event ingestor that picks up exported `player-events*.json` files or Worker collector exports and dedupes them into the rollup input folder
- Cloudflare Worker/R2 event collector draft for a low-cost production data loop
- Isolated event-collector smoke check that proves Worker events can export into the autonomous rollup
- Isolated event-ingest smoke check that proves exported player events become local analytics and D1 retention
- Analytics rollup artifact for analyst, readiness, and improvement applier inputs
- D1 retention rollup from PostHog, exported player events, or offline fixture cohorts
- Release health guard for runtime errors, minimum sample size, metric floors, and automatic rollout holds
- Experiment evaluator that ranks variant outcomes before guarded policy shifts
- Generated privacy policy and store submission draft package
- Generated growth plan, sitemap, robots.txt, share manifest, and public game pages
- Growth optimizer that adjusts search/share page copy within acquisition guardrails
- Organic seed loop that promotes the highest-opportunity zero-cost campaign through player-initiated open/share actions
- Monetization planner and app runtime gate that generate app-ads.txt, placement policy, guarded revenue manifests, and blocked-event telemetry protection
- Experiment assignment
- Data-driven experiment policy with guarded automatic weight changes
- Credential-aware trend radar with offline fixtures
- Original concept generator with source-distance guardrails
- Prototype pipeline planner with monetization and app-store readiness gates
- Generated game factory for a multi-game no-handoff playable runtime portfolio
- Store packager for privacy policy, data safety drafts, App Privacy labels, native packaging notes, and generated store compliance drafts
- Store asset generator that captures real PWA screenshots from the production build
- Store listing optimizer that updates app-store copy, keyword themes, launch focus, and screenshot order from growth/retention evidence
- Bot simulation for pre-release balance checks
- Balance auto-tuning for safe target-score adjustments
- Improvement applier that records exactly which backlog changes were applied or deferred
- Portfolio policy that ranks every playable game and chooses a daily challenge from analytics/backlog signals
- Retention loop that turns the daily challenge into local streak missions and return-intent prompts with no push notifications, accounts, paid rewards, or ads
- PWA install loop that measures browser-controlled install prompts and standalone launches without install walls or paid install incentives
- Performance budget automation that verifies the initial PWA shell and defers Phaser/GameCanvas out of first paint
- Product gate optimizer that tunes completion/replay/retention blockers with one-step guarded target changes, replay telemetry, and queued-return activation
- First-move coach that enables first-turn hints only when product-gate evidence calls for it, with no auto moves or forced tutorial flow
- Production readiness report with privacy opt-out, retention gates, and store blockers
- Release health report that can hold deploys, monetization, and experiment changes
- Promotion decision report for web, monetization, Android, and iOS channels
- Release candidate report with content hashes, required PWA files, and post-deploy smoke URLs
- Post-deploy smoke report with live-origin status, read-only URL checks, and release-manifest hash comparison
- Repository readiness report with local git, GitHub target, Pages workflow, and workflow-dispatch blockers
- Repository bootstrap report and helper with explicit gates for local git initialization, initial commit, origin attach, GitHub repository creation, and push
- GitHub Pages deployment plan and gated deploy workflow
- Production bootstrap report and GitHub setup helper for repository variables, secrets, and guarded workflow runs
- Autonomous operator report and capped history that dry-runs or records one allowlisted zero-spend local action from the owner loop
- Objective audit report that keeps the full business objective, evidence, prepared paths, and blockers visible
- Event collector deployment plan and guarded Wrangler workflow
- Android TWA release plan and gated Bubblewrap workflow
- Zero-cost growth loop for organic search, player sharing, and PWA install signals
- Daily analyst script
- Scheduled CI runner for daily autonomous checks
- CI-ready lint/build/analyze workflow

## Autonomous Commands

- `npm run autonomous:trend` gathers trend signals and writes `data/trend-signals.json`.
- `npm run autonomous:concepts` turns those signals into original game candidates.
- `npm run autonomous:prototypes` turns candidates into build-ready prototype plans.
- `npm run autonomous:game-factory` generates playable runtime configs and registers them for balance, growth, and UI.
- `npm run autonomous:import-events` imports exported local player-event batches before analytics.
- `npm run autonomous:event-collector-smoke` proves the Worker collector, remote pull, ingestor, and rollup path in temporary storage.
- `npm run autonomous:event-ingest-smoke` proves the import and rollup path in temporary folders, then writes `data/event-ingest-smoke.json`.
- `npm run autonomous:analytics` normalizes behavior data into `data/analytics-rollup.json`.
- `npm run autonomous:release-health` evaluates runtime and behavior safety before rollout or experiment changes.
- `npm run autonomous:experiments` evaluates variant outcomes and recommends guarded winners.
- `npm run autonomous:store-package` regenerates privacy, store listing, data safety, privacy label, and native packaging drafts.
- `npm run autonomous:store-assets` captures real production-build screenshots and attaches them to the store package.
- `npm run autonomous:store-listing-optimize` chooses the data-led store focus, updates store copy, orders screenshots, and keeps ASO guardrails active.
- `npm run autonomous:store-compliance` generates content rating, target audience, ads disclosure, privacy/data, reviewer-access, and app-store blocker drafts.
- `npm run autonomous:growth-optimize` updates guarded page and CTA policy from organic/share analytics.
- `npm run autonomous:growth` regenerates game pages, share metadata, sitemap, robots.txt, and the growth report.
- `npm run autonomous:monetization` generates the revenue plan, app-ads.txt, public monetization manifest, web/native ad-provider readiness, and runtime guard policy while enforcing product gates.
- `npm run autonomous:sync-config` exports central game tuning values for the app.
- `npm run autonomous:sync-experiments` exports experiment policy values for the app.
- `npm run autonomous:simulate` runs deterministic bot playtests and writes balance reports.
- `npm run autonomous:tune` applies safe tuning changes from bot results.
- `npm run autonomous:improve` applies safe, bounded experiment updates from the analyst backlog.
- `npm run autonomous:portfolio` ranks the playable catalog, selects the daily challenge, and marks seed/improve/feature actions.
- `npm run autonomous:traffic` creates zero-spend seed campaigns, UTM links, share-manifest entries, and sample-size guardrails for under-measured playable games.
- `npm run autonomous:organic-seed-loop` ranks those campaigns and arms the in-portal seed card without paid incentives or automated external posting.
- `npm run autonomous:acquisition` connects campaign-attributed sessions to starts, completions, channel rows, and the next zero-spend growth placement.
- `npm run autonomous:retention` generates the daily challenge/streak loop, queued-return activation, retention missions, local storage keys, and no-spend retention guardrails.
- `npm run autonomous:pwa-install` generates the optional install prompt policy, standalone launch metrics, and no-pressure PWA install guardrails.
- `npm run autonomous:performance` checks the built app shell budget and confirms the deferred game runtime chunk.
- `npm run autonomous:release-candidate` records the content-hashed production build inventory, required files, cache guidance, and post-deploy smoke plan.
- `npm run autonomous:post-deploy-smoke` checks a deployed Pages origin from `AGL_DEPLOYED_PWA_ORIGIN` and compares the live release manifest against the local candidate hash.
- `npm run autonomous:repo-readiness` checks the git/GitHub Pages deployment channel without mutating git, creating repositories, or dispatching workflows.
- Production-facing scripts load git-ignored local env files (`.env`, `.env.local`, `.env.production`, `.env.production.local`, `ops/production.env`, and `ops/production.env.local`) with shell/CI precedence, report only file names and key names, and ignore mutation gates such as `AGL_ALLOW_*` unless they are present in the shell/CI environment.
- `npm run autonomous:repo-bootstrap` writes the guarded repository transport plan; add `-- --apply-local-git` only when local git initialization should be applied. Snapshot commits, origin attach, GitHub repository creation, and push require explicit shell/CI `AGL_ALLOW_*` gates, and push refuses dirty generated evidence.
- `npm run autonomous:product-optimize` consumes product-gate evidence, applies one guarded target-score step when safe, records history, and keeps completion/replay runtime improvement loops armed.
- `npm run autonomous:completion-loop` publishes the optional mid-run completion nudge policy and behind-pace finish-line coach with completion_nudge_* and finish_line_coach_* telemetry, no forced tutorial, no auto move, no score manipulation, and no paid reward.
- `npm run autonomous:replay-loop` publishes the optional after-completion replay prompt policy with replay_prompt_viewed/clicked/dismissed telemetry and no forced restart or paid reward.
- `npm run autonomous:first-move-coach` consumes product-gate evidence and publishes bounded first-turn coach targets plus shown/used/skipped telemetry contracts.
- `npm run autonomous:owner-loop` writes the owner-level operating state, next safe zero-cost action, guardrails, and credential-gated blockers.
- `npm run autonomous:operator` writes the dry-run operator plan, refreshes capped operator history, and can execute exactly one allowlisted local action when called with `-- --execute --action=<id>`.
- `npm run autonomous:objective-audit` writes the objective evidence ledger and keeps completion false while production, monetization, or app-store blockers remain.
- `npm run autonomous:readiness` verifies PWA build artifacts, privacy controls, monetization gates, and app-store blockers.
- `npm run autonomous:promote` writes the current channel promotion decision and next action.
- `npm run autonomous:deploy-plan` writes the zero-cost web deployment plan and Pages gate.
- `npm run autonomous:bootstrap` writes the production setup handoff, GitHub variable/secret sync script, and zero-spend workflow trigger plan.
- `npm run autonomous:collector-deploy-plan` writes the first-party analytics collector deployment plan and Cloudflare blockers.
- `npm run autonomous:android-release-plan` writes the Android TWA release gate and internal-testing blockers.
- `npm run autonomous:analyze` ranks data-driven fixes and next build candidates.
- `npm run autonomous:daily` runs the full local production loop.

The BGG XML API requires bearer authorization. Set `BGG_XML_API_TOKEN` to use live BGG hotness; otherwise the radar uses fixture trends so development can continue without external credentials.

## Current Gap

The system can generate and expose prototype plans; Lantern Relay, Harbor Circuit, Foundry Ledger, and Orbit Atlas prove the path from generated concept to playable game. The generated-game runtime now adds a small portfolio from trend/concept signals without bespoke scene handoffs, bot simulation can tune target scores, analytics can roll up from multiple sources including D1 cohorts, runtime errors are captured for release health, the release health guard can hold deploys and experiment changes, experiment outcomes can promote winning variants, the improvement applier can shift experiment policy within guardrails, the product gate optimizer can apply one safe target-score step from completion evidence, the first-move coach turns first-session friction evidence into measured first-turn hints, the completion loop turns first-run dropoff into a measured optional mid-run nudge and behind-pace finish-line coach, the replay loop turns replay-rate gaps into a measured optional after-run prompt, portfolio policy ranks games for daily featuring, traffic seeding turns those decisions into zero-spend measurable campaigns, acquisition learning keeps session-level campaign attribution attached to gameplay events, the organic seed loop turns the highest-opportunity campaign into a player-initiated open/share surface, the retention loop keeps the daily challenge, local streak mission, and queued-return activation aligned to data without push/account/paid mechanics, the PWA install loop measures optional install prompts and standalone launches without pressure tactics, owner-loop state chooses the next safe zero-cost production action from all subsystem reports, the autonomous operator converts that state into a one-action local execution plan with capped history, the release candidate records the exact deployable build with content hashes and smoke URLs, the post-deploy smoke runner verifies the live Pages build against that candidate manifest after deployment, repository readiness now blocks production deploy when the workspace is not attached to a git/GitHub Pages channel, repository bootstrap initializes and prepares that transport path behind explicit gates, the objective audit maps the original goal to proof and blockers, store/privacy drafts, store listing optimization, store compliance drafts, and real production-build screenshot assets are generated, zero-cost organic growth assets ship with the web build, growth copy/CTA policy is optimized from acquisition signals, monetization assets and a guarded app runtime surface are generated but kept disabled until gates pass, the first-party event collector now has a guarded deploy workflow, production bootstrap generates the GitHub setup helper, and Android TWA internal-testing release is planned behind signing, Play, and payback gates. The remaining gap is external: a hosted domain/support inbox plus the production secrets for the chosen analytics, app-store, and monetization channels.

## Production Credentials Needed Later

The code can run without external accounts. Production growth later needs:

- PostHog project key or the Worker/R2 event collector credentials
- GitHub repository permissions for Pages workflows and repository variables/secrets
- stable hosted domain and support inbox
- ad network account
- Google Play account
- Apple Developer account only after validation
