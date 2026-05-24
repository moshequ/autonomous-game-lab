# Player Evidence Watchdog

Generated: 2026-05-24T22:33:22.355Z
Status: watchdog-ready-for-explicit-scan
Source hash: 157b993b0223
Public repo safe: true
Inbox events: 0
Imported events: 0
Gate sample inbox events: 0
Gate sample imported events: 0
Aggregate evidence notes: 0
Downloads scan: no-evidence-found; cooling down false
Next recommended Downloads scan: 2026-05-22T17:53:13.086Z

## Commands

- Refresh watchdog: npm run autonomous:player-evidence-watchdog
- Safe evidence refresh: npm run autonomous:collect-local-event-drops
- Explicit Downloads refresh: npm run autonomous:collect-sample-downloads && npm run autonomous:player-evidence-watchdog

## Controls

- zeroPaidSpend: true
- noPaidTraffic: true
- noSyntheticEvents: true
- noAutomaticDownloadsScan: true
- localDropImportBeforeDownloads: true
- explicitDownloadsScanNotRecommendedWithoutOwnerOptIn: true
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

- Keep the browser-selected drop-folder and inbox route active; use npm run autonomous:collect-sample-downloads only after explicit owner opt-in.
- Keep public issues and reports limited to aggregate, redacted evidence; never commit raw player event drops, secrets, or private exports.
