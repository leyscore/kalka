import type { Editor } from '@kalka/core/editor'

type DemoViewportEditor = Pick<Editor, 'onEditorEvent' | 'zoomToBounds' | 'graph' | 'state'>

/** Width-to-height ratio of the first screen a visitor lands on. */
const FIRST_SCREEN_RATIO = 16 / 10

/**
 * Frames the first screen of the page's first frame, the way a visitor lands on the page, instead
 * of shrinking a long landing page until nothing in it reads.
 */
export function fitDemoFirstScreen(
  editor: Pick<DemoViewportEditor, 'zoomToBounds' | 'graph' | 'state'>
) {
  const frame = editor.graph.getChildren(editor.state.currentPageId).at(0)
  if (!frame) return
  const height = Math.min(frame.height, frame.width / FIRST_SCREEN_RATIO)
  editor.zoomToBounds(frame.x, frame.y, frame.x + frame.width, frame.y + height)
}

/** Frame a demo page's first screen once, then preserve the user's own viewport on return visits. */
export function fitDemoPagesOnFirstVisit(store: DemoViewportEditor, pageIds: string[]) {
  const pending = new Set(pageIds)
  const unbindPage = store.onEditorEvent('page:changed', (pageId) => {
    if (!pending.delete(pageId)) return
    fitDemoFirstScreen(store)
    if (pending.size === 0) dispose()
  })
  const unbindGraph = store.onEditorEvent('graph:replaced', dispose)

  function dispose() {
    unbindPage()
    unbindGraph()
  }
  return dispose
}
