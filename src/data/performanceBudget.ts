export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 631,
    "gzipKb": 172.9
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
