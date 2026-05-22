# Production Response

Generated: 2026-05-22T09:13:03.714Z
Status: guarded-operations
Release health: monitoring
Live site monitor: live-site-monitor-passed
Deployment: ready-for-pages

## Controls

- Deploy allowed: true
- Rollback required: false
- Live site alert: false
- Experiments frozen: false
- Revenue disabled: true
- Paid spend disabled: true
- Store spend disabled: true
- Self-healing applied: false

## Actions

- monitoring: deployment-watch (deployment-safety) - release health has warnings but no blockers
- armed: experiment-learning (experiment-safety) - 3 experiment recommendation(s) available
- active: disable-revenue-features (monetization-safety) - monetization plan is blocked-by-product-gates
- active: enforce-zero-paid-spend (spend-safety) - unit economics mode is no-spend
