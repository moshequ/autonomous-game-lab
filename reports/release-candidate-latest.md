# Release Candidate

Generated: 2026-05-20T01:23:12.274Z
Status: release-candidate-ready
Candidate: pwa-841eb29102c3
Files: 40
Size: 3593.7 KB
Aggregate SHA-256: 841eb29102c35b7b4053fd692c8f4fccdc4e644bec51f666fd0e1617b09e6ab4

## Checks

- pass: dist-inventory - 40 dist files inventoried.
- pass: required-files - 15/15 required files present.
- pass: game-pages - 10 generated game page(s) in dist.
- pass: performance-budget - Performance budget is performance-budget-ready.
- pass: release-health - Release health is monitoring.
- pass: production-response - Deploy allowed is true.
- pass: spend-guard - Spend mode is no-spend.
- pass: post-deploy-smoke-plan - 11 post-deploy smoke URL(s) planned.

## Required Files

- pass: index.html
- pass: manifest.webmanifest
- pass: sw.js
- pass: privacy.html
- pass: support.html
- pass: compliance.json
- pass: sitemap.xml
- pass: robots.txt
- pass: seed-kit.html
- pass: share-manifest.json
- pass: monetization.json
- pass: app-ads.txt
- pass: icons/icon-192.png
- pass: icons/icon-512.png
- pass: icons/apple-touch-icon.png

## Post-Deploy Smoke

- 200: ${DEPLOYED_PWA_ORIGIN}/
- 200: ${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest
- 200: ${DEPLOYED_PWA_ORIGIN}/sw.js
- 200: ${DEPLOYED_PWA_ORIGIN}/privacy.html
- 200: ${DEPLOYED_PWA_ORIGIN}/support.html
- 200: ${DEPLOYED_PWA_ORIGIN}/compliance.json
- 200: ${DEPLOYED_PWA_ORIGIN}/monetization.json
- 200: ${DEPLOYED_PWA_ORIGIN}/app-ads.txt
- 200: ${DEPLOYED_PWA_ORIGIN}/seed-kit.html
- 200: ${DEPLOYED_PWA_ORIGIN}/sitemap.xml
- 200: ${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html

## Controls

- Zero paid spend: true
- No workflow execution: true
- No store submission: true
- Content hashes recorded: true
