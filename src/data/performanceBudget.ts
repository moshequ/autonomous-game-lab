export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 661.9,
    "gzipKb": 177
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
