import { computed } from 'vue'

import type { SceneNode } from '@kalka/scene-graph'

import { useEditor } from '#vue/editor/context'

/** What a page list shows of a page: its id, name, and whether it holds anything (dividers). */
function pageListKey(pages: readonly SceneNode[]): string {
  return pages
    .map((page) => `${page.id}\u0000${page.name}\u0000${page.childIds.length > 0}`)
    .join('\n')
}

/**
 * Returns reactive page state and page-management actions.
 *
 * Use this composable to build page switchers, page lists, or navigation
 * panels without manually reading the graph in each component.
 */
export function usePageList() {
  const editor = useEditor()

  // The graph's version moves on every edit, a keystroke included; the list stays the same array
  // until a page is added, removed, moved, renamed or emptied, so menus built from it are not
  // rebuilt while someone types.
  let shownKey = ''
  const pages = computed<SceneNode[]>((previous) => {
    void editor.state.sceneVersion
    const next = editor.graph.getPages()
    const key = pageListKey(next)
    if (previous && key === shownKey) return previous
    shownKey = key
    return next
  })
  const currentPageId = computed(() => editor.state.currentPageId)

  return {
    editor,
    pages,
    currentPageId,
    switchPage: editor.switchPage,
    addPage: editor.addPage,
    duplicatePage: editor.duplicatePage,
    deletePage: editor.deletePage,
    movePage: editor.movePage,
    renamePage: editor.renamePage
  }
}
