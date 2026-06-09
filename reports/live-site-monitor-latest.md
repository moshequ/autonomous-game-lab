# Live Site Monitor

Generated: 2026-06-09T14:27:08.840Z
Status: live-site-monitor-alert
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 33/34 passed (1 failed, 0 blocked)
Live candidate: pwa-b2cb4bc35a26
Synced candidate: pwa-3e804a980eae
Live matches synced deploy: false
Latency p95 ms: 10861


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

- pass: app-shell; /; HTTP 200; 844 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 4337 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 3615 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 6451 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 6399 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 5012 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 4611 ms; Live read-only check passed.
- pass: owner-unlock-html; /owner-unlock.html; HTTP 200; 3692 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 4482 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 6585 ms; Live read-only check passed.
- pass: owner-runtime-config-json; /owner-runtime-config.json; HTTP 200; 4432 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 4745 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 3850 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 4430 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 6550 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 4742 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 6530 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 6696 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 6903 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 6906 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 3859 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 4353 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 6620 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 3685 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 4353 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 6947 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 6579 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 7336 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 7999 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 7336 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 10861 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 10888 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 5483 ms; Live read-only check passed.
- fail: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 4990 ms; Live release manifest does not match the latest synced deploy artifact.

## Next Actions

- Run post-deploy evidence sync or deploy the current release candidate before sending more traffic.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
