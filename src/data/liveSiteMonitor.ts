export const liveSiteMonitor = {
  "generatedAt": "2026-05-25T08:50:19.480Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 32,
    "passed": 32,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 356,
    "latencyP95Ms": 366,
    "liveCandidateId": "pwa-49bba0cb4b5d",
    "syncedCandidateId": "pwa-49bba0cb4b5d",
    "localCandidateId": "pwa-1bcd76b808c3",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "synced-live-release-manifest",
    "monitoredSmokeUrls": 31,
    "liveSmokeUrls": 31
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
      "durationMs": 120
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 362
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 366
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 364
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 363
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 365
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
