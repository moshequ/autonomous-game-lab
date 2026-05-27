export const liveSiteMonitor = {
  "generatedAt": "2026-05-27T06:47:31.106Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 34,
    "passed": 34,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 78,
    "latencyP95Ms": 94,
    "liveCandidateId": "pwa-da7d5c160f10",
    "syncedCandidateId": "pwa-da7d5c160f10",
    "localCandidateId": "pwa-76627d4fcb63",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "synced-live-release-manifest",
    "monitoredSmokeUrls": 33,
    "liveSmokeUrls": 33
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
      "durationMs": 37
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 94
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 93
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 86
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 90
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 95
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
