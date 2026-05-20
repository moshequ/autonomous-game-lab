# Autonomous Operator

Generated: 2026-05-20T22:50:41.016Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: collect-live-events
Selected action: collect-live-events
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- collect-live-events: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- refresh-support-feedback
- measure-pwa-install-loop
- check-performance-budget
- prepare-release-candidate
- run-post-deploy-smoke
- refresh-product-gate-recovery
- bootstrap-production-setup
- optimize-store-listing
- collect-live-events

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
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: not-selected-this-run
- sync-post-deploy-artifact: status-monitor
