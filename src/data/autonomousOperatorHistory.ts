export const autonomousOperatorHistory = {
  "status": "operator-history-ready",
  "summary": {
    "totalRecords": 40,
    "plannedRecords": 21,
    "executedRecords": 19,
    "failedRecords": 0,
    "lastActionId": "run-post-deploy-smoke",
    "lastExecutionStatus": "not-requested",
    "lastExecutedActionId": "prepare-release-candidate"
  }
} as const

export type AutonomousOperatorHistory = typeof autonomousOperatorHistory
