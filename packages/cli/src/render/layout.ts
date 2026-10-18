import { BrowserLayoutEngine, installLayoutEngine, scriptLayoutPage } from '@kalka/core/layout'
import { prepareGraphFonts } from '@kalka/core/text'
import type { SceneGraph } from '@kalka/scene-graph'

import { renderHost, type RenderHost } from '#cli/render/host/session'

/** How long one layout request may take before the run stops laying out. */
const LAYOUT_TIMEOUT = 60_000

/**
 * Layout by Chromium in the render host: each artboard is projected to the HTML and CSS the DOM
 * canvas builds, laid out in the host's page, and every box is read back into the layers, as
 * the app's DOM layout engine does.
 */
export function hostLayoutEngine(host: RenderHost): BrowserLayoutEngine {
  return new BrowserLayoutEngine(
    scriptLayoutPage((script) => host.request({ type: 'evaluate', script }, LAYOUT_TIMEOUT))
  )
}

let installed: boolean | undefined

/**
 * Lays out with the browser for the rest of the run when the render host is there, and says
 * whether it does. Without it, or with `KALKA_LAYOUT=stored`, nothing is laid out again: layers
 * keep the geometry the document saved, and edits that move layers inside auto layout do not
 * reflow it, which the CLI says once. The host starts on the first layout, not here.
 */
export function useBrowserLayout(): boolean {
  if (installed !== undefined) return installed
  installed = false
  if (process.env.KALKA_LAYOUT === 'stored') return false
  const host = renderHost()
  if (!host) {
    console.warn(
      'Kalka: no render host, so layers keep their saved layout. Build the desktop app (`bun run --cwd electron build:render-host`) to lay out with Chromium.'
    )
    return false
  }
  installLayoutEngine(hostLayoutEngine(host))
  installed = true
  return true
}

/**
 * Loads the fonts a document's text names, so the browser lays it out with them. Layout is
 * synchronous and fonts load over the network, so this runs before it, when a document opens.
 */
export async function prepareBrowserLayout(graph: SceneGraph): Promise<void> {
  if (!installed) return
  await prepareGraphFonts(
    graph,
    graph.getPages(true).map((page) => page.id)
  )
}
