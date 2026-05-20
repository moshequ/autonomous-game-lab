# Performance Budget

Generated: 2026-05-20T09:50:34.632Z
Status: performance-budget-ready
Initial JS: 617.6 KB (169.9 KB gzip)
Initial CSS: 9.6 KB (2.6 KB gzip)
Deferred game chunk: GameCanvas-B113asuI.js, 1360.8 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 617.6 KB; budget is 675 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 169.9 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 9.6 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-B113asuI.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-B113asuI.js at 1360.8 KB.
- pass: deferred-game-budget - Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
