# Applied Improvements

Generated: 2026-05-21T03:00:22.339Z
Source data hash: 01f8ebcc4f9f
Release health: monitoring
Experiment results: evaluated
Playable targets: harbor-rings, lantern-relay, harbor-circuit, foundry-ledger, orbit-atlas, mosaic-haven, pocket-draft, metro-loom, grove-engine, canopy-bloom

## Actions

- deferred: first_session_pacing for all-games; fast-start is already at the maximum safe traffic weight.
- skipped: reward_offer for all-games; same experiment result already produced an applied change.
- skipped: thumbnail_board_state_v2 for all-games; same experiment result already produced an applied change.
- skipped: first_session_pacing for harbor-rings; same diagnosed issue already produced an applied change.
- applied: thumbnail_board_state_v2 for harbor-rings; shifted 10 weight points from title-first to board-state.
- deferred: target_score_curve for harbor-rings; confidence 69% is below 70% guardrail.
- skipped: reward_offer for harbor-rings; same diagnosed issue already produced an applied change.

## Guardrails

- Minimum variant weight: 15
- Maximum variant weight: 85
- Maximum shift per run: 10
