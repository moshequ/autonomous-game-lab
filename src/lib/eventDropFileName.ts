export const sanitizeEventDropFileNamePart = (value: string) => {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return cleaned || 'manual'
}

export const eventDropFileName = (exportSurface: string, timestamp = new Date().toISOString()) =>
  `player-events-${timestamp.replace(/[:.]/g, '-')}-${sanitizeEventDropFileNamePart(exportSurface)}.json`
