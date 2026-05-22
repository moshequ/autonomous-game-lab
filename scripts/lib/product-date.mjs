const PRODUCT_TIME_ZONE =
  process.env.AGL_PRODUCT_TIME_ZONE ?? process.env.AGL_PRODUCT_TIMEZONE ?? 'Asia/Hebron'

const productDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PRODUCT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const localIsoDate = (date = new Date()) => {
  const parts = Object.fromEntries(
    productDateFormatter
      .formatToParts(date)
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => [part.type, part.value]),
  )

  return `${parts.year}-${parts.month}-${parts.day}`
}

export const slugDate = (date = new Date()) => localIsoDate(date).replaceAll('-', '')
