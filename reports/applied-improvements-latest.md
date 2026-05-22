# Applied Improvements

Generated: 2026-05-22T04:47:59.214Z
Source data hash: 833a2c6b58e8
Release health: monitoring
Experiment results: evaluated
Playable targets: harbor-rings, lantern-relay, harbor-circuit, foundry-ledger, orbit-atlas, pocket-draft, metro-loom, mosaic-haven, guild-garden, market-pulse

## Actions

- deferred: first_session_pacing for all-games; fast-start is already at the maximum safe traffic weight.
- skipped: reward_offer for all-games; same experiment result already produced an applied change.
- skipped: thumbnail_board_state_v2 for all-games; same experiment result already produced an applied change.
- skipped: first_session_pacing for harbor-rings; same diagnosed issue already produced an applied change.
- skipped: thumbnail_board_state_v2 for harbor-rings; same diagnosed issue already produced an applied change.
- deferred: target_score_curve for harbor-rings; confidence 69% is below 70% guardrail.
- skipped: reward_offer for harbor-rings; same diagnosed issue already produced an applied change.

## Guardrails

- Minimum variant weight: 15
- Maximum variant weight: 85
- Maximum shift per run: 10
