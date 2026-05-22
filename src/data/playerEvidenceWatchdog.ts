export const playerEvidenceWatchdog = {
  "status": "watchdog-ready-for-explicit-scan",
  "inbox": 0,
  "imported": 0,
  "notes": 0,
  "scanReady": true,
  "scanCooling": false,
  "publicSafe": true,
  "rawPrivate": true
} as const

export type PlayerEvidenceWatchdog = typeof playerEvidenceWatchdog
