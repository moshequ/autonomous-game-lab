# Player Evidence Watchdog

Generated: 2026-05-22T19:25:10.045Z
Status: watchdog-cooling-down
Source hash: 29fd914cedbe
Public repo safe: true
Inbox events: 0
Imported events: 0
Gate sample inbox events: 0
Gate sample imported events: 0
Aggregate evidence notes: 0
Downloads scan: no-evidence-found; cooling down true
Next recommended Downloads scan: 2026-05-22T17:53:13.086Z

## Commands

- Refresh watchdog: npm run autonomous:player-evidence-watchdog
- Safe evidence refresh: npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:player-evidence-watchdog
- Explicit Downloads refresh: npm run autonomous:collect-sample-downloads && npm run autonomous:player-evidence-watchdog

## Controls

- zeroPaidSpend: true
- noPaidTraffic: true
- noSyntheticEvents: true
- noAutomaticDownloadsScan: true
- downloadsScanRequiresExplicitOptIn: true
- noExternalUpload: true
- noSecretValuesStored: true
- publicRepoSafe: true
- noRawPlayerEventsInPublicRepo: true
- publicAggregateEvidenceIsSupportingOnly: true
- aggregateEvidenceDoesNotPassGates: true
- noRevenueEnablement: true
- noStoreSubmission: true

## Next Actions

- Hold explicit Downloads scanning until 2026-05-22T17:53:13.086Z and keep player-initiated export/share routes active.
- Keep public issues and reports limited to aggregate, redacted evidence; never commit raw player event drops, secrets, or private exports.
