export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 680.7,
    "gzipKb": 184.8
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.7
    },
    "largestDeferredChunk": {
      "kb": 1361.7
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
