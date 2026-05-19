# Retention Loop

Generated: 2026-05-19T16:50:58.329Z
Status: retention-loop-ready
Daily challenge: Canopy Bloom (canopy-bloom)
D1 retention: 17%
Replay rate: 31%

## Missions

- armed: finish-daily-challenge - Finish Canopy Bloom
- armed: return-tomorrow - Return tomorrow for a fresh board
- armed: confirm-return-intent - Queue 2026-05-20 board intent
- armed: activate-return-intent - Start a queued return board
- armed: share-daily-seed - Share the daily seed after a run

## Reward Policy

- Recommended variant: daily-streak
- Daily streak weight: 80
- Reason: daily-streak beat score-booster on replayRate with 95% confidence

## Return Prompt

- Status: armed
- Surface: autonomy-cockpit-retention-card
- Next challenge date: 2026-05-20
- Telemetry: daily_return_prompt_viewed, daily_return_prompt_clicked, daily_return_prompt_dismissed

## Return Intent Activation

- Status: armed
- Surface: autonomy-cockpit-return-intent-card
- Telemetry: daily_return_intent_viewed, daily_return_intent_started, daily_return_intent_cleared

## Guardrails

- noPushNotifications: true
- noAccountsRequired: true
- noDarkPatterns: true
- noPaidRetentionMechanics: true
- noRewardedAdsUntilMonetizationGatesPass: true
- noNotificationPermissionRequest: true

## Next Actions

- Improve D1 retention from 17% toward 18% with local streak prompts.
- Improve replay rate from 31% toward 35% with the daily return mission.
- Do not use push notifications, accounts, paid rewards, or ads for retention until gates pass.
