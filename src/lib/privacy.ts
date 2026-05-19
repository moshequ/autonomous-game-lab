const externalAnalyticsOptOutKey = 'agl.privacy.externalAnalyticsOptOut'

export const isExternalAnalyticsOptedOut = () => {
  if (typeof window === 'undefined') {
    return true
  }

  return window.localStorage.getItem(externalAnalyticsOptOutKey) === 'true'
}

export const setExternalAnalyticsOptOut = (optedOut: boolean) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(externalAnalyticsOptOutKey, String(optedOut))
  window.dispatchEvent(new CustomEvent('agl:privacy', { detail: { externalAnalyticsOptedOut: optedOut } }))
}

