# iOS App Store Handoff

Generated: 2026-05-21T17:09:58.353Z
Status: deferred-until-ios-payback
Bundle ID: app.autonomousgamelab.portal

## Files

- `capacitor.config.json`: draft Capacitor metadata for a future iOS shell.
- `app-store-handoff.json`: App Store metadata, privacy, screenshot, and review checklist.
- No Xcode project is generated in the zero-spend path.

## Controls

- Zero paid spend: true
- Apple account creation blocked: true
- Store submission blocked: true
- Xcode project generated: false

## Checks

- pass: store-listing - Store listing metadata is ready for App Store Connect draft entry.
- pass: apple-privacy-labels - Apple App Privacy labels are drafted from the store package.
- pass: age-rating - Apple 4+ age-rating answers are drafted.
- pass: store-screenshots - 4 screenshot asset(s) are available.
- pass: hosted-privacy-url - Hosted privacy policy URL is available for App Review.
- external-blocker: support-contact - Production support email is required before public store submission.
- pass: native-app-like-value - PWA install, daily challenge, completion, replay, and multi-game catalog evidence prepare the native-value review story.
- deferred-paid-account: apple-developer-account - Apple Developer Program account is not connected.
- missing-env: app-store-connect-api - App Store Connect API credentials are not available to CI.
- held-by-economics: annual-fee-payback - Store spend allowed is false; projected Apple payback is not available.

## Setup Required Once

- Keep the PWA hosted with privacy and support URLs reachable before App Review.
- Connect Apple Developer Program only after live revenue justifies the annual fee.
- Set App Store Connect API credentials only after the Apple account exists and store spend is allowed.
- Run Capacitor/Xcode packaging only after native-value, privacy, account, and payback gates pass.
