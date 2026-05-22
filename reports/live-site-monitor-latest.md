# Live Site Monitor

Generated: 2026-05-22T10:41:50.578Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 19/19 passed (0 failed, 0 blocked)
Live candidate: pwa-9a0b61bb6ab4
Synced candidate: pwa-9a0b61bb6ab4
Live matches synced deploy: true
Latency p95 ms: 248

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

- pass: app-shell; /; HTTP 200; 60 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 195 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 194 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 197 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 212 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 200 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 196 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 200 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 200 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 208 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 206 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 207 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 207 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 203 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 206 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 204 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 205 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 205 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 248 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
