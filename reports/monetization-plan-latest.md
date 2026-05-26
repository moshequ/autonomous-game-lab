# Monetization Plan

Generated: 2026-05-26T21:25:36.461Z
Status: blocked-by-product-gates
Revenue enabled: false
Analytics source: fixture-sample
Runtime: guarded-disabled
Revenue test preflight: waiting-on-provider-or-product-gates
Public preflight: /monetization.html

## Metrics

- First-game completion: 40%
- Replay rate: 31%
- D1 retention: 17%
- Revenue: $0.00

## Placements

- disabled: rewarded-hint-after-failed-daily (rewarded) - after a completed failed run, never before the first game ends; max 1 offer per anonymous session.
- disabled: cosmetic-unlock-result-skin (cosmetic) - result screen only; offer after repeat play only.

## Blockers

- First-game completion is 40%; gate is 55%.
- Replay rate is 31%; gate is 35%.
- D1 retention is 17%; gate is 18%; source is fixture-retention.
- Web/PWA or native ad provider is not configured for gated revenue tests.

## Revenue Test Preflight

- blocked: product-gates - Readiness is blocked; first-game completion, replay, and D1 retention must pass before revenue tests.
- blocked: promotion-gate - Promotion decision is blocked; release health must allow monetization.
- missing-config: ad-provider - Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID or ADMOB_PUBLISHER_ID before running revenue tests.
- pass: privacy-policy - Privacy policy URL is hosted.
- pass: runtime-guardrails - Rewarded placement waits for a completed failed run, is capped to one offer per session, and never paywalls core rules.
- pass: telemetry-contract - Revenue telemetry is limited to rewarded/cosmetic lifecycle events and revenue_cents.
- pass: spend-guard - Revenue preflight does not allow paid acquisition, app-store spend, or store submission.

## Ad Provider Input Pack

- status: ad-provider-input-ready
- unlock: ad-provider-config
- local env file: .env.production.local
- npm template: npm run autonomous:ad-provider-input-template
- write local env template: node scripts/monetization-planner.mjs --write-local-env-template
- setup write local env template: ./ops/github/setup-production.sh --ad-provider-input-template
- missing inputs: VITE_ADSENSE_CLIENT_ID, VITE_ADSENSE_REWARDED_SLOT_ID, ADMOB_PUBLISHER_ID
- secret inputs: 0
- browser-local action pack: browser-local-ad-provider-action-pack
- browser-local receipt key: agl.adProviderActionReceipt
- browser-local download file: agl-ad-provider.env
- product gates still required: true
- no revenue enablement: true
- local env template:
  - VITE_ADSENSE_CLIENT_ID=
  - VITE_ADSENSE_REWARDED_SLOT_ID=
  - ADMOB_PUBLISHER_ID=

## Validation

- npm run autonomous:monetization
- npm run autonomous:unit-economics
- npm run autonomous:store-compliance
- npm run autonomous:readiness

## Safety

- blocked before retention: subscription
- blocked before retention: interstitial during first session
- blocked before retention: paywalled core rules
- no interstitials in the first session
- no paywalled core rules

## Runtime

- Surface: result-screen
- First placement: rewarded-hint-after-failed-daily
- Web adapter: adsense-not-configured
- App adapter: admob-not-configured
- Disabled reason: First-game completion is 40%; gate is 55%.
