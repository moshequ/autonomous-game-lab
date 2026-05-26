# PWA Install Loop

Generated: 2026-05-26T21:08:43.907Z
Status: pwa-install-loop-ready
Source hash: c73d40bf70b3
Channel: pwa-install (ready-after-hosting)
Install page views: 0
Open-app clicks: 0
Prompt available: 0
Prompt views: 0
Cooldown suppressions: 0
Installs: 0
Acceptance: 0%

## Prompt Policy

- Surface: autonomy-cockpit
- CTA: Install app
- Cooldown after dismissal: 14 days
- Priority game: market-pulse
- Public install page: /install.html
- Campaign: pwa-install-market-pulse
- Local analytics: agl.analytics.events

## Install Sample Policy

- Status: collecting-sample
- Campaign: pwa-install-market-pulse
- Play path: /?game=market-pulse&utm_source=pwa_install&utm_campaign=pwa-install-market-pulse
- Prompt views needed: 20
- Launch-mode events needed: 10
- Hosted origin required: false
- Next action: Route zero-spend install traffic through /?game=market-pulse&utm_source=pwa_install&utm_campaign=pwa-install-market-pulse until 20 prompt view(s) and 10 launch-mode event(s) are collected.

## Guardrails

- noForcedPrompt: true
- noBlockingGameplay: true
- respectBrowserPromptAvailability: true
- enforceDismissalCooldown: true
- noInstallWall: true
- noPaidInstallReward: true

## Measurement

- Install page view: pwa_install_page_viewed
- Open-app click: pwa_install_open_clicked
- Availability: pwa_install_prompt_available
- User-visible prompt: pwa_install_prompt_viewed
- Cooldown: pwa_install_prompt_cooldown
- Launch: pwa_launch_mode_detected

## Next Actions

- Route zero-spend install traffic through /?game=market-pulse&utm_source=pwa_install&utm_campaign=pwa-install-market-pulse until 20 prompt view(s) and 10 launch-mode event(s) are collected.
- Start measuring native install prompt availability and standalone launches.
- Route install traffic through /?game=market-pulse&utm_source=pwa_install&utm_campaign=pwa-install-market-pulse so prompt events carry pwa-install attribution.
- Keep install links pointed at the stable HTTPS production origin.
- Keep install prompts optional, non-blocking, and separated from paid rewards.
