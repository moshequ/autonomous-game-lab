export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 655,
    "gzipKb": 178.8
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
