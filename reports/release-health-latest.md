# Release Health Guard

Generated: 2026-05-25T23:21:17.442Z
Status: monitoring
Analytics source: fixture-sample

## Controls

- Promote web: yes
- Deploy: yes
- Apply experiment changes: yes
- Monetization allowed: no
- Rollback required: no

## Checks

- warn: analytics-source - Using fixture analytics; deploy is allowed only for internal traffic collection.
- pass: sample-size - 375 game starts observed; 50 required before autonomous rollout decisions.
- pass: runtime-error-rate - 0 runtime errors; error rate is 0%.
- warn: first-game-completion-floor - First-game completion is 40%; monetization gate is 55%.
- warn: replay-floor - Replay rate is 31%; monetization gate is 35%.
- warn: d1-retention-floor - D1 retention is 17%; monetization gate is 18%; source is fixture-retention.
- warn: abandonment-ceiling - Abandonment rate is 60%.
