# Replay Loop

Generated: 2026-05-21T19:13:36.334Z
Status: replay-loop-ready
Target: Harbor Rings (harbor-rings)
Replay rate: 31% / 35%
Sample: collecting-sample
Decision: collect-sample

## Prompt Policy

- Status: armed
- Surface: autonomy-cockpit-replay-card
- Trigger: after-completed-run
- Copy: Start one more board to keep today's local streak alive.
- Telemetry: replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, replay_clicked
- Sample: 0 view(s), 0 decision(s), 30 view(s) needed

## Reward Framing

- Status: active
- Variant: daily-streak
- Replay-rate lift: 13%

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
- requirePromptRunLink: true
- noDecisionWithoutSample: true
- canNudgeReplay: true
- completionReady: false
- retentionReady: false
- replayReady: false
- monetizationStillBlocked: true

## Next Actions

- Improve replay rate from 31% toward 35% with a measured completed-run prompt.
- Compare replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, and replay_clicked before changing copy.
- Keep replay prompts optional, local, and zero-spend until product gates pass.
