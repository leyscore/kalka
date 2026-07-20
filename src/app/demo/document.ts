import { computeAllLayouts } from '@open-pencil/core/layout'

import { createAppPreviewSection } from '@/app/demo/sections/app-preview'
import { createComponentsSection } from '@/app/demo/sections/components'
import { createDemoVariables } from '@/app/demo/sections/variables'
import type { EditorStore } from '@/app/editor/session'

export function createDemoShapes(store: EditorStore) {
  const { graph } = store

  const comps = createComponentsSection(store)
  computeAllLayouts(graph)
  const app = createAppPreviewSection(store, comps)
  createDemoVariables(store)

  // Theme the screen through variables so editing one re-themes the demo.
  graph.bindVariable(app.sidebar, 'fills/0/color', 'var-bg')
  graph.bindVariable(app.headerTitle, 'fills/0/color', 'var-text-primary')
  graph.bindVariable(app.chartTitle, 'fills/0/color', 'var-text-primary')

  computeAllLayouts(graph)
  store.clearSelection()
  void store.loadFontsForNodes(graph.getPages().flatMap((page) => page.childIds)).then(() => {
    store.requestRender()
    return undefined
  })
}
