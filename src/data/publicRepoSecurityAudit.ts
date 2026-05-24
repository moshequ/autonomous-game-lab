export const publicRepoSecurityAudit = {
  "generatedAt": "2026-05-24T22:43:50.964Z",
  "status": "public-repo-security-ready",
  "repository": {
    "target": "moshequ/autonomous-game-lab",
    "visibility": "PUBLIC",
    "isPublic": true
  },
  "summary": {
    "highConfidenceSecretFindings": 0,
    "trackedSensitiveFiles": 0,
    "publicWorkflowRisks": 0,
    "guardedPublicIssueSecrets": 6
  },
  "controls": {
    "publicIssueTriggerSecretsBlocked": true,
    "publicIssueTriggerCommitsBlocked": true,
    "publicIssueWorkflowReadOnly": true,
    "scheduledWriteJobIsolated": true
  }
} as const

export type PublicRepoSecurityAudit = typeof publicRepoSecurityAudit
