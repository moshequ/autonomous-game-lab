# Incident Drill

Generated: 2026-05-20T09:02:17.794Z
Status: pass
Scenario: blocked-release-health
Responder status: incident-response

## Verified Controls

- Deploy allowed: false
- Rollback required: true
- Experiments frozen: true
- Self-healing applied: true

## Safe Weights

- first_session_pacing: guided 85, fast-start 15
- reward_offer: daily-streak 85, score-booster 15

## Actions

- rollback-hold
- safe-weights-first_session_pacing
- safe-weights-reward_offer
- freeze-experiment-learning
- disable-revenue-features
- enforce-zero-paid-spend
