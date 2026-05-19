# Completion Loop

Generated: 2026-05-19T00:12:09.168Z
Status: completion-loop-ready
Target: Harbor Rings (harbor-rings)
Completion: 40% / 55%
Abandonment: 60%

## Prompt Policy

- Status: armed
- Surface: autonomy-cockpit-completion-card
- Trigger: after-progress-checkpoint at move 3
- Telemetry: completion_nudge_viewed, completion_nudge_clicked, completion_nudge_dismissed, level_completed, game_abandoned

## Missions

- armed: reach-progress-checkpoint - Reach move 3
- armed: choose-keep-playing - Choose to keep playing from the completion nudge
- armed: complete-after-nudge - Complete the run after a progress checkpoint
- armed: measure-abandonment - Measure abandoned runs against nudge exposure

## Guardrails

- zeroPaidSpend: true
- midRunOnly: true
- onePromptPerRun: true
- noForcedTutorial: true
- noAutoMove: true
- noRuleChange: true
- noPaidRewards: true
- noRevenueEnablement: true
- noDarkPatterns: true
- requireAbandonmentTelemetry: true
- canNudgeCompletion: true
- completionReady: false
- monetizationStillBlocked: true

## Next Actions

- Improve first-game completion from 40% toward 55% with a measured checkpoint nudge.
- Compare completion_nudge_viewed/clicked/dismissed against level_completed and game_abandoned before changing copy.
- Keep completion nudges optional, rule-neutral, and zero-spend until product gates pass.
