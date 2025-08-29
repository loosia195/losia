export function track(event: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  // @ts-ignore
  window.gtag?.('event', event, params)
}
