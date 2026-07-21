import { computeAllLayouts } from '@open-pencil/core/layout'
import { renderJSX } from '@open-pencil/core/design-jsx'

import { DEMO_COLORS, solid } from '@/app/demo/colors'
import { SHOWCASE_JSX } from '@/app/demo/jsx/showcase'
import { createAppPreviewSection } from '@/app/demo/sections/app-preview'
import { createComponentsSection } from '@/app/demo/sections/components'
import { createDemoVariables } from '@/app/demo/sections/variables'
import type { EditorStore } from '@/app/editor/session'

export async function createDemoShapes(store: EditorStore) {
  const { graph } = store

  const comps = createComponentsSection(store)
  computeAllLayouts(graph)
  const app = createAppPreviewSection(store, comps)
  await renderJSX(graph, SHOWCASE_JSX)
  createDemoVariables(store)

  // Theme the screen through variables so editing one re-themes the demo.
  graph.bindVariable(app.sidebar, 'fills/0/color', 'var-bg')
  graph.bindVariable(app.headerTitle, 'fills/0/color', 'var-text-primary')
  graph.bindVariable(app.chartTitle, 'fills/0/color', 'var-text-primary')

  computeAllLayouts(graph)

  // Apply badge tones after layout so component sync doesn't revert them.
  const toneColors = {
    success: [DEMO_COLORS.successSoft, DEMO_COLORS.success],
    accent: [DEMO_COLORS.accentSoft, DEMO_COLORS.accent],
    danger: [DEMO_COLORS.dangerSoft, DEMO_COLORS.danger]
  } as const
  for (const b of app.statBadges) {
    const [soft, strong] = toneColors[b.tone]
    const badge = graph.getNode(b.id)
    if (!badge) continue
    // Record the label fill as an override so component sync preserves it.
    graph.updateNode(b.labelId, { fills: [solid(strong)] })
    graph.updateNode(b.id, {
      fills: [solid(soft)],
      overrides: { ...badge.overrides, [`${b.labelId}:fills`]: [solid(strong)] }
    })
  }

  store.clearSelection()
  void store.loadFontsForNodes(graph.getPages().flatMap((page) => page.childIds)).then(() => {
    store.requestRender()
    return undefined
  })
}
