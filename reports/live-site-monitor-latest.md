# Live Site Monitor

Generated: 2026-05-25T17:59:28.028Z
Status: live-site-monitor-planned
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 20/32 passed (0 failed, 12 blocked)
Live candidate: pwa-74463d104cca
Synced candidate: pwa-74463d104cca
Live matches synced deploy: true
Latency p95 ms: 10833

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

- pass: app-shell; /; HTTP 200; 189 ms; Live read-only check passed.
- blocked: manifest-webmanifest; /manifest.webmanifest; HTTP n/a; n/a ms; fetch failed
- blocked: sw-js; /sw.js; HTTP n/a; n/a ms; fetch failed
- blocked: privacy-html; /privacy.html; HTTP n/a; n/a ms; fetch failed
- pass: support-html; /support.html; HTTP 200; 6063 ms; Live read-only check passed.
- blocked: measurement-status-html; /measurement-status.html; HTTP n/a; n/a ms; fetch failed
- blocked: measurement-status-json; /measurement-status.json; HTTP n/a; n/a ms; fetch failed
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 6059 ms; Live read-only check passed.
- blocked: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP n/a; n/a ms; fetch failed
- blocked: analytics-unlock-html; /analytics-unlock.html; HTTP n/a; n/a ms; fetch failed
- blocked: analytics-unlock-json; /analytics-unlock.json; HTTP n/a; n/a ms; fetch failed
- blocked: product-gate-recovery-html; /product-gate-recovery.html; HTTP n/a; n/a ms; fetch failed
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 6698 ms; Live read-only check passed.
- blocked: install-html; /install.html; HTTP n/a; n/a ms; fetch failed
- pass: compliance-json; /compliance.json; HTTP 200; 5952 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 5901 ms; Live read-only check passed.
- blocked: store-readiness-html; /store-readiness.html; HTTP n/a; n/a ms; The operation was aborted due to timeout
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 6646 ms; Live read-only check passed.
- blocked: app-ads-txt; /app-ads.txt; HTTP n/a; n/a ms; fetch failed
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 6557 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 10865 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 10601 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 10533 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 10534 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 10833 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 10616 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 10512 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 10216 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 10831 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 9698 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 10642 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 518 ms; Live read-only check passed.

## Next Actions

- Configure a public origin or deploy the PWA before live monitoring can pass.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
