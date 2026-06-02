export const supportFeedback = {
  "generatedAt": "2026-06-02T13:27:05.125Z",
  "status": "support-feedback-empty",
  "provider": "github-issues",
  "repository": "moshequ/autonomous-game-lab",
  "summary": {
    "issuesInspected": 0,
    "openIssues": 0,
    "closedIssues": 0,
    "categorizedIssues": 0,
    "matchedPlayableIssues": 0,
    "improvementSignals": 0,
    "routableSignals": 0,
    "aggregateEvidenceNotes": 0,
    "aggregateEvidenceGames": 0,
    "aggregateEvidenceCampaigns": 0,
    "aggregateStarts": 0,
    "aggregateCompletions": 0,
    "aggregateReplays": 0,
    "aggregateD1Eligible": 0,
    "aggregateD1Retained": 0
  },
  "controls": {
    "zeroPaidSpend": true,
    "readOnlyGithubIssueList": true,
    "noIssueMutation": true,
    "noAccountCreation": true,
    "noPrivateIssueScrape": true,
    "publicIssuesOnly": true,
    "noAttachmentsDownloaded": true,
    "noRawAnalyticsStored": true,
    "noRawEventRowsAccepted": true,
    "redactsContactText": true,
    "playableTargetsOnlyForAutomation": true,
    "publicAggregateOnly": true,
    "githubRestFallback": true,
    "preservesLastGoodSnapshot": true,
    "aggregateEvidenceNeverMarksProductGatePass": true,
    "aggregateEvidenceRequiresManualReviewForGateDecisions": true
  },
  "aggregateEvidence": {
    "notes": 0,
    "games": 0,
    "campaigns": 0,
    "starts": 0,
    "completions": 0,
    "replays": 0,
    "topNotes": []
  },
  "topSignals": []
} as const

export type SupportFeedback = typeof supportFeedback
