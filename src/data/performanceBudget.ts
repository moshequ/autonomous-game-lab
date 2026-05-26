export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 660.1,
    "gzipKb": 176.7
  },
  "deferred": {
    "gameChunk": {
      "kb": 3.3
    },
    "largestDeferredChunk": {
      "kb": 1321.4
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
