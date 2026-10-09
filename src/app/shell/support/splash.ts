const SPLASH_ID = 'boot-splash'
/** Long enough for the K to fill once, so a fast start still reads as an entrance. */
const MINIMUM_SHOWN_MS = 900
const FADE_MS = 420

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Fades the boot splash out once the app has mounted, then removes it. Test runs remove it at
 * once, since every page load would otherwise wait for it.
 */
export async function releaseBootSplash(
  options: { immediate?: boolean } = {},
  doc: Document = document
): Promise<void> {
  const splash = doc.getElementById(SPLASH_ID)
  if (!splash) return
  if (options.immediate) {
    splash.remove()
    return
  }
  const wait = MINIMUM_SHOWN_MS - performance.now()
  if (wait > 0) await delay(wait)
  splash.dataset.leaving = ''
  await delay(FADE_MS)
  splash.remove()
}

/** Removes the splash at once, for the support notice to take the page. */
export function removeBootSplash(doc: Document = document): void {
  doc.getElementById(SPLASH_ID)?.remove()
}
