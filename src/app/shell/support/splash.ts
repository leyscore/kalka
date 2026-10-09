const SPLASH_ID = 'boot-splash'
/** Long enough for the K to fill once, so a fast start still reads as an entrance. */
const MINIMUM_SHOWN_MS = 900
const FADE_MS = 420

/** Fades the boot splash out once the app has mounted, then removes it. */
export async function releaseBootSplash(doc: Document = document): Promise<void> {
  const splash = doc.getElementById(SPLASH_ID)
  if (!splash) return
  const wait = MINIMUM_SHOWN_MS - performance.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  splash.dataset.leaving = ''
  await new Promise((resolve) => setTimeout(resolve, FADE_MS))
  splash.remove()
}

/** Removes the splash at once, for the support notice to take the page. */
export function removeBootSplash(doc: Document = document): void {
  doc.getElementById(SPLASH_ID)?.remove()
}
