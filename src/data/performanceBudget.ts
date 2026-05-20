export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 631.4,
    "gzipKb": 173
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
