export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 667.1,
    "gzipKb": 181.9
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.1
    },
    "largestDeferredChunk": {
      "kb": 1361.1
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
