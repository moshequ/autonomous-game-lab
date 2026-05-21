export const productionBlockerHandoff = {
  "status": "handoff-waiting-on-owner-inputs",
  "statusDetail": "blocked-external-inputs",
  "summary": {
    "totalItems": 8,
    "ownerActionRequired": 5,
    "externalOwnerActions": 5,
    "zeroCostFirstActions": 1,
    "missingEnv": 7,
    "missingEnvironmentItems": 7,
    "missingSecrets": 3,
    "productGateBlockers": 3,
    "nextBestUnlockId": "support-contact",
    "nextBestUnlock": "support-contact",
    "nextBestZeroCostUnlockId": "support-contact"
  },
  "controls": {
    "zeroPaidSpend": true,
    "noSecretValues": true,
    "noSecretValuesStored": true,
    "noMutation": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "productGatesStillRequiredForRevenue": true,
    "storeSpendStillBlockedByUnitEconomics": true
  },
  "sourceStatus": {
    "productionEnvironment": "production-env-missing",
    "productionBootstrap": "production-bootstrap-ready",
    "objectiveAudit": "objective-in-progress",
    "autonomousOwnerLoop": "owner-loop-ready",
    "monetization": "blocked-by-product-gates",
    "storeCompliance": "draft-ready-external-blockers",
    "androidRelease": "blocked-needs-host-signing-play",
    "iosRelease": "deferred-until-ios-payback",
    "unitEconomics": "no-spend",
    "postDeployArtifactSync": "post-deploy-artifact-sync-passed"
  },
  "topHandoffItems": [
    {
      "id": "support-contact",
      "title": "Production support email",
      "status": "owner-input-required",
      "category": "store-compliance",
      "costMode": "zero-spend-if-existing-inbox",
      "ownerInputRequired": true
    },
    {
      "id": "production-analytics-browser",
      "title": "Browser production analytics",
      "status": "owner-input-required",
      "category": "measurement",
      "costMode": "use-existing-free-tier-or-first-party-collector",
      "ownerInputRequired": true
    },
    {
      "id": "autonomous-rollup-credentials",
      "title": "Autonomous production rollups",
      "status": "owner-input-required",
      "category": "measurement",
      "costMode": "use-existing-collector-or-posthog-project",
      "ownerInputRequired": true
    },
    {
      "id": "product-gate-sample",
      "title": "Product-gate live sample",
      "status": "needs-live-sample",
      "category": "product-gates",
      "costMode": "zero-paid-acquisition-only",
      "ownerInputRequired": false
    }
  ],
  "nextActions": [
    "Start with Production support email; it is the highest-priority zero-spend owner input.",
    "After any owner-provided variable or secret changes, run npm run autonomous:readiness and npm run test:e2e."
  ]
} as const

export type ProductionBlockerHandoff = typeof productionBlockerHandoff
