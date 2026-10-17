import type { EditorStore } from '@/app/editor/session'

import { fitDemoPagesOnFirstVisit } from './viewport'

/**
 * Kalka's own landing page, zipped from `assets/demo` by `tools/generate/demo` before the app is
 * served or bundled.
 */
const DEMO = { url: '/demo.kalka', name: 'Demo.kalka' }
/**
 * The engine showcase the browser tests drive, built from `tools/generate/demo`. The dev server
 * serves it; it is never bundled.
 */
const FIXTURE = { url: '/demo-fixture.fig', name: 'Demo.fig' }

/**
 * Opens the bundled demo document like any file: behind the canvas loader, with pages
 * materialized as they are visited. Each page is fitted to the viewport on its first visit.
 * `fixture` opens the engine showcase instead, on the dev server only.
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
  const [, ...later] = store.graph.getPages()
  fitDemoPagesOnFirstVisit(
    store,
    later.map((page) => page.id)
  )
}
