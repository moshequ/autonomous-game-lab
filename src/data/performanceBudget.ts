export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 628.9,
    "gzipKb": 172.6
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
