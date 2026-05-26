# Performance Budget

Generated: 2026-05-26T04:46:50.074Z
Status: performance-budget-ready
Initial JS: 651.7 KB (175.1 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-b36wFTPV.js, 3.3 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-target - Initial JS is 651.7 KB; target is 686 KB.
- pass: initial-js-budget - Initial JS is 651.7 KB; deploy cap is 700 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 175.1 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-b36wFTPV.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is phaser.esm-Bs14CRsP.js at 1321.4 KB.
- pass: deferred-game-budget - Deferred game chunk is 3.3 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Keep the initial shell below the 686 KB target before adding more dashboard data.
- Accept the large game-engine chunk only while it remains deferred from first paint.
