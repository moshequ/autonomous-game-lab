# Autonomous Operator

Generated: 2026-05-22T19:44:57.868Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: collect-gate-sample-downloads
Selected action: collect-gate-sample-downloads
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- collect-gate-sample-downloads: npm run autonomous:collect-sample-downloads

## Eligible Local Actions

- seed-portfolio-traffic
- collect-gate-sample-downloads

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
- prepare-release-candidate: status-monitor
- run-post-deploy-smoke: status-monitor
