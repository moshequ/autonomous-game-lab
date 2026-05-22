# Local Event Bridge

Generated: 2026-05-22T01:10:09.133Z
Status: bridge-waiting-for-export
Mode: local-zero-spend-event-drop-bridge

## Contract

- Filename: player-events*.json
- Inbox: data/player-events/inbox
- Import: npm run autonomous:import-events
- Rollup: npm run autonomous:analytics
- Browser folder drop: true
- Browser folder autosave: true

## Sources

- data/player-events/inbox: available, 0/0 valid file(s), 0 event(s)
- explicit files: none configured

## Local State

- Inbox valid files: 0
- Inbox valid events: 0
- Imported batches: 0
- Imported events: 0
- Gate sample inbox events: 0
- Gate sample imported events: 0
- Export coverage status: waiting-for-first-export
- Inbox export receipts: 0
- Imported export receipts: 0
- Sensitive properties stripped: 0
- Last explicit Downloads scan: no-evidence-found
- Downloads scan cooling down: false
- Next recommended Downloads scan: 2026-05-22T00:49:49.509Z

## Gate Sample Evidence

- imported: none
- inbox: none

## Copied

- none

## Controls

- zeroPaidSpend: true
- localOnly: true
- noExternalUpload: true
- noSyntheticEvents: true
- noPiiRequired: true
- piiStrippingEnabled: true
- rawEventDropsStayLocal: true
- copyOnlyExplicitDropPaths: true
- downloadsFolderOptInOnly: true
- downloadsFolderImportEnabled: false
- downloadsFolderRequiresExplicitEnv: true
- localExportCoverageReceipts: true
- staleExportDebtVisibleInApp: true
- bridgeReadsExportReceipts: true
- browserSelectedDropFolderSupported: true
- browserSelectedDropFolderAutosave: true
- autosaveRequiresConnectedFolder: true
- autosaveNeverDownloadsWithoutManualClick: true
- folderHandleStoredInBrowserOnly: true
- doesNotMutateProductGates: true

## Next Actions

- Use the in-app Export local analytics control after playtesting.
- Connect a browser-selected local event drop folder to send future exports directly to the bridge inbox folder.
- After the folder is connected, play milestones autosave event drops locally without external upload.
- Prefer fresh PWA exports because they include event-count receipts for stale-export debt.
- Place the downloaded player-events file in data/player-events/inbox or pass AGL_LOCAL_EVENT_DROP_DIRS to copy from an explicit folder.
- Optionally run AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true npm run autonomous:local-event-bridge to scan Downloads explicitly.
- Keep hosted collector/PostHog setup blocked until credentials exist.
