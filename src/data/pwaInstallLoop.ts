export const pwaInstallLoop = {
  "generatedAt": "2026-05-19T04:56:55.842Z",
  "status": "pwa-install-loop-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "acquisitionLearning": "acquisition-learning-ready",
    "retentionLoop": "retention-loop-ready",
    "releaseHealth": "monitoring",
    "publicOrigin": "missing"
  },
  "channel": {
    "id": "pwa-install",
    "status": "ready-after-hosting",
    "costUsd": 0,
    "assets": [
      "manifest.webmanifest",
      "service worker",
      "install icons",
      "standalone launch telemetry"
    ],
    "metric": "pwa_install_prompt_viewed -> pwa_installed -> pwa_launch_mode_detected"
  },
  "metrics": {
    "promptViews": 0,
    "promptClicks": 0,
    "accepted": 0,
    "dismissed": 0,
    "installed": 0,
    "launchModes": 0,
    "installRate": 0,
    "acceptanceRate": 0,
    "dismissalRate": 0
  },
  "promptPolicy": {
    "surface": "autonomy-cockpit",
    "ctaLabel": "Install app",
    "minimumCompletedRunsBeforeNudge": 0,
    "minimumTurnsBeforeNudge": 1,
    "cooldownDaysAfterDismissal": 14,
    "nativePromptRequired": true,
    "fallbackWhenUnavailable": "measure-browser-launch-mode-only",
    "priorityGameId": "canopy-bloom"
  },
  "localState": {
    "dismissalKey": "agl.pwa.installDismissedAt",
    "installedKey": "agl.pwa.installedAt",
    "launchModeKey": "agl.pwa.launchMode"
  },
  "controls": {
    "canMeasureInstall": true,
    "canPromptInstall": true,
    "hostRequiredForProductionInstall": true,
    "noPaidInstallIncentive": true,
    "noNotificationPermissionPrompt": true
  },
  "guardrails": {
    "noForcedPrompt": true,
    "noBlockingGameplay": true,
    "respectBrowserPromptAvailability": true,
    "noInstallWall": true,
    "noPaidInstallReward": true
  },
  "nextActions": [
    "Start measuring native install prompt availability and standalone launches.",
    "Publish to a stable HTTPS host before using PWA install data for store-readiness claims.",
    "Keep install prompts optional, non-blocking, and separated from paid rewards."
  ]
} as const

export type PwaInstallLoop = typeof pwaInstallLoop
