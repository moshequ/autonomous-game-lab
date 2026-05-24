export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 681.3,
    "gzipKb": 184.7
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
