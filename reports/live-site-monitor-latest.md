# Live Site Monitor

Generated: 2026-05-21T10:51:06.347Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 15/15 passed (0 failed, 0 blocked)
Live candidate: pwa-8329cacb3911
Synced candidate: pwa-8329cacb3911
Live matches synced deploy: true
Latency p95 ms: 313

## Controls

- zeroPaidSpend: true
- readOnlyHttpChecks: true
- noMutation: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noCookiesOrCredentials: true
- strictSyncedManifestComparison: true

## Checks

- pass: app-shell; /; HTTP 200; 253 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 212 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 211 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 211 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 219 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 212 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 313 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 305 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 208 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 211 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 311 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 286 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 312 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 310 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 291 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
