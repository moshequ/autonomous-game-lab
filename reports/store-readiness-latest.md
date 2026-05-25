# Store Readiness

Generated: 2026-05-25T23:24:33.593Z
Status: store-readiness-prepared-external-blockers
Source hash: 0032f9917754

## Summary

- Launch candidate: Market Pulse (market-pulse)
- Compliance: draft-ready-external-blockers
- Android: blocked-needs-host-signing-play
- iOS: deferred-until-ios-payback
- Store spend allowed: false
- Revenue enabled: false
- Store payback: waiting-for-live-revenue
- Screenshots: 4

## Store Payback Ladder

- Status: waiting-for-live-revenue
- Evidence needed: live-revenue-signal, passing-retention-and-engagement-gates, configured-revenue-provider, google-play-payback-and-account-clearance, ios-payback-and-account-clearance
- Controls: zero paid spend until payback true
- Google Play: $0.42/day, $12.60/month, gap $0.42/day
- iOS App Store: $1.10/day, $33.00/month, gap $1.10/day

## Owner Unlock Order

- Next unlock: support-contact
- Lowest input: Production support contact currently needs 1 owner input(s) and can be done without store spend.
- Immediate unlocks: support-contact
- Gated unlocks: google-play-account, ios-app-store-account

## Support Contact Input Pack

- unlock: support-contact
- status: needs-production-support-email
- local env file: .env.production.local
- write local env template: node scripts/store-readiness-page.mjs --write-local-env-template
- setup write local env template: ./ops/github/setup-production.sh --support-input-template
- missing inputs: AGL_SUPPORT_EMAIL
- secret inputs: 0
- email validation: not-checked-missing-input
- no secret values stored: true
- local template preserves existing values: true
- local template avoids GitHub mutation: true
- local env template:
  - AGL_SUPPORT_EMAIL=

### Production support contact

- id: support-contact
- status: needs-production-support-email
- cost: zero-spend-use-existing-support-address
- missing inputs: 1
- missing secrets: 0
- before product gates: true
- missing variables:
  - AGL_SUPPORT_EMAIL
- missing secrets: none
- setup:
  - `./ops/github/setup-production.sh --support-input-template`
  - `gh variable set AGL_SUPPORT_EMAIL --body "$AGL_SUPPORT_EMAIL"`
  - `npm run autonomous:store-package`
  - `npm run autonomous:store-compliance`
  - `npm run autonomous:store-readiness`
  - `npm run autonomous:readiness`
- validation:
  - `npm run autonomous:store-readiness`
  - `npm run test:e2e`

### Google Play account and upload credential

- id: google-play-account
- status: gated-by-store-spend-and-product-signals
- cost: paid-store-account-gated-by-unit-economics
- missing inputs: 2
- missing secrets: 1
- before product gates: false
- missing variables:
  - AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED
- missing secrets:
  - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
- setup:
  - `npm run autonomous:native-package`
  - `npm run autonomous:android-release-plan`
  - `npm run autonomous:store-readiness`
  - `npm run autonomous:readiness`
- validation:
  - `npm run autonomous:android-release-plan`
  - `npm run autonomous:store-readiness`
  - `npm run test:e2e`

### Apple Developer and App Store Connect

- id: ios-app-store-account
- status: deferred-until-ios-payback
- cost: annual-fee-deferred-until-payback
- missing inputs: 0
- missing secrets: 0
- before product gates: false
- missing variables: none
- missing secrets: none
- setup:
  - `npm run autonomous:ios-release-plan`
  - `npm run autonomous:store-readiness`
- validation:
  - `npm run autonomous:ios-release-plan`
  - `npm run autonomous:store-readiness`

## Checks

- pass: store-package - Store package is store-package-ready.
- pass: store-compliance - Store compliance draft is draft-ready-external-blockers.
- pass: store-listing - Store listing optimizer is store-listing-optimizer-ready.
- pass: store-screenshots - 4 screenshot asset(s) are available.
- pass: native-package - Native Android package handoff is ready-for-bubblewrap-build.
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
- android: google-play-account: Google Play account is not connected.
- android: play-service-account: Google Play service account upload credentials are not available to CI.
- ios: support-contact: Production support email is required before public store submission.
- ios: apple-developer-account: Apple Developer Program account is not connected.
- ios: app-store-connect-api: App Store Connect API credentials are not available to CI.
- monetization: Web/PWA or native ad provider is not configured for gated revenue tests.
- google-play-fee: Google Play developer account is not connected.
- ios-fee: Apple Developer account is not connected.
- ios-fee: Projected annual revenue is $0.00, below $99.00.
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
