# Live Site Monitor

Generated: 2026-05-22T23:53:52.434Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 25/25 passed (0 failed, 0 blocked)
Live candidate: pwa-33cf48505d63
Synced candidate: pwa-33cf48505d63
Live matches synced deploy: true
Latency p95 ms: 150

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

- pass: app-shell; /; HTTP 200; 103 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 50 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 150 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 51 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 63 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 65 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 138 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 63 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 62 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 54 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 53 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 55 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 49 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 52 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 57 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 51 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 50 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 50 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 124 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 53 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 50 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 139 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 45 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 48 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 174 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
