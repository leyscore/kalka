import type { SceneNode } from '@kalka/scene-graph'

import { useEditorStore } from '@/app/editor/active-store'
import { placeImage } from '@/app/editor/clipboard/place-image'
import { setDesignIssuesOnCanvas, setSnappingPreference } from '@/app/settings/preferences/apply'
import { appPreferences } from '@/app/settings/preferences/store'
import { createTextMenuActions } from '@/app/shell/menu/text-actions'

type TextFormatUpdates = {
  fontWeight?: number
  italic?: boolean
  textDecoration?: 'NONE' | 'UNDERLINE'
}

const store = useEditorStore()

export function alignSelected(
  axis: 'horizontal' | 'vertical',
  align: 'min' | 'center' | 'max'
): void {
  store.alignNodes([...store.state.selectedIds], axis, align)
}

export function updateSelectedText(updates: TextFormatUpdates): void {
  for (const node of store.selectedNodes.value) {
    if (node.type === 'TEXT') store.updateNodeWithUndo(node.id, updates, 'Format text')
  }
}

export function selectedTextNode(): SceneNode | undefined {
  return store.selectedNodes.value.find((item) => item.type === 'TEXT')
}

export function toggleSelectedTextBold(): void {
  const node = selectedTextNode()
  updateSelectedText({
    fontWeight: node && node.fontWeight >= 700 ? 400 : 700
  })
}

export function toggleSelectedTextItalic(): void {
  const node = selectedTextNode()
  updateSelectedText({ italic: node ? !node.italic : true })
}

export function toggleSelectedTextUnderline(): void {
  const node = selectedTextNode()
  updateSelectedText({
    textDecoration: node?.textDecoration === 'UNDERLINE' ? 'NONE' : 'UNDERLINE'
  })
}

/** Figma's Previous page and Next page: the page above or below the one shown, if any. */
export function showAdjacentPage(step: 1 | -1): void {
  const pages = store.graph.getPages()
  const index = pages.findIndex((page) => page.id === store.state.currentPageId)
  const page = pages[index + step]
  if (index !== -1 && page) void store.switchPage(page.id)
}

export function createSharedEditorMenuActions(
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
) {
  return {
    'zoom-in': () => store.applyZoom(-100, window.innerWidth / 2, window.innerHeight / 2),
    'zoom-out': () => store.applyZoom(100, window.innerWidth / 2, window.innerHeight / 2),
    'place-image': placeImage,
    'zoom-50': () => store.zoomToLevel(0.5),
    'zoom-200': () => store.zoomToLevel(2),
    'zoom-previous-frame': () => void store.zoomToAdjacentFrame(-1),
    'zoom-next-frame': () => void store.zoomToAdjacentFrame(1),
    'previous-page': () => showAdjacentPage(-1),
    'next-page': () => showAdjacentPage(1),
    'view-split-right': () => store.splitPane(store.activePaneId.value, 'horizontal'),
    'view-split-down': () => store.splitPane(store.activePaneId.value, 'vertical'),
    'view-rulers': () => {
      store.state.showRulers = !store.state.showRulers
      store.requestRepaint()
    },
    'view-pixel-grid': () => {
      store.state.showPixelGrid = store.state.showPixelGrid === false
      store.requestRepaint()
    },
    'view-multiplayer-cursors': () => {
      store.state.showRemoteCursors = !store.state.showRemoteCursors
      store.requestRepaint()
    },
    'view-design-issues': () =>
      setDesignIssuesOnCanvas(!appPreferences.value.designCheck.showOnCanvas),
    'snap-geometry': () =>
      setSnappingPreference('geometry', !store.state.snappingPreferences.geometry),
    'snap-objects': () =>
      setSnappingPreference('objects', !store.state.snappingPreferences.objects),
    'snap-pixel-grid': () =>
      setSnappingPreference('pixelGrid', !store.state.snappingPreferences.pixelGrid),
    'toggle-ui': () => {
      store.state.showUI = !store.state.showUI
    },
    'toggle-preview': () => store.togglePlay(),
    'collapse-layers': () => store.collapseLayers(),
    'theme-light': () => setTheme('light'),
    'theme-dark': () => setTheme('dark'),
    'theme-auto': () => setTheme('auto'),
    'text.bold': toggleSelectedTextBold,
    'text.italic': toggleSelectedTextItalic,
    'text.underline': toggleSelectedTextUnderline,
    ...createTextMenuActions(store),
    'arrange.align-left': () => alignSelected('horizontal', 'min'),
    'arrange.align-center': () => alignSelected('horizontal', 'center'),
    'arrange.align-right': () => alignSelected('horizontal', 'max'),
    'arrange.align-top': () => alignSelected('vertical', 'min'),
    'arrange.align-middle': () => alignSelected('vertical', 'center'),
    'arrange.align-bottom': () => alignSelected('vertical', 'max')
  }
}
