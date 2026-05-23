export type DailyReturnLinkInput = {
  origin: string
  basePath: string
  gameId: string
  campaignId: string | null
  queryParam: string
  intentDate: string
  writeText?: (text: string) => Promise<void>
}

export type DailyReturnLinkCopyResult = {
  url: string
  method: 'clipboard' | 'clipboard_unavailable' | 'unsupported'
  succeeded: boolean
}

export const buildDailyReturnLink = ({
  origin,
  basePath,
  gameId,
  campaignId,
  queryParam,
  intentDate,
}: DailyReturnLinkInput) => {
  const returnPath = basePath.endsWith('/') ? basePath : `${basePath}/`
  const params = new URLSearchParams({
    game: gameId,
    utm_source: 'gate_sample',
    [queryParam]: intentDate,
  })

  if (campaignId) {
    params.set('utm_campaign', campaignId)
  }

  return `${origin}${returnPath}?${params.toString()}`
}

export const copyDailyReturnLinkToClipboard = async (
  input: DailyReturnLinkInput,
): Promise<DailyReturnLinkCopyResult> => {
  const url = buildDailyReturnLink(input)

  if (!input.writeText) {
    return { url, method: 'unsupported', succeeded: false }
  }

  try {
    await input.writeText(url)
    return { url, method: 'clipboard', succeeded: true }
  } catch {
    return { url, method: 'clipboard_unavailable', succeeded: false }
  }
}
