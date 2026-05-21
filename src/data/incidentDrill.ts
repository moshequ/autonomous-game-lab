export const incidentDrill = {
  "generatedAt": "2026-05-21T17:49:37.144Z",
  "status": "pass",
  "scenario": "blocked-release-health",
  "isolated": true,
  "responderStatus": "incident-response",
  "controls": {
    "deployAllowed": false,
    "rollbackRequired": true,
    "liveSiteAlert": false,
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
    "Wrote ../../../../../../var/folders/tq/1ph_b7c95_gc2jsn1hc3h1jw0000gn/T/agl-incident-drill-ruvkoB/data/experiment-policy.json",
    "Wrote ../../../../../../var/folders/tq/1ph_b7c95_gc2jsn1hc3h1jw0000gn/T/agl-incident-drill-ruvkoB/data/production-response.json",
    "Wrote ../../../../../../var/folders/tq/1ph_b7c95_gc2jsn1hc3h1jw0000gn/T/agl-incident-drill-ruvkoB/src/data/productionResponse.ts",
    "Wrote ../../../../../../var/folders/tq/1ph_b7c95_gc2jsn1hc3h1jw0000gn/T/agl-incident-drill-ruvkoB/reports/production-response-latest.md"
  ]
} as const

export type IncidentDrill = typeof incidentDrill
