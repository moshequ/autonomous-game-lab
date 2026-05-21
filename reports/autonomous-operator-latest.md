# Autonomous Operator

Generated: 2026-05-21T21:52:08.325Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: refresh-organic-seed-loop
Selected action: refresh-organic-seed-loop
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- refresh-organic-seed-loop: npm run autonomous:organic-seed-loop

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- optimize-daily-retention

## Blocked Actions

- run-daily-owner-loop: daily-loop-recursion-blocked
- hold-for-external-input: status-monitor
- refresh-autonomous-cadence: status-monitor
- refresh-autonomous-self-update: status-monitor
- seed-portfolio-traffic: not-selected-this-run
- refresh-support-feedback: status-monitor
- optimize-daily-retention: not-selected-this-run
- measure-pwa-install-loop: status-monitor
- check-performance-budget: status-monitor
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
- sync-post-deploy-artifact: status-monitor
