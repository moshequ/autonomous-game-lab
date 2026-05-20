# PWA Install Loop

Generated: 2026-05-20T05:54:46.178Z
Status: pwa-install-loop-ready
Channel: pwa-install (ready-after-hosting)
Prompt available: 0
Prompt views: 0
Cooldown suppressions: 0
Installs: 0
Acceptance: 0%

## Prompt Policy

- Surface: autonomy-cockpit
- CTA: Install app
- Cooldown after dismissal: 14 days
- Priority game: canopy-bloom
- Public install page: /install.html
- Campaign: pwa-install-canopy-bloom

## Install Sample Policy

- Status: collecting-sample
- Campaign: pwa-install-canopy-bloom
- Play path: /?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom
- Prompt views needed: 20
- Launch-mode events needed: 10
- Hosted origin required: true
- Next action: Publish to a stable HTTPS host before treating PWA install evidence as production-ready.

## Guardrails

- noForcedPrompt: true
- noBlockingGameplay: true
- respectBrowserPromptAvailability: true
- enforceDismissalCooldown: true
- noInstallWall: true
- noPaidInstallReward: true

## Measurement

- Availability: pwa_install_prompt_available
- User-visible prompt: pwa_install_prompt_viewed
- Cooldown: pwa_install_prompt_cooldown
- Launch: pwa_launch_mode_detected

## Next Actions

- Publish to a stable HTTPS host before treating PWA install evidence as production-ready.
- Start measuring native install prompt availability and standalone launches.
- Route install traffic through /?game=canopy-bloom&utm_source=pwa_install&utm_campaign=pwa-install-canopy-bloom so prompt events carry pwa-install attribution.
- Publish to a stable HTTPS host before using PWA install data for store-readiness claims.
- Keep install prompts optional, non-blocking, and separated from paid rewards.
