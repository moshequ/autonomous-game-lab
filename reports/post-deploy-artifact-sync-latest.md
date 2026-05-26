# Post-Deploy Artifact Sync

Generated: 2026-05-26T22:03:50.668Z
Status: post-deploy-artifact-sync-passed
Repository: moshequ/autonomous-game-lab
Workflow: web-pwa-deploy.yml
Run: 26477265948
Origin: https://moshequ.github.io/autonomous-game-lab/
Artifact candidate: pwa-b6ce2de81c1f
Live candidate: pwa-b6ce2de81c1f
Deployment freshness: post-deploy-evidence-head-synced

## Summary

- Planned: 7
- Passed: 6
- Failed: 0
- Blocked: 0

## Validation

- artifactPassed: true
- artifactStrict: true
- artifactControlsReady: true
- artifactSummaryPassed: true
- liveMatchesArtifact: true

## Deployment Freshness

- currentHeadSha: b1ad789ccda851dbc8a2ad68443c9deb87ac5568
- selectedRunHeadSha: 9b862c8bbc42b384a77d85ec6928746d5222af3e
- currentHeadDeployed: false
- currentHeadQueuedOrRunning: false
- liveMatchesCurrentLocalCandidate: false

## Checks

- pass: gh-cli - gh version 2.92.0 (2026-04-28)
- pass: github-repository - Target repository is moshequ/autonomous-game-lab.
- pass: successful-pages-run - Latest successful web-pwa-deploy.yml run is 26477265948.
- pass: post-deploy-smoke-artifact - Downloaded post-deploy-smoke artifact from run 26477265948.
- pass: strict-smoke-artifact - Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34.
- pass: live-release-manifest - Live release-candidate.json still matches the strict smoke artifact.
- monitor: deployment-freshness - Current main b1ad789ccda8 is the post-deploy evidence commit for deployed source 9b862c8bbc42.

## Controls

- zeroPaidSpend: true
- noWorkflowDispatch: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noAccountCreation: true
- readOnlyGithubArtifactDownload: true
- readOnlyHttpChecks: true
- strictManifestComparisonRequired: true
- separateFromLocalCandidate: true
- noPostDeployReleaseRefresh: true
- currentHeadFreshnessTracked: true
- olderDeployNotTreatedAsCurrentHead: true

## Next Actions

- Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.
- Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.
- Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass.
