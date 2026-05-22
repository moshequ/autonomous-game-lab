import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'player-evidence-watchdog.json')
const outputTsPath = path.join(root, 'src', 'data', 'playerEvidenceWatchdog.ts')
const reportPath = path.join(root, 'reports', 'player-evidence-watchdog-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const numberOrZero = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const positiveIsoOrNull = (value) => {
  const time = Date.parse(value ?? '')

  return Number.isFinite(time) ? new Date(time).toISOString() : null
}

const [
  localEventBridge,
  productGateSamplePlan,
  supportFeedback,
  productionMeasurementStatus,
  publicRepoSecurityAudit,
  unitEconomics,
] = await Promise.all([
  readJson(path.join(dataDir, 'local-event-bridge.json')),
  readJson(path.join(dataDir, 'product-gate-sample-plan.json')),
  readOptionalJson(path.join(dataDir, 'support-feedback.json'), {
    status: 'missing',
    summary: {},
    aggregateEvidenceNotes: [],
    controls: {},
  }),
  readOptionalJson(path.join(dataDir, 'production-measurement-status.json'), {
    status: 'missing',
    activePath: 'unknown',
    publicEvidenceHandoff: {},
    controls: {},
  }),
  readOptionalJson(path.join(dataDir, 'public-repo-security-audit.json'), {
    status: 'missing',
    repository: {},
    summary: {},
    controls: {},
  }),
  readOptionalJson(path.join(dataDir, 'unit-economics.json'), {
    controls: { maxDailySpendUsd: 0, paidAcquisitionAllowed: false },
  }),
])

const generatedAt = new Date().toISOString()
const generatedAtMs = Date.parse(generatedAt)
const downloadsScan = productGateSamplePlan.downloadsScan ?? localEventBridge.explicitDownloadsScanPolicy ?? {}
const nextRecommendedScanAt = positiveIsoOrNull(downloadsScan.nextRecommendedScanAt)
const nextRecommendedScanMs = Date.parse(nextRecommendedScanAt ?? '')
const cooldownRemainingMs = Number.isFinite(nextRecommendedScanMs)
  ? Math.max(0, nextRecommendedScanMs - generatedAtMs)
  : 0
const cooldownRemainingHours = Math.round((cooldownRemainingMs / (60 * 60 * 1000)) * 100) / 100
const inboxEvents = numberOrZero(localEventBridge.inbox?.validEvents)
const importedEvents = numberOrZero(localEventBridge.imported?.events)
const gateSampleInboxEvents = numberOrZero(localEventBridge.gateSampleEvidence?.inbox?.events)
const gateSampleImportedEvents = numberOrZero(localEventBridge.gateSampleEvidence?.imported?.events)
const aggregateEvidenceNotes = numberOrZero(supportFeedback.summary?.aggregateEvidenceNotes)
const publicHandoffNotes = numberOrZero(productionMeasurementStatus.publicEvidenceHandoff?.aggregateEvidence?.notes)
const aggregateNotes = Math.max(aggregateEvidenceNotes, publicHandoffNotes)
const localEventsAvailable = importedEvents > 0 || gateSampleImportedEvents > 0
const inboxReady = inboxEvents > 0 || gateSampleInboxEvents > 0
const explicitScanCoolingDown = downloadsScan.coolingDown === true || cooldownRemainingHours > 0
const explicitScanReady =
  downloadsScan.explicitOptInRequired !== false &&
  downloadsScan.evidenceReadyNow !== true &&
  !inboxReady &&
  !localEventsAvailable &&
  !explicitScanCoolingDown
const publicRepoSafe =
  publicRepoSecurityAudit.status === 'public-repo-security-ready' &&
  publicRepoSecurityAudit.summary?.highConfidenceSecretFindings === 0 &&
  publicRepoSecurityAudit.summary?.trackedSensitiveFiles === 0 &&
  publicRepoSecurityAudit.summary?.publicWorkflowRisks === 0 &&
  publicRepoSecurityAudit.controls?.noSecretValuesStored === true

