# Android Release

Generated: 2026-05-18T23:37:00.777Z
Status: blocked-needs-host-signing-play
Channel: android-google-play
Package: app.autonomousgamelab.portal
Track: internal
Cost posture: zero-paid-spend-until-live-revenue-and-retention-pass

## Checks

- blocker: native-package-ready - Native package is blocked-draft-ready.
- pass: store-package-draft - Store package is draft-ready; data safety is draft-ready.
- pass: store-compliance-draft - Store compliance is draft-ready-external-blockers.
- pass: store-screenshots - 4 screenshot asset(s) are available.
- blocker: asset-links - Digital Asset Links are template-only.
- blocker: signing-fingerprint - Android signing fingerprint is missing.
- missing-env: signing-secrets - Android keystore, password, and alias are available to CI.
- missing-env: google-play-account - Google Play account is not connected.
- missing-env: play-service-account - Google Play service account upload credentials are available to CI.
- held-by-economics: unit-economics-store-spend - Store spend allowed is false; spend mode is no-spend.
- blocker: promotion-gate - Android promotion status is blocked.
- pass: release-workflow - Android TWA release workflow exists.

## Artifacts

- TWA manifest: native/android/twa-manifest.json
- Bubblewrap config: native/android/bubblewrap.config.json
- Asset links: native/android/assetlinks.template.json
- Expected AAB: native/android/app-release-bundle.aab

## Setup Required Once

- Host the PWA on a stable HTTPS production domain with privacy and support URLs.
- Create Android signing material and set AGL_ANDROID_SHA256_CERT_FINGERPRINT after the certificate exists.
- Set AGL_ANDROID_KEYSTORE_BASE64, AGL_ANDROID_KEYSTORE_PASSWORD, and AGL_ANDROID_KEY_ALIAS in CI secrets.
- Connect Google Play only after unit economics allows the one-time store fee.
- Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON or GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64 before automated internal testing uploads.
