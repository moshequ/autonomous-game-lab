export const liveSiteMonitor = {
  "generatedAt": "2026-06-09T14:27:08.840Z",
  "status": "live-site-monitor-alert",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 34,
    "passed": 33,
    "failed": 1,
    "blocked": 0,
    "passRate": 97,
    "latencyP50Ms": 5012,
    "latencyP95Ms": 10861,
    "liveCandidateId": "pwa-b2cb4bc35a26",
    "syncedCandidateId": "pwa-3e804a980eae",
    "localCandidateId": "pwa-db3386713744",
    "liveMatchesSyncedDeploy": false,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "current-local-release-candidate",
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
  "preservation": null,
  "topChecks": [
    {
      "id": "app-shell",
      "path": "/",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 844
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 4337
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 3615
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 6451
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 6399
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 5012
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
