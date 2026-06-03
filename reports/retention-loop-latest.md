# Retention Loop

Generated: 2026-06-03T13:23:55.388Z
Status: retention-loop-ready
Daily challenge: Market Pulse (market-pulse)
D1 retention: 17%
Replay rate: 31%

## Missions

- armed: finish-daily-challenge - Finish Market Pulse
- armed: show-daily-goal-reward - Show daily goal reward after a finished run
- armed: return-tomorrow - Return tomorrow for a fresh board
- armed: confirm-return-intent - Queue 2026-06-04 board intent
- armed: show-return-commitment - Show saved return path options for 2026-06-04
- armed: copy-return-link - Copy 2026-06-04 return link
- armed: save-return-reminder - Save 2026-06-04 return reminder
- armed: activate-return-intent - Start a queued return board
- armed: share-daily-seed - Share the daily seed after a run

## Reward Policy

- Recommended variant: daily-streak
- Daily streak weight: 80
- Replay-rate lift: 13%
- Reason: daily-streak beat score-booster on replayRate with 95% confidence

## Reward Surface

- Status: armed
- Surface: autonomy-cockpit-daily-reward-result
- Copy: Streak credit banked. Save tomorrow's board to turn this finish into a real D1 return.
- Animation: streak-pulse
- Telemetry: daily_goal_reward_viewed, daily_goal_reward_clicked

## Return Prompt

- Status: armed
- Surface: autonomy-cockpit-retention-card
- Copy: Queue tomorrow's board to protect your local daily streak.
- Next challenge date: 2026-06-04
- Telemetry: daily_return_prompt_viewed, daily_return_prompt_clicked, daily_return_prompt_dismissed

## Return Intent Activation

- Status: armed
- Surface: autonomy-cockpit-return-intent-card
- Copy: Your queued board is ready; start it to keep the local streak signal real.
- Telemetry: daily_return_intent_viewed, daily_return_intent_started, daily_return_intent_cleared
- Measurement: daily_return_intent_started with retentionCohortDate -> retentionReturnDate

## Return Commitment Follow-up

- Status: armed
- Surface: autonomy-cockpit-return-commitment-card
- Copy: Tomorrow's board is queued. Save a link or calendar reminder so the D1 signal can come back as a real start.
- Telemetry: daily_return_commitment_viewed

## Return Link

- Status: armed
- CTA: Copy return link
- Intent date: 2026-06-04
- Campaign: gate-sample-20260603-d1Retention
- Telemetry: daily_return_link_copied

## Return Calendar Reminder

- Status: armed
- CTA: Save reminder
- Intent date: 2026-06-04
- Campaign: gate-sample-20260603-d1Retention
- Telemetry: daily_return_calendar_downloaded

## D1 Sample Policy

- Status: collecting-sample
- Campaign: gate-sample-20260603-d1Retention
- Play path: /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260603-d1Retention
- Prompt views needed: 10
- Observed retained starts needed: 1
- Evidence: waiting-for-player-export
- Downloads scan: no-evidence-found; cooling down false
- Next action: Feature the daily challenge via /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260603-d1Retention and collect 10 prompt exposure(s) plus 1 retained start(s).

## Guardrails

- noPushNotifications: true
- noAccountsRequired: true
- noDarkPatterns: true
- noPaidRetentionMechanics: true
- noRewardedAdsUntilMonetizationGatesPass: true
- noNotificationPermissionRequest: true

## Next Actions

- Improve D1 retention from 17% toward 18% with local streak prompts.
- Feature the daily challenge via /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260603-d1Retention and collect 10 prompt exposure(s) plus 1 retained start(s).
- Improve replay rate from 31% toward 35% with the daily return mission.
- Do not use push notifications, accounts, paid rewards, or ads for retention until gates pass.
