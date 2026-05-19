export const performanceBudget = {
  "generatedAt": "2026-05-19T03:58:20.386Z",
  "status": "performance-budget-ready",
  "sourceBuild": "dist",
  "budgets": {
    "initialJsMaxBytes": 691200,
    "initialJsMaxKb": 675,
    "initialGzipMaxBytes": 204800,
    "initialGzipMaxKb": 200,
    "initialCssMaxBytes": 40960,
    "initialCssMaxKb": 40,
    "deferredGameChunkMaxBytes": 1638400,
    "deferredGameChunkMaxKb": 1600
  },
  "initial": {
    "entryScripts": [
      "index-PQJwZ8t8.js",
      "registerSW.js"
    ],
    "scriptPaths": [
      "assets/index-PQJwZ8t8.js",
      "registerSW.js"
    ],
    "jsFiles": [
      {
        "file": "index-PQJwZ8t8.js",
        "path": "assets/index-PQJwZ8t8.js",
        "bytes": 642534,
        "kb": 627.5,
        "gzipBytes": 173436,
        "gzipKb": 169.4
      },
      {
        "file": "registerSW.js",
        "path": "registerSW.js",
        "bytes": 134,
        "kb": 0.1,
        "gzipBytes": 126,
        "gzipKb": 0.1
      }
    ],
    "jsBytes": 642668,
    "jsKb": 627.6,
    "gzipBytes": 173562,
    "gzipKb": 169.5,
    "cssFiles": [
      {
        "file": "index-DTpigz8N.css",
        "path": "assets/index-DTpigz8N.css",
        "bytes": 9837,
        "kb": 9.6,
        "gzipBytes": 2675,
        "gzipKb": 2.6
      }
    ],
    "cssBytes": 9837,
    "cssKb": 9.6,
    "cssGzipBytes": 2675,
    "cssGzipKb": 2.6
  },
  "deferred": {
    "chunks": [
      {
        "file": "GameCanvas-D163lU3Q.js",
        "path": "assets/GameCanvas-D163lU3Q.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      }
    ],
    "gameChunk": {
      "file": "GameCanvas-D163lU3Q.js",
      "path": "assets/GameCanvas-D163lU3Q.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestDeferredChunk": {
      "file": "GameCanvas-D163lU3Q.js",
      "path": "assets/GameCanvas-D163lU3Q.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestJsChunk": {
      "file": "GameCanvas-D163lU3Q.js",
      "path": "assets/GameCanvas-D163lU3Q.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "chunksBytes": 1393468,
    "chunksKb": 1360.8
  },
  "assets": {
    "js": [
      {
        "file": "GameCanvas-D163lU3Q.js",
        "path": "assets/GameCanvas-D163lU3Q.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      },
      {
        "file": "index-PQJwZ8t8.js",
        "path": "assets/index-PQJwZ8t8.js",
        "bytes": 642534,
        "kb": 627.5,
        "gzipBytes": 173436,
        "gzipKb": 169.4
      },
      {
        "file": "registerSW.js",
        "path": "registerSW.js",
        "bytes": 134,
        "kb": 0.1,
        "gzipBytes": 126,
        "gzipKb": 0.1
      }
    ],
    "css": [
      {
        "file": "index-DTpigz8N.css",
        "path": "assets/index-DTpigz8N.css",
        "bytes": 9837,
        "kb": 9.6,
        "gzipBytes": 2675,
        "gzipKb": 2.6
      }
    ],
    "manifestExists": true,
    "serviceWorkerExists": true,
    "serviceWorkerPrecacheIncludesLazyChunk": true
  },
  "controls": {
    "phaserDeferredFromInitialShell": true,
    "initialShellBudgetEnforced": true,
    "largeGameChunkAllowedWhenDeferred": true,
    "noPerformanceClaimsWithoutBuildEvidence": true,
    "largestJsChunkIsDeferred": true,
    "serviceWorkerPrecacheIncludesLazyChunk": true
  },
  "checks": [
    {
      "id": "initial-js-budget",
      "status": "pass",
      "detail": "Initial JS is 627.6 KB; budget is 675 KB."
    },
    {
      "id": "initial-js-gzip-budget",
      "status": "pass",
      "detail": "Initial JS gzip is 169.5 KB; budget is 200 KB."
    },
    {
      "id": "initial-css-budget",
      "status": "pass",
      "detail": "Initial CSS is 9.6 KB; budget is 40 KB."
    },
    {
      "id": "manifest",
      "status": "pass",
      "detail": "PWA manifest exists in dist."
    },
    {
      "id": "service-worker",
      "status": "pass",
      "detail": "Service worker exists in dist."
    },
    {
      "id": "game-runtime-deferred",
      "status": "pass",
      "detail": "GameCanvas-D163lU3Q.js is deferred from the initial shell."
    },
    {
      "id": "largest-js-deferred",
      "status": "pass",
      "detail": "Largest JS chunk is GameCanvas-D163lU3Q.js at 1360.8 KB."
    },
    {
      "id": "deferred-game-budget",
      "status": "pass",
      "detail": "Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB."
    }
  ],
  "nextActions": [
    "Keep Phaser and game scenes outside the initial PWA shell.",
    "Continue monitoring initial shell gzip size after every generated-data change.",
    "Accept the large game-engine chunk only while it remains deferred from first paint."
  ]
} as const

export type PerformanceBudget = typeof performanceBudget
