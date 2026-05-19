# Product Gate Optimizer

Generated: 2026-05-19T17:31:02.202Z
Status: product-optimization-ready
Analytics source: fixture-sample
Release health: monitoring

## Product Gates

- Completion: 40% / 55%
- Replay: 31% / 35%
- D1 retention: 17% / 18%

## Actions

- already-applied: target-score-curve-harbor-rings; Same analytics evidence already produced a target-score tuning change.
- armed: runtime-first-move-coach; Completion is 40% and tutorial completion is 65%; highlight one strong first move without auto-playing.
- armed: runtime-completion-nudge; First-game completion is 40%; show one optional mid-run nudge and measure completion_nudge_* against level_completed and game_abandoned.
- armed: runtime-finish-line-coach; First-game completion is 40%; show target pace only when a run falls behind after the midpoint.
- armed: runtime-replay-telemetry; Replay rate is 31%; keep reset and in-canvas restart telemetry wired to replay_clicked.
- armed: runtime-replay-prompt; Replay rate is 31%; show one optional completed-run prompt and measure replay_prompt_* against replay_clicked.
- armed: runtime-return-intent-activation; D1 retention is 17%; convert queued local return intent into a measured next-session start.

## Candidates

- harbor-rings: starts 284; completion 39%; replay 31%; score 1669.

## Guardrails

- Minimum starts for balance change: 100
- One target-score step per run.
- No repeated target-score change for the same analytics evidence.
- Generated runtime targets stay synced to tuned balance config.
