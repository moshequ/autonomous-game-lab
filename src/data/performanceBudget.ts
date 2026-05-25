export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 688.1,
    "gzipKb": 186.3
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
