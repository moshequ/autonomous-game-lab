export const playerEvidenceWatchdog = {
  "status": "watchdog-cooling-down",
  "inbox": 0,
  "imported": 0,
  "notes": 0,
  "scanReady": false,
  "scanCooling": true,
  "publicSafe": true,
  "rawPrivate": true
} as const

export type PlayerEvidenceWatchdog = typeof playerEvidenceWatchdog
