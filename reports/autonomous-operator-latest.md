# Autonomous Operator

Generated: 2026-05-21T02:55:14.160Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: apply-safe-improvements
Selected action: apply-safe-improvements
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- apply-safe-improvements: npm run autonomous:experiments && npm run autonomous:improve && npm run autonomous:sync-experiments

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-support-feedback
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- run-post-deploy-smoke
- refresh-product-gate-recovery
- optimize-store-listing
- apply-safe-improvements

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-cadence: not-selected-this-run
- refresh-autonomous-self-update: not-selected-this-run
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: not-selected-this-run
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: not-selected-this-run
- check-performance-budget: not-selected-this-run
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: not-selected-this-run
- sync-post-deploy-artifact: status-monitor
