# Autonomous Operator

Generated: 2026-05-26T22:30:51.961Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: collect-gate-sample-local-drops
Selected action: collect-gate-sample-local-drops
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- collect-gate-sample-local-drops: npm run autonomous:collect-local-event-drops

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- optimize-daily-retention
- collect-gate-sample-local-drops
- collect-live-events

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: status-monitor
- optimize-daily-retention: not-selected-this-run
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
