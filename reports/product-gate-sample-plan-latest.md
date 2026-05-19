# Product Gate Sample Plan

Generated: 2026-05-19T15:13:08.119Z
Status: product-gate-sample-plan-ready
Analytics source: fixture-sample
Primary gate: firstGameCompletion
Prompt views needed: 70
Observed successes needed: 66
Imported gate-sample events: 0
Inbox gate-sample events: 0

## Missions

- #1 firstGameCompletion: collecting-sample; evidence waiting-for-player-export; 40% / 55%; needs 30 prompt view(s), 58 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-firstGameCompletion
- #2 replayRate: collecting-sample; evidence waiting-for-player-export; 31% / 35%; needs 30 prompt view(s), 7 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-replayRate
- #3 d1Retention: collecting-sample; evidence waiting-for-player-export; 17% / 18%; needs 10 prompt view(s), 1 success(es); /?game=canopy-bloom&utm_source=gate_sample&utm_campaign=gate-sample-20260519-d1Retention

## Commands

- Refresh plan: npm run autonomous:sample-plan
- Collect and refresh: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan
- Collect downloads and refresh: npm run autonomous:collect-sample-downloads

## Controls

- zeroPaidSpend: true
- noPaidTraffic: true
- noSyntheticGatePasses: true
- noAutomaticRuleChanges: true
- noRevenueEnablement: true
- noStoreSubmission: true
- playerInitiatedOnly: true
- localEventBridgeRequired: true
- realEventDropsOnly: true
- downloadsImportRequiresExplicitOptIn: true
- requireObservedTelemetryBeforeRecoveryChange: true

## Next Actions

- First game completion needs 30 more prompt exposure(s) and 58 observed success(es); feature Harbor Rings via /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-firstGameCompletion.
- D1 retention is the fastest gate sample: 10 prompt exposure(s), 1 observed success(es).
- Export or collect real browser events, then run npm run autonomous:collect-sample-downloads before changing copy, placement, revenue, or rules.
