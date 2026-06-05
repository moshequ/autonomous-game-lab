const msPerHour = 60 * 60 * 1000

const roundHours = (value) => Math.round(value * 100) / 100

export const buildExplicitDownloadsScanPolicy = ({
  explicitDownloadsScan = null,
  gateSampleEvidence = {},
  generatedAt = new Date().toISOString(),
  cooldownHours = 4,
  expiryBufferMs = 0,
} = {}) => {
  const evidenceReadyNow =
    (gateSampleEvidence.inbox?.events ?? 0) > 0 || (gateSampleEvidence.imported?.events ?? 0) > 0
  const generatedAtMs = Date.parse(generatedAt)
  const scanAtMs = Date.parse(explicitDownloadsScan?.scannedAt ?? '')
  const referenceMs = Number.isFinite(generatedAtMs) ? generatedAtMs : Date.now()
  const ageMs = Number.isFinite(scanAtMs) ? Math.max(0, referenceMs - scanAtMs) : null
  const coolingDown =
    explicitDownloadsScan?.evidenceFound === false &&
    !evidenceReadyNow &&
    typeof ageMs === 'number' &&
    ageMs + expiryBufferMs < cooldownHours * msPerHour
  const cooldownExpiryMs =
    explicitDownloadsScan?.evidenceFound === false && Number.isFinite(scanAtMs) && !evidenceReadyNow
      ? scanAtMs + cooldownHours * msPerHour
      : null
  const nextRecommendedScanAt =
    typeof cooldownExpiryMs === 'number'
      ? new Date(coolingDown ? cooldownExpiryMs : referenceMs).toISOString()
      : new Date(referenceMs).toISOString()

  return {
    explicitOptInRequired: true,
    cooldownHours,
    coolingDown,
    evidenceReadyNow,
    lastScanAt: Number.isFinite(scanAtMs) ? explicitDownloadsScan?.scannedAt : null,
    lastScanStatus: explicitDownloadsScan?.status ?? null,
    scanAgeHours: typeof ageMs === 'number' ? roundHours(ageMs / msPerHour) : null,
    cooldownRemainingHours: coolingDown ? roundHours(Math.max(0, cooldownHours * msPerHour - ageMs) / msPerHour) : 0,
    nextRecommendedScanAt,
  }
}

export const stableDownloadsScanPolicySource = (policy) => ({
  explicitOptInRequired: policy.explicitOptInRequired === true,
  cooldownHours: policy.cooldownHours,
  coolingDown: policy.coolingDown,
  evidenceReadyNow: policy.evidenceReadyNow,
  lastScanAt: policy.lastScanAt ?? null,
  lastScanStatus: policy.lastScanStatus ?? null,
  nextRecommendedScanAt: policy.lastScanAt ? policy.nextRecommendedScanAt : null,
})
