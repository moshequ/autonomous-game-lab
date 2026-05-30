# Product Gate Sample Plan

Generated: 2026-05-30T07:07:24.208Z
Status: product-gate-sample-plan-ready
Source hash: 501398e4ddbd
Analytics source: fixture-sample
Primary gate: firstGameCompletion
Default route: firstGameCompletion (gate-sample-20260530-firstGameCompletion)
Default route reason: First game completion is the primary revenue-blocking gap and can collect same-session evidence from the next player.
Prompt views needed: 70
Observed successes needed: 139
Imported gate-sample events: 0
Inbox gate-sample events: 0
Supporting aggregate evidence notes: 0
Return handoff missions: 1
Evidence sprint: ready-for-player-invite-sprint; routes 3; minimum counted runs 168
Downloads scan: no-evidence-found; cooling down false
Next recommended Downloads scan: 2026-05-22T17:53:13.086Z
Public sample page: /gate-sample.html
Safe local drop inbox: data/player-events/inbox
Safe local drop import: npm run autonomous:collect-local-event-drops
Runtime evidence policy: active

## Missions

- #1 firstGameCompletion: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 40% / 55%; needs 30 prompt view(s), 128 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260530-firstGameCompletion
- #2 replayRate: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 31% / 35%; needs 30 prompt view(s), 10 success(es); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260530-replayRate
- #3 d1Retention: collecting-sample; evidence waiting-for-player-export; aggregate notes 0; 17% / 18%; needs 10 prompt view(s), 1 success(es); /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260530-d1Retention

## Evidence Sprint

- Status: ready-for-player-invite-sprint
- Window: 2026-05-30 to 2026-05-31
- Minimum counted runs: 168
- gate-sample-firstGameCompletion: 30 prompt view(s), 128 success(es), 128 counted run(s); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260530-firstGameCompletion
- gate-sample-replayRate: 30 prompt view(s), 10 success(es), 30 counted run(s); /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260530-replayRate
- gate-sample-d1Retention: 10 prompt view(s), 1 success(es), 10 counted run(s); /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260530-d1Retention

## Commands

- Refresh plan: npm run autonomous:sample-plan
- Collect and refresh: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:retention
- Collect local drops and refresh: npm run autonomous:collect-local-event-drops
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
- sampleStartCreatesFreshRun: true
- downloadsImportRequiresExplicitOptIn: true
- downloadsScanBackoffRequired: true
- browserSelectedDropFolderSupported: true
- folderDropRequiresPlayerPicker: true
- folderDropNeverReadsFiles: true
- directTrafficSampleRouting: true
- playerInitiatedSampleSharing: true
- requireObservedTelemetryBeforeRecoveryChange: true
- publicAggregateEvidenceIsSupportingOnly: true
- aggregateEvidenceDoesNotPassGates: true

## Next Actions

- First game completion needs 30 more prompt exposure(s) and 128 observed success(es); feature Harbor Rings via /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260530-firstGameCompletion.
- D1 retention is the fastest gate sample: 10 prompt exposure(s), 1 observed success(es).
- Export or collect real browser events, then run npm run autonomous:collect-local-event-drops; use npm run autonomous:collect-sample-downloads only after explicit owner opt-in.
