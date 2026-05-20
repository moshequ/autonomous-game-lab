export const repositoryReadiness = {
  "status": "waiting-for-github-repository",
  "workspace": {
    "insideWorkTree": true
  },
  "repository": {
    "target": null
  },
  "repositoryTargetPlan": {
    "plannedTarget": "OWNER/autonomous-game-lab",
    "pages": {
      "origin": "https://OWNER.github.io/autonomous-game-lab"
    }
  },
  "githubAutomation": {
    "workflowDispatchReady": false
  }
} as const

export type RepositoryReadiness = typeof repositoryReadiness
