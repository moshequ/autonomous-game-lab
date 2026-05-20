import { createHash } from 'node:crypto'

const normalizeSourceValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeSourceValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'generatedAt')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeSourceValue(item)]),
    )
  }

  return value
}

export const hashSourceData = (value) =>
  createHash('sha256').update(JSON.stringify(normalizeSourceValue(value))).digest('hex').slice(0, 12)

export const hashRawSourceData = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12)

export const sourceFreshness = ({ artifact, readyStatuses, inputs, sourceDataHash: providedSourceDataHash }) => {
  const sourceDataHash =
    providedSourceDataHash ?? hashSourceData(Object.fromEntries(inputs.map((input) => [input.id, input.data])))
  const artifactSourceDataHash = artifact?.sourceDataHash ?? null
  const current = artifactSourceDataHash === sourceDataHash && artifact?.status !== 'missing'

  return {
    current,
    ready: current && readyStatuses.includes(artifact?.status),
    status: artifact?.status ?? 'missing',
    artifactGeneratedAt: artifact?.generatedAt ?? null,
    artifactSourceDataHash,
    sourceDataHash,
    evaluatedInputIds: inputs.map((input) => input.id),
  }
}
