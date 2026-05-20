export const pwaInstallLoop = {
  "generatedAt": "2026-05-20T22:13:01.577Z",
  "status": "pwa-install-loop-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "acquisitionLearning": "acquisition-learning-ready",
    "retentionLoop": "retention-loop-ready",
    "releaseHealth": "monitoring",
    "publicOrigin": "configured"
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
    "promptAvailable": 0,
    "promptViews": 0,
    "promptClicks": 0,
    "accepted": 0,
    "dismissed": 0,
    "cooldownSuppressions": 0,
    "installed": 0,
    "launchModes": 0,
    "promptSurfaceRate": 0,
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
  "publicInstallPage": {
    "path": "/install.html",
    "file": "public/install.html",
    "campaignId": "pwa-install-canopy-bloom",
    "playPath": "/?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom",
    "priorityGameId": "canopy-bloom",
    "zeroPaidSpend": true,
    "playerInitiatedOnly": true,
    "browserPromptControlled": true,
    "nativePromptRequired": true,
    "hostedOriginRequired": false
  },
  "localState": {
    "dismissalKey": "agl.pwa.installDismissedAt",
    "installedKey": "agl.pwa.installedAt",
    "launchModeKey": "agl.pwa.launchMode"
  },
  "controls": {
    "canMeasureInstall": true,
    "canPromptInstall": true,
    "hostRequiredForProductionInstall": false,
    "noPaidInstallIncentive": true,
    "noNotificationPermissionPrompt": true
  },
  "measurementPolicy": {
    "availableEvent": "pwa_install_prompt_available",
    "surfacedEvent": "pwa_install_prompt_viewed",
    "clickedEvent": "pwa_install_prompt_clicked",
    "acceptedEvent": "pwa_install_prompt_accepted",
    "dismissedEvent": "pwa_install_prompt_dismissed",
    "cooldownEvent": "pwa_install_prompt_cooldown",
    "installedEvent": "pwa_installed",
    "launchEvent": "pwa_launch_mode_detected",
    "cooldownStorageKey": "agl.pwa.installDismissedAt",
    "cooldownDays": 14,
    "reason": "Separate browser install eligibility from user-visible prompting so the loop can optimize distribution without nagging players."
  },
  "samplePolicy": {
    "channelId": "pwa-install",
    "status": "collecting-sample",
    "campaignId": "pwa-install-canopy-bloom",
    "playPath": "/?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom",
    "publicInstallPath": "/install.html",
    "source": "fixture-sample",
    "current": {
      "promptAvailable": 0,
      "promptViews": 0,
      "promptClicks": 0,
      "accepted": 0,
      "dismissed": 0,
      "cooldownSuppressions": 0,
      "installed": 0,
      "launchModes": 0,
      "promptSurfaceRate": 0,
      "installRate": 0,
      "acceptanceRate": 0
    },
    "needed": {
      "promptViews": 20,
      "launchModes": 10,
      "minimumPromptViewsForDecision": 20,
      "minimumLaunchModesForDecision": 10
    },
    "telemetry": {
      "availability": "pwa_install_prompt_available",
      "view": "pwa_install_prompt_viewed",
      "click": "pwa_install_prompt_clicked",
      "accepted": "pwa_install_prompt_accepted",
      "dismissed": "pwa_install_prompt_dismissed",
      "cooldown": "pwa_install_prompt_cooldown",
      "installed": "pwa_installed",
      "launch": "pwa_launch_mode_detected"
    },
    "hostPolicy": {
      "publicOriginStatus": "configured",
      "stableHttpsRequired": true,
      "hostedOriginRequired": false,
      "productionInstallClaimsAllowed": false
    },
    "controls": {
      "zeroPaidSpend": true,
      "playerInitiatedOnly": true,
      "browserPromptControlled": true,
      "nativePromptRequired": true,
      "noSyntheticInstalls": true,
      "noInstallWall": true,
      "noPaidInstallReward": true,
      "noNotificationPermissionPrompt": true,
      "noRevenueEnablement": true,
      "noStoreSubmission": true
    },
    "nextAction": "Route zero-spend install traffic through /?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom until 20 prompt view(s) and 10 launch-mode event(s) are collected."
  },
  "guardrails": {
    "noForcedPrompt": true,
    "noBlockingGameplay": true,
    "respectBrowserPromptAvailability": true,
    "enforceDismissalCooldown": true,
    "noInstallWall": true,
    "noPaidInstallReward": true
  },
  "nextActions": [
    "Route zero-spend install traffic through /?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom until 20 prompt view(s) and 10 launch-mode event(s) are collected.",
    "Start measuring native install prompt availability and standalone launches.",
    "Route install traffic through /?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom so prompt events carry pwa-install attribution.",
    "Keep install links pointed at the stable HTTPS production origin.",
    "Keep install prompts optional, non-blocking, and separated from paid rewards."
  ]
} as const

export type PwaInstallLoop = typeof pwaInstallLoop
