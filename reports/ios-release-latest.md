# iOS Release

Generated: 2026-05-22T01:03:43.541Z
Status: deferred-until-ios-payback
Platform: ios-app-store
Bundle ID: app.autonomousgamelab.portal
Cost gate: $99/year

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

## App-Like Value Evidence

- 10 playable original games in the catalog.
- PWA install loop is pwa-install-loop-ready.
- Retention loop is retention-loop-ready.
- Completion loop is completion-loop-ready.
- Replay loop is replay-loop-ready.
- Native shell is deferred until payback and Apple account gates clear to avoid a thin-wrapper submission.

## Handoff

- Capacitor config: native/ios/capacitor.config.json
- App Store checklist: native/ios/app-store-handoff.json
- README: native/ios/README.md

## Next Actions

- Keep the PWA hosted with privacy and support URLs reachable before App Review.
- Connect Apple Developer Program only after live revenue justifies the annual fee.
- Set App Store Connect API credentials only after the Apple account exists and store spend is allowed.
- Run Capacitor/Xcode packaging only after native-value, privacy, account, and payback gates pass.
