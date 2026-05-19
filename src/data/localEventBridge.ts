export const localEventBridge = {
  "generatedAt": "2026-05-19T07:36:18.380Z",
  "status": "bridge-waiting-for-export",
  "mode": "local-zero-spend-event-drop-bridge",
  "inbox": {
    "directory": "data/player-events/inbox",
    "filenamePattern": "/^player-events.*\\.json$/i",
    "validFiles": 0,
    "validEvents": 0
  },
  "imported": {
    "directory": "data/player-events",
    "validBatches": 0,
    "events": 0,
    "localEventsAvailable": false
  },
  "sourceDirectories": [
    {
      "path": "data/player-events/inbox",
      "role": "inbox",
      "exists": true,
      "matchedFiles": 0,
      "validFiles": 0,
      "validEvents": 0
    }
  ],
  "sourceFiles": [],
  "copiedFiles": [],
  "skippedFiles": [],
  "invalidFiles": [],
  "eventDropContract": {
    "filenamePattern": "player-events*.json",
    "acceptedPayloads": [
      "Array<AnalyticsEvent>",
      "{ \"events\": Array<AnalyticsEvent> }"
    ],
    "requiredFields": [
      "name or event",
      "createdAt or timestamp"
    ],
    "recommendedFields": [
      "properties.gameId",
      "properties.anonymousId",
      "properties.sessionDate"
    ],
    "inboxDirectory": "data/player-events/inbox",
    "importCommand": "npm run autonomous:import-events",
    "rollupCommand": "npm run autonomous:analytics",
    "recoveryCommand": "npm run autonomous:gate-recovery"
  },
  "controls": {
    "zeroPaidSpend": true,
    "localOnly": true,
    "noExternalUpload": true,
    "noSyntheticEvents": true,
    "noPiiRequired": true,
    "copyOnlyExplicitDropPaths": true,
    "downloadsFolderOptInOnly": true,
    "doesNotMutateProductGates": true
  },
  "nextActions": [
    "Use the in-app Export local analytics control after playtesting.",
    "Place the downloaded player-events file in data/player-events/inbox or pass AGL_LOCAL_EVENT_DROP_DIRS to copy from an explicit folder.",
    "Keep hosted collector/PostHog setup blocked until credentials exist."
  ]
} as const
