export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 691.8,
    "gzipKb": 186.6
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