const status = !publicRepoSafe
  ? 'watchdog-security-blocked'
  : inboxReady
    ? 'watchdog-ready-to-ingest'
    : localEventsAvailable
      ? 'watchdog-local-events-active'
      : aggregateNotes > 0
        ? 'watchdog-aggregate-review-ready'
        : explicitScanCoolingDown
          ? 'watchdog-cooling-down'
          : explicitScanReady
            ? 'watchdog-ready-for-explicit-scan'
            : 'watchdog-awaiting-player-export'

const nextActionByStatus = {
  'watchdog-security-blocked':
    'Run npm run autonomous:security-audit and do not publish or ingest new evidence until public repository controls pass.',
  'watchdog-ready-to-ingest':
    'Run npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:player-evidence-watchdog.',
  'watchdog-local-events-active':
    'Refresh analytics, product gates, sample plan, and watchdog from imported local events before changing product behavior.',
  'watchdog-aggregate-review-ready':
    'Review public aggregate evidence as supporting diagnosis only; collect event drops or configured production analytics before product-gate decisions.',
  'watchdog-cooling-down': `Hold explicit Downloads scanning until ${nextRecommendedScanAt ?? 'the next recommended scan time'} and keep player-initiated export/share routes active.`,
  'watchdog-ready-for-explicit-scan':
    'An explicit Downloads scan is allowed now if the owner intentionally opts in; run npm run autonomous:collect-sample-downloads afterward.',
  'watchdog-awaiting-player-export':
    'Keep the gate sample route active and wait for player-initiated local export, folder drop, or public aggregate note.',
}

const sourceDataHash = hashSourceData({
  localEventBridge,
  productGateSamplePlan,
  supportFeedback,
  productionMeasurementStatus,
  publicRepoSecurityAudit,
  unitEconomics,
})

const payload = {
  generatedAt,
  sourceDataHash,
  status,
  mode: 'zero-spend-player-evidence-watchdog',
  evidenceState: {
    localEventBridgeStatus: localEventBridge.status,
    productGateSamplePlanStatus: productGateSamplePlan.status,
    productionMeasurementStatus: productionMeasurementStatus.status,
    publicRepoSecurityStatus: publicRepoSecurityAudit.status,
    inboxEvents,
    importedEvents,
    gateSampleInboxEvents,
    gateSampleImportedEvents,
    aggregateEvidenceNotes: aggregateNotes,
    localEventsAvailable,
    inboxReady,
  },
  downloadsScan: {
    explicitOptInRequired: downloadsScan.explicitOptInRequired !== false,
    status: downloadsScan.lastScanStatus ?? localEventBridge.explicitDownloadsScan?.status ?? 'not-scanned',
    coolingDown: explicitScanCoolingDown,
    cooldownHours: downloadsScan.cooldownHours ?? localEventBridge.explicitDownloadsScanPolicy?.cooldownHours ?? 4,
    cooldownRemainingHours,
    evidenceReadyNow: downloadsScan.evidenceReadyNow === true,
    lastScanAt: positiveIsoOrNull(downloadsScan.lastScanAt ?? localEventBridge.explicitDownloadsScan?.scannedAt),
    nextRecommendedScanAt,
    readyForExplicitScan: explicitScanReady,
    command: 'npm run autonomous:collect-sample-downloads',
  },
  sampleNeed: {
    primaryGateId: productGateSamplePlan.summary?.primaryGateId ?? null,
    fastestGateId: productGateSamplePlan.summary?.fastestGateId ?? null,
    defaultRouteGateId: productGateSamplePlan.summary?.defaultRouteGateId ?? null,
    missions: numberOrZero(productGateSamplePlan.summary?.missions),
    totalPromptViewsNeeded: numberOrZero(productGateSamplePlan.summary?.totalPromptViewsNeeded),
    totalObservedSuccessesNeeded: numberOrZero(productGateSamplePlan.summary?.totalObservedSuccessesNeeded),
    sampleReadyCount: numberOrZero(productGateSamplePlan.summary?.sampleReadyCount),
  },
  publicRepoSecurity: {
    status: publicRepoSecurityAudit.status,
    repository: publicRepoSecurityAudit.repository?.target ?? null,
    visibility: publicRepoSecurityAudit.repository?.visibility ?? null,
    safeForPublicAutomation: publicRepoSafe,
    highConfidenceSecretFindings: numberOrZero(publicRepoSecurityAudit.summary?.highConfidenceSecretFindings),
    trackedSensitiveFiles: numberOrZero(publicRepoSecurityAudit.summary?.trackedSensitiveFiles),
    publicWorkflowRisks: numberOrZero(publicRepoSecurityAudit.summary?.publicWorkflowRisks),
  },
  commandPlan: {
    refreshWatchdog: 'npm run autonomous:player-evidence-watchdog',
    safeEvidenceRefresh:
      'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:player-evidence-watchdog',
    explicitDownloadsRefresh:
      'npm run autonomous:collect-sample-downloads && npm run autonomous:player-evidence-watchdog',
    productionMeasurementRefresh: 'npm run autonomous:measurement-status && npm run autonomous:player-evidence-watchdog',
  },
  controls: {
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noPaidTraffic: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    noSyntheticEvents: true,
    noAutomaticDownloadsScan: true,
    downloadsScanRequiresExplicitOptIn: true,
    noExternalUpload: localEventBridge.controls?.noExternalUpload === true,
    noSecretValuesStored: publicRepoSecurityAudit.controls?.noSecretValuesStored === true,
    publicRepoSafe,
    noRawPlayerEventsInPublicRepo: true,
    publicAggregateEvidenceIsSupportingOnly: true,
    aggregateEvidenceDoesNotPassGates: true,
    noRevenueEnablement: true,
    noStoreSubmission: true,
  },
  nextActions: [
    nextActionByStatus[status],
    'Keep public issues and reports limited to aggregate, redacted evidence; never commit raw player event drops, secrets, or private exports.',
  ],
}

