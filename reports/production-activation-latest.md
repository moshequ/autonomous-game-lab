# Production Activation

Generated: 2026-05-21T23:08:32.092Z
Status: activation-ready
Mode: dry-run
Execution: dry-run

## Configuration

- Activation requested: false
- Repository target known: true
- GitHub credentials ready: true
- Deployment ready: true
- Configured variables: 10
- Configured secrets: 5

## Planned Actions

- waiting-for-explicit-bootstrap-gate: repository-bootstrap; runnable no; ops/github/bootstrap-repository.sh; Held until AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 and the specific repository mutation gates are present.
- ready: sync-production-settings; runnable no; ops/github/setup-production.sh; GitHub credentials and repository target are available; setup can sync configured variables, secrets, and Pages settings.

## Controls

- zeroPaidSpend: true
- noPaidResourcesCreated: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- dryRunByDefault: true
- activationRequiresExplicitEnv: true
- repositoryMutationRequiresExplicitBootstrapGates: true
- workflowDispatchRequiresReadyDeployment: true
- androidWorkflowRequiresStoreEconomics: true
- secretValuesRedacted: true

## Execution Results

- none

## Next Actions

- Set AGL_PRODUCTION_ACTIVATE=1 in the production automation environment to apply configured zero-spend GitHub/Pages setup.
- Set AGL_PRODUCTION_RUN_WORKFLOWS=1 only after Pages settings and repository variables are configured.
- Android workflow dispatch stays held until store economics, signing, and Play credentials clear.
