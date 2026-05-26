# Autonomous Operator

Generated: 2026-05-26T06:21:50.090Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-live-site-monitor
Selected action: refresh-live-site-monitor
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-live-site-monitor: npm run autonomous:live-monitor

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- seed-portfolio-traffic
- prepare-release-candidate
- refresh-live-site-monitor
- bootstrap-production-setup

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: not-selected-this-run
- refresh-organic-seed-loop: status-monitor
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: not-selected-this-run
- run-post-deploy-smoke: status-monitor
