# Autonomous Operator

Generated: 2026-05-25T22:49:48.695Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-objective-audit
Selected action: refresh-objective-audit
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-objective-audit: npm run autonomous:objective-audit

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- refresh-objective-audit

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
