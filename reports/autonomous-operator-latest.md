# Autonomous Operator

Generated: 2026-05-21T15:00:21.531Z
Status: operator-plan-ready
Mode: plan-only
Owner decision: prepare-release-candidate
Selected action: prepare-release-candidate
Execution: not-requested

## Controls

- Zero paid spend: true
- Guardrails enforced: true
- Dry run by default: true
- Max actions per run: 1
- Local allowlist enforced: true
- External workflows blocked by default: true

## Selected Action

- prepare-release-candidate: npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor

## Eligible Local Actions

- seed-portfolio-traffic
- refresh-organic-seed-loop
- prepare-release-candidate
- run-post-deploy-smoke
- refresh-first-move-coach
- refresh-completion-loop
- refresh-replay-loop
- bootstrap-production-setup
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
- run-post-deploy-smoke: not-selected-this-run
- sync-post-deploy-artifact: status-monitor
