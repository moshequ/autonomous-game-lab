export const productionUnlockRunner = {
  "status": "unlock-runner-idle",
  "mode": "plan-only",
  "summary": {
    "handoffItems": 8,
    "runnableUnlocks": 0,
    "queuedCommands": 0,
    "blockedUnsafeUnlocks": 0,
    "completedUnlockFingerprints": 0
  },
  "controls": {
    "zeroPaidSpend": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noPaidAcquisition": true,
    "noExternalPosting": true,
    "noWorkflowDispatch": true,
    "noSecretValuesStored": true,
    "dryRunByDefault": true,
    "staticCommandAllowlist": true,
    "executesOnlyConfiguredOrClearHandoffs": true,
    "commandFailuresStopRun": true
  },
  "commandQueue": [],
  "nextActions": [
    "Keep watching production blocker handoff; execute only after a handoff item becomes configured or clear.",
    "Preserve the static command allowlist before adding any production mutation command."
  ]
} as const

export type ProductionUnlockRunner = typeof productionUnlockRunner
