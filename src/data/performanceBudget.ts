export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 677.8,
    "gzipKb": 184
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
