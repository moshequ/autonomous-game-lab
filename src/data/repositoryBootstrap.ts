export const repositoryBootstrap = {
  "status": "waiting-for-github-target",
  "mode": "plan-only",
  "helper": {
    "path": "ops/github/bootstrap-repository.sh"
  },
  "repositoryTargetPlan": {
    "githubNewRepositoryUrl": "https://github.com/new?name=autonomous-game-lab&visibility=public"
  },
  "workspace": {
    "after": {
      "insideWorkTree": true
    }
  }
} as const

export type RepositoryBootstrap = typeof repositoryBootstrap
