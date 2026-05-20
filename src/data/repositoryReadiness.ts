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
  },
  "pages": {
    "liveSettings": {
      "status": "inspected",
      "buildType": "workflow",
      "httpsEnforced": true,
      "htmlUrl": "https://moshequ.github.io/autonomous-game-lab/"
    }
  }
} as const

export type RepositoryReadiness = typeof repositoryReadiness
