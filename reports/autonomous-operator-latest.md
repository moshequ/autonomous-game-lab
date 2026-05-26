# Autonomous Operator

Generated: 2026-05-26T14:47:29.182Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: seed-portfolio-traffic
Selected action: seed-portfolio-traffic
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- seed-portfolio-traffic: npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition && npm run autonomous:organic-seed-loop

## External Input Handoff

- none
- recommended path: none
- lowest-input path: none
- public status: none
- missing inputs: none

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- refresh-replay-loop
- apply-safe-improvements

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- refresh-organic-seed-loop: not-selected-this-run
- refresh-support-feedback: status-monitor
- optimize-daily-retention: status-monitor
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
