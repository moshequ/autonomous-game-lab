# Autonomous Operator

Generated: 2026-05-22T03:14:40.507Z
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

## Eligible Local Actions

- refresh-first-move-coach
- refresh-completion-loop
- refresh-replay-loop

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
