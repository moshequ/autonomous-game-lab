# Native Package

Generated: 2026-05-18T23:36:59.702Z
Status: blocked-draft-ready
Platform: android-trusted-web-activity
Package: app.autonomousgamelab.portal
Host: autonomous-game-lab.example.com

## Checks

- blocker: production-host - Production host is not configured.
- blocker: hosted-privacy - Privacy URL status is needs-hosted-domain.
- blocker: android-signing-fingerprint - Signing fingerprint is missing.
- pass: store-screenshots - 4 screenshot asset(s) available.
- pass: icon-assets - 6 icon asset(s) available.
- blocker: google-play-account - Google Play developer account is not connected.

## Handoff

- TWA manifest: native/android/twa-manifest.json
- Bubblewrap config: native/android/bubblewrap.config.json
- Asset links template: native/android/assetlinks.template.json
