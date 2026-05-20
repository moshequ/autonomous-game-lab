# Production Response

Generated: 2026-05-20T09:02:17.603Z
Status: guarded-operations
Release health: monitoring
Deployment: ready-for-pages

## Controls

- Deploy allowed: true
- Rollback required: false
- Experiments frozen: false
- Revenue disabled: true
- Paid spend disabled: true
- Store spend disabled: true
- Self-healing applied: false

## Actions

- monitoring: deployment-watch (deployment-safety) - release health has warnings but no blockers
- armed: experiment-learning (experiment-safety) - 2 experiment recommendation(s) available
- active: disable-revenue-features (monetization-safety) - monetization plan is blocked-by-product-gates
- active: enforce-zero-paid-spend (spend-safety) - unit economics mode is no-spend
