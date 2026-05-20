# PWA Install Loop

Generated: 2026-05-20T00:18:10.514Z
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

- Start measuring native install prompt availability and standalone launches.
- Publish to a stable HTTPS host before using PWA install data for store-readiness claims.
- Keep install prompts optional, non-blocking, and separated from paid rewards.
