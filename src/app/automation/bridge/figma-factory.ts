import { FigmaAPI } from '@kalka/core/figma-api'
import { createCanvasKitRasterCodec } from '@kalka/core/io/formats/raster'
import { loadDocumentFont } from '@kalka/core/text'

import { renderAutomationImage } from '@/app/automation/bridge/export-handlers'
import type { EditorStore } from '@/app/editor/active-store'
import { listFamilies, listFonts, loadFont } from '@/app/editor/fonts'

function useRenderer(api: FigmaAPI, store: EditorStore): void {
  api.setRenderer(store.renderer ?? null)
  if (store.renderer) api.rasterCodec = createCanvasKitRasterCodec(store.renderer.ck)
}

/**
 * Loads CanvasKit for a tool call and gives it to `api`: grouping, booleans, flattening and
 * comparing images compute with Skia. Tools are where agents work, so the first call loads it.
 */
export async function attachCanvasKit(store: EditorStore, api: FigmaAPI): Promise<void> {
  await store.loadCanvasKit()
  useRenderer(api, store)
}

export function makeFigmaFromStore(
  store: EditorStore,
  pageId = store.state.currentPageId
): FigmaAPI {
  const api = new FigmaAPI(store.graph)
  useRenderer(api, store)
  api.icons = store.iconProvider
  api.theme = store.state.theme ?? 'light'
  api.currentPage = api.wrapNode(pageId)
  // The user's selection belongs to the page on screen.
  api.currentPage.selection =
    pageId === store.state.currentPageId
      ? [...store.state.selectedIds]
          .map((id) => api.getNodeById(id))
          .filter((n): n is NonNullable<typeof n> => n !== null)
      : []
  api.viewport = {
    center: {
      x: (-store.state.panX + window.innerWidth / 2) / store.state.zoom,
      y: (-store.state.panY + window.innerHeight / 2) / store.state.zoom
    },
    zoom: store.state.zoom
  }
  api.exportImage = async (nodeIds, opts) =>
    renderAutomationImage(
      store,
      nodeIds,
      opts.scale ?? 1,
      opts.format ?? 'PNG',
      opts.pageId ?? pageId
    )
  api.loadFontAsync = async ({ family, style }) => {
    await loadDocumentFont(store.graph, family, style, loadFont).catch(() => null)
  }
  api.listAvailableFontsAsync = async () => {
    const [systemFonts, familyOptions] = await Promise.all([listFonts(), listFamilies()])
    const fonts = systemFonts.flatMap(({ family, styles }) =>
      styles.map((style) => ({ fontName: { family, style } }))
    )
    const seenFamilies = new Set(systemFonts.map(({ family }) => family))
    for (const { family } of familyOptions) {
      if (!seenFamilies.has(family)) fonts.push({ fontName: { family, style: 'Regular' } })
    }
    return fonts
  }
  return api
}
