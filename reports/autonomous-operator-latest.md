# Autonomous Operator

Generated: 2026-05-25T10:12:14.540Z
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

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- refresh-autonomous-cadence
- refresh-autonomous-self-update
- seed-portfolio-traffic
- refresh-organic-seed-loop

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-self-update: not-selected-this-run
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
