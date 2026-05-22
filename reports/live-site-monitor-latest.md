# Live Site Monitor

Generated: 2026-05-22T15:18:43.435Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 19/19 passed (0 failed, 0 blocked)
Live candidate: pwa-e41ffb89580c
Synced candidate: pwa-e41ffb89580c
Live matches synced deploy: true
Latency p95 ms: 108

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

- pass: app-shell; /; HTTP 200; 26 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 80 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 91 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 89 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 86 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 84 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 86 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 84 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 78 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 71 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 75 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 79 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 80 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 80 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 77 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 76 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 75 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 73 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 108 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
