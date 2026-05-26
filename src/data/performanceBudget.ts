export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 673.6,
    "gzipKb": 179.3
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
