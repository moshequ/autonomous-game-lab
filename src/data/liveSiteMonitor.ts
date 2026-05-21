export const liveSiteMonitor = {
  "generatedAt": "2026-05-21T17:51:10.666Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab"
  },
  "summary": {
    "planned": 15,
    "passed": 15,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 234,
    "latencyP95Ms": 278,
    "liveCandidateId": "pwa-4b7280b36bef",
    "syncedCandidateId": "pwa-4b7280b36bef",
    "localCandidateId": "pwa-4a40f1042456",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false
  },
  "controls": {
    "zeroPaidSpend": true,
    "readOnlyHttpChecks": true,
    "noMutation": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noCookiesOrCredentials": true,
    "strictSyncedManifestComparison": true
  },
  "topChecks": [
    {
      "id": "app-shell",
      "path": "/",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 278
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 232
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 234
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 234
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 235
    },
    {
      "id": "install-html",
      "path": "/install.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 233
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
