# Autonomous Operator

Generated: 2026-05-23T01:57:53.670Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-first-move-coach
Selected action: refresh-first-move-coach
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-first-move-coach: npm run autonomous:first-move-coach

## External Input Handoff

- none
- recommended path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-first-move-coach
- refresh-replay-loop
- apply-safe-improvements

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
