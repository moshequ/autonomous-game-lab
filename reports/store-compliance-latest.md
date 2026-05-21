# Store Compliance

Generated: 2026-05-21T21:25:36.614Z
Status: draft-ready-external-blockers
Policy posture: no-accounts-no-ugc-no-gambling-no-paid-spend

## Content Rating

- Google Play expected rating: Everyone
- Apple expected rating: 4+
- Gambling: none
- User-generated content: false

## Ads And Monetization

- Ads enabled: false
- IAP enabled: false
- Paywalled core rules: false

## Checks

- pass: content-rating - Content rating drafts avoid gambling, UGC, real-money prizes, mature content, and unrestricted web access.
- pass: target-audience - Target audience is general audience and not child-directed.
- pass: ads-declaration - Ads declaration is ads-disabled; revenue enabled is false.
- pass: privacy-data - Data safety, App Privacy labels, and account-deletion stance are drafted.
- pass: app-access - Reviewer access does not require credentials because accounts are disabled.
- pass: compliance-publication - Deployable compliance manifest ties privacy, support, and post-deploy smoke checks together.
- pass: store-screenshots - 4 generated screenshot asset(s) are available.
- pass: hosted-privacy-url - Hosted privacy policy URL is required before public store submission.
- external-blocker: support-contact - Production support email is required before public store submission.
- external-blocker: google-play-account - Google Play developer account must be connected before Android submission.
- external-blocker: apple-developer-account - Apple Developer account remains deferred until iOS spend is justified.

## Reviewer Notes

- Autonomous Game Lab is a general-audience collection of original solo strategy puzzles.
- Current builds disable accounts, chat, UGC, purchases, subscriptions, gambling, real-money prizes, and ads.
- Anonymous gameplay analytics can be disabled with the in-app external analytics opt-out.
- Native app submission must wait for hosted privacy/support URLs, signing assets, store accounts, and final review.

## Next Actions

- Resolve external blocker: Production support email is required before public store submission.
- Keep ads disabled until retention and ad-provider gates pass.
- Regenerate store compliance after every store package, monetization, or production-environment change.
