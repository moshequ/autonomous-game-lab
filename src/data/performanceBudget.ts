export const performanceBudget = {
  "generatedAt": "2026-05-19T05:44:56.431Z",
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
      "index-DEF9_F-8.js",
      "registerSW.js"
    ],
    "scriptPaths": [
      "assets/index-DEF9_F-8.js",
      "registerSW.js"
    ],
    "jsFiles": [
      {
        "file": "index-DEF9_F-8.js",
        "path": "assets/index-DEF9_F-8.js",
        "bytes": 648375,
        "kb": 633.2,
        "gzipBytes": 174023,
        "gzipKb": 169.9
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
    "jsBytes": 648509,
    "jsKb": 633.3,
    "gzipBytes": 174149,
    "gzipKb": 170.1,
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
        "file": "GameCanvas-DhZ1gLs_.js",
        "path": "assets/GameCanvas-DhZ1gLs_.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      }
    ],
    "gameChunk": {
      "file": "GameCanvas-DhZ1gLs_.js",
      "path": "assets/GameCanvas-DhZ1gLs_.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestDeferredChunk": {
      "file": "GameCanvas-DhZ1gLs_.js",
      "path": "assets/GameCanvas-DhZ1gLs_.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestJsChunk": {
      "file": "GameCanvas-DhZ1gLs_.js",
      "path": "assets/GameCanvas-DhZ1gLs_.js",
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
        "file": "GameCanvas-DhZ1gLs_.js",
        "path": "assets/GameCanvas-DhZ1gLs_.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      },
      {
        "file": "index-DEF9_F-8.js",
        "path": "assets/index-DEF9_F-8.js",
        "bytes": 648375,
        "kb": 633.2,
        "gzipBytes": 174023,
        "gzipKb": 169.9
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
      "detail": "Initial JS is 633.3 KB; budget is 675 KB."
    },
    {
      "id": "initial-js-gzip-budget",
      "status": "pass",
      "detail": "Initial JS gzip is 170.1 KB; budget is 200 KB."
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
      "detail": "GameCanvas-DhZ1gLs_.js is deferred from the initial shell."
    },
    {
      "id": "largest-js-deferred",
      "status": "pass",
      "detail": "Largest JS chunk is GameCanvas-DhZ1gLs_.js at 1360.8 KB."
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
