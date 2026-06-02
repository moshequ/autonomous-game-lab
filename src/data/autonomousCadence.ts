export const autonomousCadence = {
  "status": "cadence-needs-attention",
  "schedulers": {
    "codexDesktop": {
      "status": "active-confirmed"
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
    "staleArtifacts": 5,
    "oldestAgeHours": 78.42,
    "staleAfterHours": 36
  }
} as const

export type AutonomousCadence = typeof autonomousCadence
