export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 638.2,
    "gzipKb": 174.5
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
