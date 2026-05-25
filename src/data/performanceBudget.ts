export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 682.7,
    "gzipKb": 184.9
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
