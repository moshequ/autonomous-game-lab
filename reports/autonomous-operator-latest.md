# Autonomous Operator

Generated: 2026-05-21T19:03:03.065Z
Status: operator-executed
Mode: execute-one-action
Owner decision: optimize-store-listing
Selected action: optimize-store-listing
Execution: executed

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- optimize-store-listing: npm run autonomous:store-package && npm run autonomous:store-listing-optimize && npm run autonomous:store-compliance

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-product-gate-recovery
- refresh-replay-loop
- optimize-store-listing

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
