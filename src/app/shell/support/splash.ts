const SPLASH_ID = 'boot-splash'
/** Matches the `#boot-splash` transition in `index.html`. */
const FADE_MS = 160
/** The longest the splash waits for the first screen's fonts or a document opened at launch. */
const MAXIMUM_HOLD_MS = 1500

const holds: Promise<unknown>[] = []

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

/**
 * Keeps the splash up until `ready` settles, so the first screen shows instead of the home
 * screen flashing before it, such as a document opened from the Finder. The splash never waits
 * longer than `MAXIMUM_HOLD_MS` for holds.
 */
export function holdBootSplash(ready: Promise<unknown>, doc: Document = document): void {
  if (doc.getElementById(SPLASH_ID)) holds.push(ready.catch(() => undefined))
}

/**
 * Fades the boot splash out as soon as the first screen is painted with its fonts, then removes
 * it. Test runs remove it at once, since every page load would otherwise wait for it.
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
  // The interface font swapping in after the splash left would read as a flash of unstyled text.
  await Promise.race([Promise.all([doc.fonts.ready, ...holds]), delay(MAXIMUM_HOLD_MS)])
  holds.length = 0
  await nextFrame()
  splash.dataset.leaving = ''
  await delay(FADE_MS)
  splash.remove()
}

/** Removes the splash at once, for the support notice to take the page. */
export function removeBootSplash(doc: Document = document): void {
  doc.getElementById(SPLASH_ID)?.remove()
}
