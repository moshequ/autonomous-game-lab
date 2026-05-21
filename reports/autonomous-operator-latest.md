# Autonomous Operator

Generated: 2026-05-21T07:44:48.321Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-autonomous-cadence
Selected action: refresh-autonomous-cadence
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-autonomous-cadence: npm run autonomous:cadence

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- refresh-support-feedback
- check-performance-budget
- optimize-store-listing

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-self-update: not-selected-this-run
- seed-portfolio-traffic: status-monitor
- refresh-organic-seed-loop: status-monitor
- refresh-support-feedback: not-selected-this-run
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: not-selected-this-run
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
- optimize-product-gates: status-monitor
