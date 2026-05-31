# Production Activation

Generated: 2026-05-31T13:14:59.224Z
Status: activation-waiting-for-credentials
Mode: dry-run
Execution: dry-run

## Configuration

- Activation requested: false
- Repository target known: true
- GitHub credentials ready: false
- Deployment ready: true
- Configured variables: 6
- Configured secrets: 3

## Planned Actions

- waiting-for-explicit-bootstrap-gate: repository-bootstrap; runnable no; ops/github/bootstrap-repository.sh; Held until AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 and the specific repository mutation gates are present.
- waiting-for-github-credentials: sync-production-settings; runnable no; ops/github/setup-production.sh; Held until an existing GitHub repository target and gh credentials are available.

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

- Provide an existing GitHub repository target and gh credentials before production activation can apply setup.
- Set AGL_PRODUCTION_RUN_WORKFLOWS=1 only after Pages settings and repository variables are configured.
- Android workflow dispatch stays held until store economics, signing, and Play credentials clear.
