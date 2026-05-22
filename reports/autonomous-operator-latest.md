# Autonomous Operator

Generated: 2026-05-22T11:57:56.950Z
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

- measure-pwa-install-loop
- optimize-store-listing

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: status-monitor
- refresh-organic-seed-loop: status-monitor
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
