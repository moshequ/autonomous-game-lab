export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 683.2,
    "gzipKb": 181.1
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
