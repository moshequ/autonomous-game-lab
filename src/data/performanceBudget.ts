export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 680,
    "gzipKb": 184.5
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
