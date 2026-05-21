# Autonomous Operator

Generated: 2026-05-21T06:52:39.414Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: prepare-release-candidate
Selected action: prepare-release-candidate
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- prepare-release-candidate: npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- refresh-support-feedback
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- refresh-product-gate-recovery
- optimize-store-listing

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-cadence: not-selected-this-run
- refresh-autonomous-self-update: not-selected-this-run
- seed-portfolio-traffic: status-monitor
- refresh-organic-seed-loop: status-monitor
- refresh-support-feedback: not-selected-this-run
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: not-selected-this-run
- check-performance-budget: not-selected-this-run
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
- optimize-product-gates: status-monitor
