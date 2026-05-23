export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 676.8,
    "gzipKb": 183.8
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
