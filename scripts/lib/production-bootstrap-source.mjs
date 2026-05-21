import { hashSourceData } from './source-hash.mjs'

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
  deployment,
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
