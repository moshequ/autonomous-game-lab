export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 659.9,
    "gzipKb": 176.6
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
