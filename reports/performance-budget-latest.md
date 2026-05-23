# Performance Budget

Generated: 2026-05-23T02:55:53.827Z
Status: performance-budget-ready
Initial JS: 683.4 KB (185.5 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-CDEdQrIK.js, 1361.7 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 683.4 KB; budget is 686 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 185.5 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-CDEdQrIK.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-CDEdQrIK.js at 1361.7 KB.
- pass: deferred-game-budget - Deferred game chunk is 1361.7 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