const report = [
  '# Player Evidence Watchdog',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Source hash: ${payload.sourceDataHash}`,
  `Public repo safe: ${payload.publicRepoSecurity.safeForPublicAutomation}`,
  `Inbox events: ${payload.evidenceState.inboxEvents}`,
  `Imported events: ${payload.evidenceState.importedEvents}`,
  `Gate sample inbox events: ${payload.evidenceState.gateSampleInboxEvents}`,
  `Gate sample imported events: ${payload.evidenceState.gateSampleImportedEvents}`,
  `Aggregate evidence notes: ${payload.evidenceState.aggregateEvidenceNotes}`,
  `Downloads scan: ${payload.downloadsScan.status}; cooling down ${payload.downloadsScan.coolingDown}`,
  `Next recommended Downloads scan: ${payload.downloadsScan.nextRecommendedScanAt ?? 'none'}`,
  '',
  '## Commands',
  '',
  `- Refresh watchdog: ${payload.commandPlan.refreshWatchdog}`,
  `- Safe evidence refresh: ${payload.commandPlan.safeEvidenceRefresh}`,
  `- Explicit Downloads refresh: ${payload.commandPlan.explicitDownloadsRefresh}`,
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
].join('\n')

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
const appPayload = {
  status: payload.status,
  inbox: payload.evidenceState.inboxEvents,
  imported: payload.evidenceState.importedEvents,
  notes: payload.evidenceState.aggregateEvidenceNotes,
  scanReady: payload.downloadsScan.readyForExplicitScan,
  scanCooling: payload.downloadsScan.coolingDown,
  publicSafe: payload.publicRepoSecurity.safeForPublicAutomation,
  rawPrivate: payload.controls.noRawPlayerEventsInPublicRepo,
}
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const playerEvidenceWatchdog = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type PlayerEvidenceWatchdog = typeof playerEvidenceWatchdog\n`,
)
await writeFile(reportPath, report)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
