# Performance Budget

Generated: 2026-05-21T19:14:28.615Z
Status: performance-budget-ready
Initial JS: 675.7 KB (183.4 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-C1gTgh1F.js, 1361.1 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 675.7 KB; budget is 676 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 183.4 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-C1gTgh1F.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-C1gTgh1F.js at 1361.1 KB.
- pass: deferred-game-budget - Deferred game chunk is 1361.1 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
