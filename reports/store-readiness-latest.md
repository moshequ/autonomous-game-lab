# Store Readiness

Generated: 2026-05-24T23:45:57.853Z
Status: store-readiness-prepared-external-blockers
Source hash: d4070acdd1e0

## Summary

- Launch candidate: Market Pulse (market-pulse)
- Compliance: draft-ready-external-blockers
- Android: blocked-needs-host-signing-play
- iOS: deferred-until-ios-payback
- Store spend allowed: false
- Revenue enabled: false
- Screenshots: 4

## Checks

- pass: store-package - Store package is store-package-ready.
- pass: store-compliance - Store compliance draft is draft-ready-external-blockers.
- pass: store-listing - Store listing optimizer is store-listing-optimizer-ready.
- pass: store-screenshots - 4 screenshot asset(s) are available.
- blocker: native-package - Native Android package handoff is blocked-draft-ready.
- pass: android-release - Android release plan is blocked-needs-host-signing-play.
- pass: ios-release - iOS handoff is deferred-until-ios-payback.
- external-blocker: unit-economics - Store spend allowed is false.
- blocker: monetization - Revenue enabled is false.
- external-blocker: support-contact - Production support email is required before public app-store submission.

## Platform Handoffs

- web-pwa: public-compliance-published
- android-google-play: blocked-needs-host-signing-play
- ios-app-store: deferred-until-ios-payback

## External Blockers

- store-compliance: support-contact: Production support email is required before public store submission.
- store-compliance: google-play-account: Google Play developer account must be connected before Android submission.
- store-compliance: apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.
- android: native-package-ready: Native package is blocked-draft-ready.
- android: store-package-draft: Store package is blocked; data safety is draft-ready.
- android: asset-links: Digital Asset Links are domain-verification-blocked; Android requires https://moshequ.github.io/.well-known/assetlinks.json and current artifact publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json.
- android: google-play-account: Google Play account is not connected.
- android: play-service-account: Google Play service account upload credentials are not available to CI.
- ios: support-contact: Production support email is required before public store submission.
- ios: apple-developer-account: Apple Developer Program account is not connected.
- ios: app-store-connect-api: App Store Connect API credentials are not available to CI.
- monetization: Web/PWA or native ad provider is not configured for gated revenue tests.
- google-play-fee: Google Play developer account is not connected.
- ios-fee: Apple Developer account is not connected.
- ios-fee: Projected annual revenue is $0.00, below $99.00.
- native-package: Native Android package handoff is blocked-draft-ready.
- monetization: Revenue enabled is false.
- support-contact: Production support email is required before public app-store submission.

## Product Gates

- android: unit-economics-store-spend: Store spend allowed is false; spend mode is no-spend.
- android: promotion-gate: Android promotion status is blocked.
- ios: annual-fee-payback: Store spend allowed is false; projected Apple payback is not available.
- monetization: First-game completion is 40%; gate is 55%.
- monetization: Replay rate is 31%; gate is 35%.
- monetization: D1 retention is 17%; gate is 18%; source is fixture-retention.
- google-play-fee: No live revenue signal yet.
- google-play-fee: Projected Google Play fee payback is not within 60 days.
- ios-fee: Revenue signal is $0.00, below $99.00.
- ios-fee: Projected Apple fee payback is not within 90 days.
- unit-economics: Store spend allowed is false.

## Controls

- zeroPaidSpend: true
- noPaidSpend: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- noSecretValues: true
- ownerInputsRequired: true
- storeSpendStillBlocked: true
- postDeploySmokeRequired: true
