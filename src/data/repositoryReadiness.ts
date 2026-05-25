export const repositoryReadiness = {
  "status": "waiting-for-gh-auth",
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
    "workflowDispatchReady": false
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
