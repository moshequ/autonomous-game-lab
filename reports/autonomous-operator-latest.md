# Autonomous Operator

Generated: 2026-05-20T22:27:35.295Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-support-feedback
Selected action: refresh-support-feedback
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-support-feedback: npm run autonomous:support-feedback

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-support-feedback
- optimize-daily-retention
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- run-post-deploy-smoke
- refresh-product-gate-recovery
- optimize-store-listing
- collect-live-events

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- refresh-autonomous-cadence: not-selected-this-run
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: status-monitor
- refresh-organic-seed-loop: status-monitor
- optimize-daily-retention: not-selected-this-run
- measure-pwa-install-loop: not-selected-this-run
- check-performance-budget: not-selected-this-run
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: not-selected-this-run
- sync-post-deploy-artifact: status-monitor
- optimize-product-gates: status-monitor
