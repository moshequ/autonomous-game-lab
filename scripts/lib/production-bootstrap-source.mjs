import { hashSourceData } from './source-hash.mjs'

const stableDeploymentForBootstrap = (deployment) => ({
  status: deployment?.status ?? 'missing',
  target: deployment?.target ?? {},
  repositoryChannel: deployment?.repositoryChannel ?? {},
  eventCollector: deployment?.eventCollector ?? {},
  releaseCandidate: deployment?.releaseCandidate ?? {},
  environment: deployment?.environment ?? {},
  checks: (deployment?.checks ?? []).map((check) => ({
    id: check.id,
    status: check.status,
  })),
})

export const stableProductionBootstrapSource = ({
  releaseCandidate,
  deployment,
  repositoryReadiness,
  repositoryBootstrap,
  productionEnvironment,
  eventCollectorDeployment,
  storeCompliance,
  nativePackage,
  androidRelease,
  monetization,
  unitEconomics,
}) => ({
  releaseCandidate,
  deployment: stableDeploymentForBootstrap(deployment),
  repositoryReadiness,
  repositoryBootstrap,
  productionEnvironment,
  eventCollectorDeployment,
  storeCompliance,
  nativePackage,
  androidRelease,
  monetization: {
    status: monetization?.status ?? 'missing',
    revenueEnabled: monetization?.revenueEnabled === true,
  },
  unitEconomics: {
    status: unitEconomics?.status ?? 'missing',
    controls: unitEconomics?.controls ?? {},
  },
})

export const productionBootstrapSourceDataHash = (source) =>
  hashSourceData(stableProductionBootstrapSource(source))
