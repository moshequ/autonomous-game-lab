# Live Site Monitor

Generated: 2026-05-21T22:46:50.685Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 17/17 passed (0 failed, 0 blocked)
Live candidate: pwa-6c6b46664d59
Synced candidate: pwa-6c6b46664d59
Live matches synced deploy: true
Latency p95 ms: 263

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

- pass: app-shell; /; HTTP 200; 263 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 218 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 219 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 219 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 227 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 219 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 219 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 220 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 220 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 220 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 216 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 219 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 230 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 225 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 229 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 229 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 231 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
