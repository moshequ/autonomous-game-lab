export const productionResponse = {
  "generatedAt": "2026-05-18T23:37:00.988Z",
  "status": "guarded-operations",
  "releaseHealthStatus": "monitoring",
  "deploymentStatus": "ready-for-pages",
  "controls": {
    "deployAllowed": true,
    "rollbackRequired": false,
    "experimentsFrozen": false,
    "revenueDisabled": true,
    "paidSpendDisabled": true,
    "storeSpendDisabled": true,
    "selfHealingApplied": false
  },
  "fallbackVariantByExperiment": {
    "first_session_pacing": "guided",
    "reward_offer": "daily-streak"
  },
  "actions": [
    {
      "generatedAt": "2026-05-18T23:37:00.988Z",
      "id": "deployment-watch",
      "status": "monitoring",
      "type": "deployment-safety",
      "target": "web-pwa",
      "reason": "release health has warnings but no blockers",
      "command": "Allow gated web deployment."
    },
    {
      "generatedAt": "2026-05-18T23:37:00.988Z",
      "id": "experiment-learning",
      "status": "armed",
      "type": "experiment-safety",
      "target": "all-experiments",
      "reason": "2 experiment recommendation(s) available",
      "command": "Allow bounded improvement applier to consume experiment evidence."
    },
    {
      "generatedAt": "2026-05-18T23:37:00.988Z",
      "id": "disable-revenue-features",
      "status": "active",
      "type": "monetization-safety",
      "target": "ads-and-purchases",
      "reason": "monetization plan is blocked-by-product-gates",
      "command": "Keep ad placements, purchases, and subscriptions disabled."
    },
    {
      "generatedAt": "2026-05-18T23:37:00.988Z",
      "id": "enforce-zero-paid-spend",
      "status": "active",
      "type": "spend-safety",
      "target": "paid-acquisition-and-store-fees",
      "reason": "unit economics mode is no-spend",
      "command": "Keep paid spend at $0.00 per day."
    }
  ],
  "policyDiff": null,
  "history": [
    {
      "generatedAt": "2026-05-18T20:55:07.039Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:03:12.608Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:08:57.195Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:11:04.011Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:20:50.765Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:28:53.197Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:35:51.223Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:45:40.576Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T21:55:52.381Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:03:53.822Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:16:26.220Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:27:13.402Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:28:38.090Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:42:24.166Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:51:43.795Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T22:59:47.715Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T23:06:57.548Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T23:10:27.372Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T23:21:12.970Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    },
    {
      "generatedAt": "2026-05-18T23:37:00.988Z",
      "mode": "guarded-operations",
      "releaseHealthStatus": "monitoring",
      "deploymentStatus": "ready-for-pages",
      "activeActionIds": [
        "disable-revenue-features",
        "enforce-zero-paid-spend"
      ],
      "policyChanged": false
    }
  ]
} as const

export type ProductionResponse = typeof productionResponse
