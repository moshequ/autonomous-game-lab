# Native Package

Generated: 2026-05-22T09:13:02.123Z
Status: blocked-draft-ready
Platform: android-trusted-web-activity
Package: app.autonomousgamelab.portal
Host: moshequ.github.io
Public origin: https://moshequ.github.io/autonomous-game-lab
Manifest URL: https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest

## Checks

- pass: production-host - Host is moshequ.github.io; base path is /autonomous-game-lab/.
- blocker: assetlinks-domain-verification - Digital Asset Links must be reachable at https://moshequ.github.io/.well-known/assetlinks.json; current artifact publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json.
- pass: hosted-privacy - Privacy URL status is hosted.
- pass: android-signing-fingerprint - SHA-256 certificate fingerprint is configured.
- pass: store-screenshots - 4 screenshot asset(s) available.
- pass: icon-assets - 6 icon asset(s) available.
- external-blocker: google-play-account - Google Play developer account is not connected; local TWA handoff can still be prepared.

## Handoff

- TWA manifest: native/android/twa-manifest.json
- Bubblewrap config: native/android/bubblewrap.config.json
- Asset links template: native/android/assetlinks.template.json
- Public asset links: public/.well-known/assetlinks.json
