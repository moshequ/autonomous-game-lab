# Completion Loop

Generated: 2026-05-19T11:25:45.267Z
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
- armed: view-finish-line-coach - Show target pace when a run falls behind
- armed: focus-after-finish-line-coach - Choose to focus the board from the finish-line coach
- armed: measure-abandonment - Measure abandoned runs against nudge exposure

## Finish-Line Coach

- Status: armed
- Surface: autonomy-cockpit-finish-line-card
- Trigger: behind-pace-after-midpoint at move 6
- Telemetry: finish_line_coach_viewed, finish_line_coach_clicked, finish_line_coach_dismissed

## Guardrails

- zeroPaidSpend: true
- midRunOnly: true
- onePromptPerRun: true
- noForcedTutorial: true
- noAutoMove: true
- noRuleChange: true
- finishLineCoachBehindPaceOnly: true
- finishLineCoachAfterMidpointOnly: true
- noScoreManipulation: true
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
