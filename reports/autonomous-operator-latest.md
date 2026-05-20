# Autonomous Operator

Generated: 2026-05-20T21:44:56.297Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: measure-pwa-install-loop
Selected action: measure-pwa-install-loop
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- measure-pwa-install-loop: npm run autonomous:pwa-install

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-support-feedback
- optimize-daily-retention
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- run-post-deploy-smoke
- refresh-product-gate-recovery
- optimize-store-listing
- apply-safe-improvements
- collect-live-events

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-cadence: not-selected-this-run
- refresh-autonomous-self-update: not-selected-this-run
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: not-selected-this-run
- optimize-daily-retention: not-selected-this-run
- check-performance-budget: not-selected-this-run
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: not-selected-this-run
- sync-post-deploy-artifact: status-monitor
- optimize-product-gates: status-monitor
