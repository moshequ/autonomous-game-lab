# Autonomous Operator

Generated: 2026-05-19T16:11:39.373Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: seed-portfolio-traffic
Selected action: seed-portfolio-traffic
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- seed-portfolio-traffic: npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition && npm run autonomous:organic-seed-loop

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- seed-portfolio-traffic
- refresh-organic-seed-loop
- optimize-daily-retention
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- optimize-product-gates
- refresh-product-gate-recovery
- refresh-first-move-coach
- refresh-completion-loop
- refresh-replay-loop
- prepare-repository-channel
- bootstrap-production-setup
- refresh-objective-audit
- optimize-store-listing
- apply-safe-improvements
- collect-live-events

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-cadence: not-selected-this-run
- refresh-autonomous-self-update: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- optimize-daily-retention: not-selected-this-run
- measure-pwa-install-loop: not-selected-this-run
- check-performance-budget: not-selected-this-run
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: status-monitor
- optimize-product-gates: not-selected-this-run
- refresh-product-gate-recovery: not-selected-this-run
- collect-gate-sample-downloads: status-monitor
