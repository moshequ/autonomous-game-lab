export const autonomousOperatorHistory = {
  "status": "operator-history-ready",
  "summary": {
    "totalRecords": 40,
    "plannedRecords": 23,
    "executedRecords": 17,
    "failedRecords": 0,
    "lastActionId": "refresh-replay-loop",
    "lastExecutionStatus": "not-requested",
    "lastExecutedActionId": "collect-live-events"
  }
} as const

export type AutonomousOperatorHistory = typeof autonomousOperatorHistory
