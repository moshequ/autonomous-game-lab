# Replay Loop

Generated: 2026-05-19T12:04:54.962Z
Status: replay-loop-ready
Target: Harbor Rings (harbor-rings)
Replay rate: 31% / 35%

## Prompt Policy

- Status: armed
- Surface: autonomy-cockpit-replay-card
- Trigger: after-completed-run
- Telemetry: replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, replay_clicked

## Missions

- armed: finish-run - Finish a Harbor Rings run
- armed: show-replay-prompt - Show one replay prompt after a completed run
- armed: confirm-replay - Start a fresh run from the completed-run prompt
- armed: respect-replay-dismissal - Let players leave after one completed run

## Guardrails

- zeroPaidSpend: true
- afterCompletedRunOnly: true
- onePromptPerCompletedRun: true
- noForcedReplay: true
- noAutoRestart: true
- noPaidRewards: true
- noRevenueEnablement: true
- noDarkPatterns: true
- requireCompletedRunTelemetry: true
- canNudgeReplay: true
- completionReady: false
- retentionReady: false
- replayReady: false
- monetizationStillBlocked: true

## Next Actions

- Improve replay rate from 31% toward 35% with a measured completed-run prompt.
- Compare replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, and replay_clicked before changing copy.
- Keep replay prompts optional, local, and zero-spend until product gates pass.
