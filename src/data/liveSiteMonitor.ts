export const liveSiteMonitor = {
  "generatedAt": "2026-05-24T17:36:26.255Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 29,
    "passed": 29,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 335,
    "latencyP95Ms": 354,
    "liveCandidateId": "pwa-c82c7da2eaa4",
    "syncedCandidateId": "pwa-c82c7da2eaa4",
    "localCandidateId": "pwa-845c3de129a8",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "synced-live-release-manifest",
    "monitoredSmokeUrls": 28,
    "liveSmokeUrls": 28
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
      "durationMs": 76
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 295
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 295
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 292
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 354
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 294
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
