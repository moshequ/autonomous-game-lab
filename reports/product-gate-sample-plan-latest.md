# Product Gate Sample Plan

Generated: 2026-05-19T07:34:43.291Z
Status: product-gate-sample-plan-ready
Analytics source: fixture-sample
Primary gate: firstGameCompletion
Prompt views needed: 70
Observed successes needed: 66

## Missions

- #1 firstGameCompletion: collecting-sample; 40% / 55%; needs 30 prompt view(s), 58 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-firstGameCompletion
- #2 replayRate: collecting-sample; 31% / 35%; needs 30 prompt view(s), 7 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-replayRate
- #3 d1Retention: collecting-sample; 17% / 18%; needs 10 prompt view(s), 1 success(es); /?game=canopy-bloom&utm_source=gate_sample&utm_campaign=gate-sample-20260519-d1Retention

## Commands

- Refresh plan: npm run autonomous:sample-plan
- Collect and refresh: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan

## Controls

- zeroPaidSpend: true
- noPaidTraffic: true
- noSyntheticGatePasses: true
- noAutomaticRuleChanges: true
- noRevenueEnablement: true
- noStoreSubmission: true
- playerInitiatedOnly: true
- localEventBridgeRequired: true
- requireObservedTelemetryBeforeRecoveryChange: true

## Next Actions

- First game completion needs 30 more prompt exposure(s) and 58 observed success(es); feature Harbor Rings via /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260519-firstGameCompletion.
- D1 retention is the fastest gate sample: 10 prompt exposure(s), 1 observed success(es).
- Export or collect real browser events through the local event bridge before changing copy, placement, revenue, or rules.
