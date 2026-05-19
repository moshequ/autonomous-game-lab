# Local Event Bridge

Generated: 2026-05-19T23:57:54.834Z
Status: bridge-waiting-for-export
Mode: local-zero-spend-event-drop-bridge

## Contract

- Filename: player-events*.json
- Inbox: data/player-events/inbox
- Import: npm run autonomous:import-events
- Rollup: npm run autonomous:analytics

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
- Last explicit Downloads scan: no-evidence-found

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
- copyOnlyExplicitDropPaths: true
- downloadsFolderOptInOnly: true
- downloadsFolderImportEnabled: false
- downloadsFolderRequiresExplicitEnv: true
- doesNotMutateProductGates: true

## Next Actions

- Use the in-app Export local analytics control after playtesting.
- Place the downloaded player-events file in data/player-events/inbox or pass AGL_LOCAL_EVENT_DROP_DIRS to copy from an explicit folder.
- Optionally run AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true npm run autonomous:local-event-bridge to scan Downloads explicitly.
- Keep hosted collector/PostHog setup blocked until credentials exist.
