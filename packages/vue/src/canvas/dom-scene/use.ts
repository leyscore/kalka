import { onScopeDispose, watch, type Ref } from 'vue'

import type { Editor, EditorState } from '@kalka/core/editor'
import { installLayoutEngine } from '@kalka/core/layout'
import { fontManager } from '@kalka/core/text'
import { regenerateFillGeometry } from '@kalka/core/vector'
import type { VectorElementRenderer } from '@kalka/dom-css/export'
import { transformVectorNetwork, type SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'

import { DomLayoutEngine } from './layout'
import { DomSceneProjector } from './projector'
import { ShaderLayers } from './shaders'
import { DomTextEditor } from './text/editor'
import { CanvasTokens } from './tokens'

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
  let shaders: ShaderLayers | null = null
  let tokens: CanvasTokens | null = null
  const reflowed = new Set<string>()
  let frame = 0
  let lastTransform = ''
  let presentedScene = -1
  let editState: EditorState['nodeEditState'] = null
  let editVersion = -1

  /** A path being edited is drawn from its live vertices, mapped back into its own frame. */
  function livePatch(id: string): Partial<SceneNode> | null {
    const edit = view().nodeEditState
    if (edit?.nodeId !== id) return null
    const node = editor.graph.getNode(id)
    const inverse = node ? Matrix.invert(getWorldMatrix(node, editor.graph)) : null
    if (!node || !inverse) return null
    const vectorNetwork = transformVectorNetwork(inverse, {
      vertices: edit.vertices,
      segments: edit.segments,
      regions: edit.regions
    })
    return {
      vectorNetwork,
      fillGeometry: regenerateFillGeometry(vectorNetwork, node.fillGeometry),
      strokeGeometry: []
    }
  }
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
    // Each step of a path edit redraws that path, and leaving the edit restores it. Vertices
    // move in place, so any repaint while editing counts as a step.
    const edit = view().nodeEditState ?? null
    const version = view().renderVersion
    if (edit !== editState || (edit && version !== editVersion)) {
      if (editState && editState !== edit) projector.nodeUpdated(editState.nodeId, {})
      if (edit) projector.nodeUpdated(edit.nodeId, {})
      editState = edit
      editVersion = version
    }
    if (projector.needsFlush) projector.flush()
    // Whatever changed the DOM this frame is read back before the next one draws.
    if (reflowed.size > 0) {
      engine?.refresh(reflowed)
      reflowed.clear()
      if (projector.needsFlush) projector.flush()
    }
    const state = view()
    shaders?.sync(state.sceneVersion)
    if (state.sceneVersion !== presentedScene) tokens?.sync()
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
      onReflow: (id) => reflowed.add(id),
      livePatch,
      tokens: () => canvasTokens.references
    })
    const p = projector
    const canvasTokens = new CanvasTokens(
      () => editor.graph,
      (css) => p.setTokensCSS(css),
      // Every layer naming a renamed variable is rebuilt with its new name.
      () => p.reset()
    )
    tokens = canvasTokens
    canvasTokens.sync()
    engine = new DomLayoutEngine(p, () => editor.graph)
    shaders = new ShaderLayers(p, () => editor.graph)
    // Text is edited in place, in the page, instead of by the canvas text engine.
    editor.setExternalTextEditor(new DomTextEditor(editor, p))
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
      editor.onEditorEvent('graph:replaced', () => {
        canvasTokens.sync()
        p.reset()
      }),
      // Renaming a variable or changing a mode's condition changes no layer.
      editor.onEditorEvent('history:changed', () => canvasTokens.sync()),
      fontManager.onBrowserFace((face) => p.addFont(face)),
      installLayoutEngine(engine)
    )
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frame)
    for (const unsubscribe of stops.splice(0)) unsubscribe()
    if (projector) editor.setExternalTextEditor(null)
    shaders?.destroy()
    shaders = null
    tokens = null
    projector?.destroy()
    projector = null
    engine = null
    reflowed.clear()
    lastTransform = ''
    presentedScene = -1
    editState = null
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
