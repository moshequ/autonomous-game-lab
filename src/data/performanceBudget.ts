export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 643.7,
    "gzipKb": 176
  },
  "deferred": {
    "gameChunk": {
      "kb": 1360.9
    },
    "largestDeferredChunk": {
      "kb": 1360.9
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
