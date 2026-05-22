# Android Root Asset Links Handoff

Generated: 2026-05-22T11:01:16.498Z
Status: root-assetlinks-live
Target repository: moshequ/moshequ.github.io
Required root URL: https://moshequ.github.io/.well-known/assetlinks.json
Project Pages URL: https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json
Repository exists: true
Root live status: live-match

## Controls

- zeroPaidSpend: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- dryRunByDefault: true
- explicitApplyFlagRequired: true
- explicitRepositoryCreateFlagRequired: true
- explicitPagesConfigurationFlagRequired: true
- targetRepositoryMustExist: false
- sourceFileContentOnly: true
- pagesSupportFilesAllowed: .nojekyll
- noSecretValues: true
- noForcePush: true
- branchProtectionRespected: true

## Checks

- pass: root-assetlinks-needed - Native package is already root-verifiable or does not need a root handoff.
- pass: source-assetlinks - Generated public assetlinks file is ready.
- pass: target-repository - Prepared to sync into moshequ/moshequ.github.io:main:.well-known/assetlinks.json.
- pass: root-live-verification - Root Digital Asset Links match app.autonomousgamelab.portal.
- available: github-cli - GitHub CLI automation is available for the repository context.

## Commands

- Dry run: `./ops/github/sync-root-assetlinks.sh`
- Sync: `AGL_SYNC_ROOT_ASSETLINKS=1 AGL_ROOT_ASSETLINKS_REPOSITORY="moshequ/moshequ.github.io" ./ops/github/sync-root-assetlinks.sh`
- Bootstrap: `AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE=1 AGL_SYNC_ROOT_ASSETLINKS=1 AGL_SYNC_ROOT_ASSETLINKS_PAGES=1 AGL_ROOT_ASSETLINKS_REPOSITORY="moshequ/moshequ.github.io" ./ops/github/sync-root-assetlinks.sh`
- Verify: `curl -fsSL "https://moshequ.github.io/.well-known/assetlinks.json"`

## Next Actions

- Root Digital Asset Links are live at https://moshequ.github.io/.well-known/assetlinks.json.
- After the root file is live, rerun native package, Android release plan, and readiness evidence.
- Do not create accounts, pay store fees, or submit to stores from this handoff.
