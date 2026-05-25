# Autonomous Operator

Generated: 2026-05-25T08:29:09.173Z
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

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-support-feedback

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: not-selected-this-run
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
