# Monetization Plan

Generated: 2026-05-22T02:06:47.421Z
Status: blocked-by-product-gates
Revenue enabled: false
Analytics source: fixture-sample
Runtime: guarded-disabled

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
