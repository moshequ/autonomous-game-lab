export const incidentDrill = {
  "generatedAt": "2026-05-20T09:02:17.794Z",
  "status": "pass",
  "scenario": "blocked-release-health",
  "isolated": true,
  "responderStatus": "incident-response",
  "controls": {
    "deployAllowed": false,
    "rollbackRequired": true,
    "experimentsFrozen": true,
    "revenueDisabled": true,
    "paidSpendDisabled": true,
    "storeSpendDisabled": true,
    "selfHealingApplied": true
  },
  "appliedSafeWeights": [
    "safe-weights-first_session_pacing",
    "safe-weights-reward_offer"
  ],
  "fallbackWeights": {
    "first_session_pacing": {
      "fast-start": 15,
      "guided": 85
    },
    "reward_offer": {
      "daily-streak": 85,
      "score-booster": 15
    }
  },
  "actionIds": [
    "rollback-hold",
    "safe-weights-first_session_pacing",
    "safe-weights-reward_offer",
    "freeze-experiment-learning",
    "disable-revenue-features",
    "enforce-zero-paid-spend"
  ],
  "stdout": [
    "Wrote ../../../../../tmp/agl-incident-drill-bRD5MJ/data/experiment-policy.json",
    "Wrote ../../../../../tmp/agl-incident-drill-bRD5MJ/data/production-response.json",
    "Wrote ../../../../../tmp/agl-incident-drill-bRD5MJ/src/data/productionResponse.ts",
    "Wrote ../../../../../tmp/agl-incident-drill-bRD5MJ/reports/production-response-latest.md"
  ]
} as const

export type IncidentDrill = typeof incidentDrill
