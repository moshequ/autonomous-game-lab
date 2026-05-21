export const supportFeedback = {
  "generatedAt": "2026-05-21T05:18:07.408Z",
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
    "routableSignals": 0
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
    "redactsContactText": true,
    "playableTargetsOnlyForAutomation": true
  },
  "topSignals": []
} as const

export type SupportFeedback = typeof supportFeedback
