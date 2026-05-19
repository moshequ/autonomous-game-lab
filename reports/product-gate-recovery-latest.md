# Product Gate Recovery

Generated: 2026-05-19T14:16:42.697Z
Status: product-gate-recovery-ready
Analytics source: fixture-sample
Failing gates: 3
Primary bottleneck: firstGameCompletion
Quickest gate test: d1Retention
Primary experiment status: collecting-sample

## Gates

- needs-observed-lift: firstGameCompletion - 40% / 55%; needs 58 observed success(es); 30 prompt exposure(s) before next copy change.
- needs-observed-lift: replayRate - 31% / 35%; needs 7 observed success(es); 30 prompt exposure(s) before next copy change.
- needs-observed-lift: d1Retention - 17% / 18%; needs 1 observed success(es); 10 prompt exposure(s) before next copy change.

## Recovery Experiments

- collecting-sample: firstGameCompletion; views 0/30; action rate n/a; next hold-current-runtime-copy.
- collecting-sample: replayRate; views 0/30; action rate n/a; next hold-current-runtime-copy.
- collecting-sample: d1Retention; views 0/10; action rate n/a; next hold-current-runtime-copy.

## Priorities

- 1. firstGameCompletion: completion-loop; First game completion is the largest revenue-blocking gap.
- 2. replayRate: replay-loop; Replay rate still blocks revenue and store payback assumptions.
- 3. d1Retention: retention-loop; D1 retention is the fastest gate to re-test with real retained-player evidence.

## Controls

- zeroPaidSpend: true
- revenueStillDisabledUntilAllGatesPass: true
- noSyntheticGatePasses: true
- requireObservedTelemetryBeforeCopyChange: true
- copyChangeRequiresSampleReady: true
- placementChangeRequiresSampleReady: true
- oneRecoveryFocusPerOwnerRun: true
- noPaidRewardsOrPushNotifications: true
- noAutomaticRuleChanges: true

## Next Actions

- First game completion needs 58 more observed success(es) at the current denominator before the gate clears.
- completion-loop is collecting-sample and should collect 30 more prompt exposure(s) before automation changes copy or placement again.
- D1 retention is the quickest separate gate test: 1 more observed success(es) would clear it.
- Keep revenue, paid acquisition, push notifications, and app-store submission disabled until every gate passes with observed data.
