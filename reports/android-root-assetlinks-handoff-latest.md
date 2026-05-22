# Android Root Asset Links Handoff

Generated: 2026-05-22T10:30:13.542Z
Status: root-assetlinks-handoff-ready
Target repository: moshequ/moshequ.github.io
Required root URL: https://moshequ.github.io/.well-known/assetlinks.json
Project Pages URL: https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json

## Controls

- zeroPaidSpend: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- dryRunByDefault: true
- explicitApplyFlagRequired: true
- targetRepositoryMustExist: true
- sourceFileOnly: true
- noSecretValues: true
- noForcePush: true
- branchProtectionRespected: true

## Checks

- actionable: root-assetlinks-needed - Android requires https://moshequ.github.io/.well-known/assetlinks.json; project Pages currently publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json.
- pass: source-assetlinks - Generated public assetlinks file is ready.
- prepared: target-repository - Prepared to sync into moshequ/moshequ.github.io:main:.well-known/assetlinks.json.
- available: github-cli - GitHub CLI automation is available for the repository context.

## Commands

- Dry run: `./ops/github/sync-root-assetlinks.sh`
- Sync: `AGL_SYNC_ROOT_ASSETLINKS=1 AGL_ROOT_ASSETLINKS_REPOSITORY="moshequ/moshequ.github.io" ./ops/github/sync-root-assetlinks.sh`
- Verify: `curl -fsSL "https://moshequ.github.io/.well-known/assetlinks.json"`

## Next Actions

- When root Pages repository access is available, run AGL_SYNC_ROOT_ASSETLINKS=1 AGL_ROOT_ASSETLINKS_REPOSITORY="moshequ/moshequ.github.io" ./ops/github/sync-root-assetlinks.sh.
- After the root file is live, rerun native package, Android release plan, and readiness evidence.
- Do not create accounts, pay store fees, or submit to stores from this handoff.
