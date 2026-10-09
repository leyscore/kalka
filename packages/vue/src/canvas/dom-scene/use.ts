import { onScopeDispose, watch, type Ref } from 'vue'

import type { Editor, EditorState } from '@open-pencil/core/editor'
import { installLayoutEngine } from '@open-pencil/core/layout'
import { fontManager } from '@open-pencil/core/text'
import type { VectorElementRenderer } from '@open-pencil/dom-css/export'

import { DomLayoutEngine } from './layout'
import { DomSceneProjector } from './projector'

export interface UseDomSceneOptions {
  /** The view drawn by this pane. Defaults to `editor.state`. */
  getRenderState?: () => EditorState
  vectorElement?: VectorElementRenderer
  /**
   * Called once the DOM shows a scene version, as the canvas reports what it presented, so
   * page preparation and loaders know the page is on screen.
   */
  onPresented?: (versions: { renderVersion: number; sceneVersion: number }) => void
  /** Called after each frame that changed the DOM, with the artboards it touched. */
  onPatched?: (projector: DomSceneProjector, artboardIds: ReadonlySet<string>) => void
}

/**
 * Draws the editor's current page as real DOM inside `host`: the browser lays out and paints
 * every layer. The overlays canvas stays above it for selection, handles and guides.
 */
export function useDomScene(
  host: Ref<HTMLElement | null>,
  editor: Editor,
  options: UseDomSceneOptions = {}
) {
  const view = () => options.getRenderState?.() ?? editor.state
  let projector: DomSceneProjector | null = null
  let engine: DomLayoutEngine | null = null
  const reflowed = new Set<string>()
  let frame = 0
  let lastTransform = ''
  let presentedScene = -1
  const stops: (() => void)[] = []

  function tick() {
    frame = requestAnimationFrame(tick)
    if (!projector) return
    const { panX, panY, zoom } = view()
    const transform = `translate(${panX}px, ${panY}px) scale(${zoom})`
    if (transform !== lastTransform) {
      projector.world.style.transform = transform
      lastTransform = transform
    }
    if (projector.needsFlush) projector.flush()
    // Whatever changed the DOM this frame is read back before the next one draws.
    if (reflowed.size > 0) {
      engine?.refresh(reflowed)
      reflowed.clear()
      if (projector.needsFlush) projector.flush()
    }
    const state = view()
    if (state.sceneVersion !== presentedScene) {
      presentedScene = state.sceneVersion
      options.onPresented?.({
        renderVersion: state.renderVersion,
        sceneVersion: state.sceneVersion
      })
    }
  }

  function start(element: HTMLElement) {
    projector = new DomSceneProjector(element, {
      getGraph: () => editor.graph,
      getPageId: () => view().currentPageId,
      vectorElement: options.vectorElement,
      fonts: () => fontManager.loadedBrowserFaces(),
      onPatched: (ids) => {
        for (const id of ids) reflowed.add(id)
        if (projector) options.onPatched?.(projector, ids)
      },
      onReflow: (id) => reflowed.add(id)
    })
    const p = projector
    engine = new DomLayoutEngine(p, () => editor.graph)
    stops.push(
      editor.onEditorEvent('node:updated', (id, changes) => p.nodeUpdated(id, changes)),
      editor.onEditorEvent('node:previewUpdated', (id, changes) => p.nodeUpdated(id, changes)),
      editor.onEditorEvent('node:created', (node) => p.structureChanged(node.parentId)),
      editor.onEditorEvent('node:deleted', (_id, parentId) => p.structureChanged(parentId)),
      editor.onEditorEvent('node:reparented', (id, oldParentId, newParentId) =>
        p.structureChanged(oldParentId, newParentId, id)
      ),
      editor.onEditorEvent('node:reordered', (_id, parentId, _index, previousParentId) =>
        p.structureChanged(parentId, previousParentId)
      ),
      editor.onEditorEvent('graph:replaced', () => p.reset()),
      fontManager.onBrowserFace((face) => p.addFont(face)),
      installLayoutEngine(engine)
    )
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frame)
    for (const unsubscribe of stops.splice(0)) unsubscribe()
    projector?.destroy()
    projector = null
    engine = null
    reflowed.clear()
    lastTransform = ''
    presentedScene = -1
  }

  watch(
    host,
    (element) => {
      stop()
      if (element) start(element)
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(stop)

  return {
    get projector() {
      return projector
    }
  }
}
