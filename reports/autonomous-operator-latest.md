# Autonomous Operator

Generated: 2026-05-23T02:45:46.875Z
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

## External Input Handoff

- none
- recommended path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- apply-safe-improvements

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: status-monitor
- refresh-organic-seed-loop: status-monitor
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
