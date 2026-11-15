import { IS_BROWSER, IS_TAURI } from '@/constants'

/** A host that serves the app as a demo, such as `demo.kalka.design`. */
export function isDemoHost(hostname: string): boolean {
  return hostname.startsWith('demo.')
}

/**
 * On a demo host the whole site is the demo: its root opens the demo document and nothing asks a
 * visitor to set anything up or to recover earlier work. A redirect at the edge is not enough,
 * since the service worker answers later visits to the root from its cache.
 */
export const IS_DEMO_SITE = IS_BROWSER && !IS_TAURI && isDemoHost(window.location.hostname)
