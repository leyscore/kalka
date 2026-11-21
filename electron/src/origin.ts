/** Which addresses are the app's own, without Electron imports, for navigation and IPC checks. */

export const APP_SCHEME = 'kalka-app'
export const APP_ORIGIN = `${APP_SCHEME}://app`

/** A page of the app: the built app on `kalka-app://app/`, or the dev server in development. */
export function isAppURL(url: string, devURL: string | undefined): boolean {
  if (devURL) return url === devURL || url.startsWith(`${devURL}/`)
  return url.startsWith(`${APP_ORIGIN}/`)
}

/** The part of Electron's `WebFrameMain` the sender check reads. */
export interface SenderFrame {
  url: string
  parent: unknown
}

/**
 * Whether a native call may run: it comes from the main frame of one of the app's own pages.
 * The preload only reaches main frames, so a call from a subframe, a page that navigated away
 * or a frame already gone is refused.
 */
export function isTrustedSender(frame: SenderFrame | null | undefined, devURL: string | undefined): boolean {
  return Boolean(frame && frame.parent === null && isAppURL(frame.url, devURL))
}
