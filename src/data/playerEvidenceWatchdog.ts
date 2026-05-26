export const playerEvidenceWatchdog = {
  "status": "watchdog-ready-for-explicit-scan",
  "inbox": 0,
  "imported": 0,
  "notes": 0,
  "scanReady": true,
  "scanCooling": false,
  "publicSafe": true,
  "rawPrivate": true,
  "commandHandoff": {
    "safeLocalDropRefresh": {
      "copyType": "safe-local-drop-refresh",
      "label": "Safe local drop refresh",
      "command": "npm run autonomous:collect-local-event-drops",
      "preferred": true,
      "localDropFirst": true,
      "noExternalUpload": true
    },
    "explicitDownloadsRefresh": {
      "copyType": "explicit-downloads-refresh",
      "label": "Explicit Downloads refresh",
      "command": "npm run autonomous:collect-sample-downloads && npm run autonomous:player-evidence-watchdog",
      "readyForExplicitScan": true,
      "coolingDown": false,
      "requiresExplicitOwnerOptIn": true
    }
  }
} as const

export type PlayerEvidenceWatchdog = typeof playerEvidenceWatchdog
