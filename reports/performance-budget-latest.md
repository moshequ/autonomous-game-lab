# Performance Budget

Generated: 2026-05-19T12:49:58.909Z
Status: performance-budget-ready
Initial JS: 657.2 KB (174.2 KB gzip)
Initial CSS: 9.6 KB (2.6 KB gzip)
Deferred game chunk: GameCanvas-8t3fnNGP.js, 1360.8 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 657.2 KB; budget is 675 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 174.2 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 9.6 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-8t3fnNGP.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-8t3fnNGP.js at 1360.8 KB.
- pass: deferred-game-budget - Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
