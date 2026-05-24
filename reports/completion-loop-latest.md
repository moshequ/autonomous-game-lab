# Completion Loop

Generated: 2026-05-24T21:42:48.619Z
Status: completion-loop-ready
Target: Harbor Rings (harbor-rings)
Completion: 40% / 55%
Abandonment: 60%
Sample: collecting-sample
Decision: collect-sample

## Prompt Policy

- Status: armed
- Surface: autonomy-cockpit-completion-card
- Trigger: after-progress-checkpoint at move 3
- Telemetry: completion_nudge_viewed, completion_nudge_clicked, completion_nudge_dismissed, level_completed, game_abandoned
- Sample: 0 view(s), 0 decision(s), 30 view(s) needed

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
- Sample: 0 view(s), 0 decision(s), 20 view(s) needed

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
- requireRunIdOnAbandonment: true
- noDecisionWithoutSample: true
- canNudgeCompletion: true
- completionReady: false
- monetizationStillBlocked: true

## Next Actions

- Improve first-game completion from 40% toward 55% with a measured checkpoint nudge.
- Compare completion_nudge_viewed/clicked/dismissed against level_completed and game_abandoned before changing copy.
- Keep completion nudges optional, rule-neutral, and zero-spend until product gates pass.
