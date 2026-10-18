import {
  BrowserLayoutEngine,
  installLayoutEngine,
  scriptLayoutPage,
  type LayoutPage
} from '@kalka/core/layout'
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
  return new BrowserLayoutEngine(hostLayoutPage(host))
}

function hostLayoutPage(host: RenderHost): LayoutPage {
  return scriptLayoutPage((script) => host.request({ type: 'evaluate', script }, LAYOUT_TIMEOUT))
}

let page: LayoutPage | null | undefined

/**
 * The render host's page for the rest of the run, or null without the host or with
 * `KALKA_LAYOUT=stored`, which the CLI says once. The host starts on the first layout, not here.
 *
 * A tool that builds documents with Core's sources, such as `tools/generate/demo`, installs a
 * `BrowserLayoutEngine` of its own over this page: this package resolves `@kalka/core` to its
 * build, a module whose installed engines and loaded fonts are not the tool's.
 */
export function browserLayoutPage(): LayoutPage | null {
  if (page !== undefined) return page
  page = null
  if (process.env.KALKA_LAYOUT === 'stored') return page
  const host = renderHost()
  if (!host) {
    console.warn(
      'Kalka: no render host, so layers keep their saved layout. Build the desktop app (`bun run --cwd electron build:render-host`) to lay out with Chromium.'
    )
    return page
  }
  page = hostLayoutPage(host)
  return page
}

let installed: boolean | undefined

/**
 * Lays out with the browser for the rest of the run when the render host is there, and says
 * whether it does. Without it, or with `KALKA_LAYOUT=stored`, nothing is laid out again: layers
 * keep the geometry the document saved, and edits that move layers inside auto layout do not
 * reflow it.
 */
export function useBrowserLayout(): boolean {
  if (installed !== undefined) return installed
  const layoutPage = browserLayoutPage()
  installed = layoutPage !== null
  if (layoutPage) installLayoutEngine(new BrowserLayoutEngine(layoutPage))
  return installed
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
