# Product Gate Sample Plan

Generated: 2026-05-21T22:08:43.985Z
Status: product-gate-sample-plan-ready
Source hash: fcff7cc5bd40
Analytics source: fixture-sample
Primary gate: firstGameCompletion
Default route: d1Retention (gate-sample-20260522-d1Retention)
Prompt views needed: 70
Observed successes needed: 139
Imported gate-sample events: 0
Inbox gate-sample events: 0
Supporting aggregate evidence notes: 0
Downloads scan: no-evidence-found; cooling down true
Next recommended Downloads scan: 2026-05-22T00:49:49.509Z
Public sample page: /gate-sample.html
Runtime evidence policy: active

## Missions

- #1 firstGameCompletion: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 40% / 55%; needs 30 prompt view(s), 128 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-firstGameCompletion
- #2 replayRate: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 31% / 35%; needs 30 prompt view(s), 10 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-replayRate
- #3 d1Retention: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 17% / 18%; needs 10 prompt view(s), 1 success(es); /?game=canopy-bloom&utm_source=gate_sample&utm_campaign=gate-sample-20260522-d1Retention

## Commands

- Refresh plan: npm run autonomous:sample-plan
- Collect and refresh: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:retention
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
- downloadsScanBackoffRequired: true
- directTrafficSampleRouting: true
- playerInitiatedSampleSharing: true
- requireObservedTelemetryBeforeRecoveryChange: true
- publicAggregateEvidenceIsSupportingOnly: true
- aggregateEvidenceDoesNotPassGates: true

## Next Actions

- First game completion needs 30 more prompt exposure(s) and 128 observed success(es); feature Harbor Rings via /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-firstGameCompletion.
- D1 retention is the fastest gate sample: 10 prompt exposure(s), 1 observed success(es).
- Wait until 2026-05-22T00:49:49.509Z before the next explicit Downloads scan unless an inbox event drop appears.
