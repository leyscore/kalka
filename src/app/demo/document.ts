import type { EditorStore } from '@/app/editor/session'

import { fitDemoFirstScreen, fitDemoPagesOnFirstVisit } from './viewport'

/**
 * Learn the basics, a page of lessons drawn on real layers, zipped from `assets/demo` by
 * `tools/generate/demo` before the app is served or bundled.
 */
const DEMO = { url: '/demo.kalka', name: 'Demo.kalka' }
/**
 * The engine showcase the browser tests drive, built from `tools/generate/demo`. The dev server
 * serves it; it is never bundled.
 */
const FIXTURE = { url: '/demo-fixture.fig', name: 'Demo.fig' }

/**
 * Opens the bundled demo document like any file: behind the canvas loader, with pages
 * materialized as they are visited. Each page opens on its first screen on its first visit, and
 * design-check markers stay off the canvas until another document opens, so visitors see the
 * design rather than the lint of a page that ships as it is.
 * `fixture` opens the engine showcase instead, on the dev server only, with each page fitted
 * whole: its pages are short boards the browser tests capture in full.
 */
export async function openDemoDocument(
  store: EditorStore,
  options: { fixture?: boolean } = {}
): Promise<void> {
  const fixture = options.fixture === true && import.meta.env.DEV
  const source = fixture ? FIXTURE : DEMO
  const blank = store.graph
  const response = await fetch(source.url)
  if (!response.ok) throw new Error(`The demo document is unavailable (${response.status})`)
  const file = new File([await response.arrayBuffer()], source.name)
  // A file opened, or a layer drawn, while the demo was loading keeps the tab; the demo never
  // replaces them.
  const untouched =
    store.graph === blank &&
    store.state.preparation === null &&
    store.graph.getChildren(store.state.currentPageId).length === 0
  if (!untouched) return
  await (fixture ? store.openFigFile(file) : store.openKalkaFile(file))
  store.designCheck.muteMarkers()
  const fit = fixture ? () => store.zoomToFit() : () => fitDemoFirstScreen(store)
  fit()
  const [, ...later] = store.graph.getPages()
  fitDemoPagesOnFirstVisit(
    store,
    later.map((page) => page.id),
    fit
  )
}
