import { trackEvent, type AnalyticsEventName } from './analytics'
import { buildDailyReturnLink } from './returnLink'

export type DailyReturnCalendarInput = {
  origin: string
  basePath: string
  gameId: string
  gameTitle: string
  challengeDate: string
  campaignId: string | null
  queryParam: string
  intentDate: string
  surface: string
  telemetryName: AnalyticsEventName
}

export type DailyReturnCalendarDownloadResult = {
  filename: string
  fileExtension: '.ics'
  method: 'calendar-download'
  url: string
}

const formatCalendarDate = (isoDate: string) => isoDate.replaceAll('-', '')

const nextIsoDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

const formatCalendarTimestamp = () =>
  new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')

const escapeCalendarText = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(';', '\\;').replaceAll(',', '\\,')

export const buildDailyReturnCalendar = (input: DailyReturnCalendarInput) => {
  const returnUrl = buildDailyReturnLink(input)
  const startDate = formatCalendarDate(input.intentDate)
  const endDate = formatCalendarDate(nextIsoDate(input.intentDate))

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Autonomous Game Lab//Return Reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:agl-return-${input.intentDate}-${input.gameId}@autonomous-game-lab`,
    `DTSTAMP:${formatCalendarTimestamp()}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeCalendarText(`Play ${input.gameTitle}`)}`,
    `DESCRIPTION:${escapeCalendarText(`Open your saved daily board: ${returnUrl}`)}`,
    `URL:${returnUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export const downloadDailyReturnCalendarFile = (
  input: DailyReturnCalendarInput,
): DailyReturnCalendarDownloadResult => {
  const calendar = buildDailyReturnCalendar(input)
  const calendarUrl = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
  const filename = `agl-return-${input.intentDate}.ics`
  const anchor = document.createElement('a')
  anchor.href = calendarUrl
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(calendarUrl), 0)

  const result = {
    filename,
    fileExtension: '.ics',
    method: 'calendar-download',
    url: buildDailyReturnLink(input),
  } as const

  trackEvent(input.telemetryName, {
    gameId: input.gameId,
    challengeDate: input.challengeDate,
    intentDate: input.intentDate,
    campaignId: input.campaignId,
    surface: input.surface,
    method: result.method,
    fileExtension: result.fileExtension,
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    noNotificationPermissionRequest: true,
    noPushNotifications: true,
    noAccountRequired: true,
    noExternalUpload: true,
    noRevenueEnablement: true,
  })

  return result
}
