export const repositoryReadiness = {
  "status": "repository-channel-ready",
  "workspace": {
    "insideWorkTree": true
  },
  "repository": {
    "target": "moshequ/autonomous-game-lab"
  },
  "repositoryTargetPlan": {
    "plannedTarget": "moshequ/autonomous-game-lab",
    "pages": {
      "origin": "https://moshequ.github.io/autonomous-game-lab"
    }
  },
  "githubAutomation": {
    "workflowDispatchReady": true
  }
} as const

export type RepositoryReadiness = typeof repositoryReadiness
