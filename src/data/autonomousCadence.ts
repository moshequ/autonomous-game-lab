export const autonomousCadence = {
  "status": "cadence-needs-attention",
  "schedulers": {
    "codexDesktop": {
      "status": "active-declared-unverified"
    },
    "githubActions": {
      "status": "scheduled"
    }
  },
  "commandPlan": {
    "operate": "npm run autonomous:operate",
    "executeOneLocalAction": "npm run autonomous:operator -- --execute",
    "afterAction": "npm run autonomous:after-action"
  },
  "freshness": {
    "status": "stale-evidence",
    "staleArtifacts": 4,
    "oldestAgeHours": 38.17,
    "staleAfterHours": 36
  }
} as const

export type AutonomousCadence = typeof autonomousCadence
