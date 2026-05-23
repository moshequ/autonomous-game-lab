export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 681.3,
    "gzipKb": 184.4
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.4
    },
    "largestDeferredChunk": {
      "kb": 1361.4
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
