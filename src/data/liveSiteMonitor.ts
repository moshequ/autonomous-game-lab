export const liveSiteMonitor = {
  "generatedAt": "2026-05-26T05:55:06.737Z",
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
    "latencyP50Ms": 217,
    "latencyP95Ms": 313,
    "liveCandidateId": "pwa-4ad8448d8a6d",
    "syncedCandidateId": "pwa-4ad8448d8a6d",
    "localCandidateId": "pwa-046a8d2c5fbd",
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
      "durationMs": 66
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 298
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 203
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 291
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 208
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 218
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
