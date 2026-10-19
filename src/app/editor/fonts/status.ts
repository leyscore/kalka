import { computed, ref } from 'vue'

import { computeAllLayouts } from '@kalka/core/layout'
import { fontManager, fontResolver, PageFontUses } from '@kalka/core/text'
import type { SceneGraph } from '@kalka/scene-graph'
import { useEditorEvent } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { loadFont, requestLocalFontAccess } from '@/app/editor/fonts'
import { appRuntimeConfig } from '@/app/runtime/config'

export function useDocumentFontStatus() {
  const editor = useEditorStore()
  const revision = ref(0)
  const retrying = ref(false)

  const refresh = () => {
    revision.value++
  }

  // The page's text faces, kept current layer by layer; an edit that changes no face or name
  // leaves the status as it is.
  let uses: PageFontUses | null = null
  let usesGraph: SceneGraph | null = null
  const pageUses = () => {
    const pageId = editor.state.currentPageId
    if (uses?.pageId !== pageId || usesGraph !== editor.graph) {
      uses = new PageFontUses(editor.graph, pageId)
      usesGraph = editor.graph
    }
    return uses
  }
  const rebuild = () => {
    uses = null
    refresh()
  }
  const updateNode = (id: string) => {
    if (uses?.update(id)) refresh()
  }
  const updateSubtree = (id: string) => {
    if (!uses) return
    let changed = uses.update(id)
    for (const { node } of editor.graph.flattenTree(id)) changed = uses.update(node.id) || changed
    if (changed) refresh()
  }

  useEditorEvent('font:resolution-changed', refresh)
  useEditorEvent('graph:replaced', rebuild)
  useEditorEvent('page:changed', rebuild)
  useEditorEvent('node:created', (node) => updateNode(node.id))
  useEditorEvent('node:updated', updateNode)
  useEditorEvent('node:deleted', updateNode)
  useEditorEvent('node:reparented', updateSubtree)

  const status = computed(() => {
    void revision.value
    return pageUses().status()
  })

  async function retry() {
    if (retrying.value) return
    retrying.value = true
    const preparation = editor.preparationController.begin({ kind: 'font-retry' })
    let succeeded = false
    try {
      if (fontManager.localAccessState() === 'prompt') {
        await requestLocalFontAccess().catch(() => [])
      }
      const issues = status.value.issues
      await Promise.all(
        issues.map(async ({ family, style }) => {
          fontManager.resetWebFontFailures(family, style)
          fontResolver.reset(
            `face:${family.trim().toLocaleLowerCase()}:${style.toLocaleLowerCase()}`
          )
          await loadFont(family, style, '', preparation.signal)
        })
      )
      editor.renderer?.invalidateAllPictures()
      computeAllLayouts(editor.graph, editor.state.currentPageId)
      preparation.update({ phase: 'preparing-render' })
      editor.requestRender()
      // A canvas presents the page, whether it draws it with Skia or as DOM.
      if (editor.renderer || appRuntimeConfig.domScene) {
        await editor.preparationController.waitForPresentation(
          preparation.id,
          editor.state.sceneVersion
        )
      }
      rebuild()
      succeeded = true
    } catch (error) {
      if (!preparation.signal.aborted) {
        preparation.fail({
          code: 'font-failed',
          message: error instanceof Error ? error.message : String(error),
          retryable: true
        })
      }
    } finally {
      if (succeeded) preparation.complete()
      retrying.value = false
    }
  }

  function selectAffectedNodes() {
    editor.select(status.value.issues.flatMap((issue) => issue.nodeIds))
  }

  return { status, retrying, retry, selectAffectedNodes }
}
