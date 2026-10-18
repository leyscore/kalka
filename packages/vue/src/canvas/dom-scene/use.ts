import { onScopeDispose, watch, type Ref } from 'vue'

import type { Editor, EditorState } from '@kalka/core/editor'
import { installLayoutEngine } from '@kalka/core/layout'
import { browserFaceFor, fontManager } from '@kalka/core/text'
import type { VectorElementRenderer } from '@kalka/dom-css/export'

import { GhostLayer, type DomScenePreview } from './ghosts'
import { DomLayoutEngine } from './layout'
import { LiveEdits } from './live'
import { DomSceneProjector } from './projector'
import type { RevealStep } from './reveal/plan'
import { RevealPlayer } from './reveal/play'
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
  /**
   * Layers not in the document yet, drawn over it, such as JSX an agent is still writing. Read
   * every frame; return the same array while nothing changed.
   */
  previews?: () => readonly DomScenePreview[]
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
  let ghosts: GhostLayer | null = null
  let reveals: RevealPlayer | null = null
  const reflowed = new Set<string>()
  let frame = 0
  let lastTransform = ''
  let presentedScene = -1
  /** The page agent work was last drawn on; held layers show once the view leaves it. */
  let workPage: string | null = null

  const live = new LiveEdits(editor, view)
  const stops: (() => void)[] = []

  /** What agents are still writing, and the replay of what they just wrote. */
  function drawAgentWork(pageId: string) {
    ghosts?.sync(options.previews?.() ?? [], pageId)
    if (workPage !== pageId) {
      reveals?.release()
      workPage = pageId
    }
    if (reveals?.busy) reveals.tick()
  }

  function tick() {
    frame = requestAnimationFrame(tick)
    if (!projector) return
    const { panX, panY, zoom } = view()
    const transform = `translate(${panX}px, ${panY}px) scale(${zoom})`
    if (transform !== lastTransform) {
      projector.world.style.transform = transform
      lastTransform = transform
    }
    live.sync(projector)
    if (projector.needsFlush) projector.flush()
    // Whatever changed the DOM this frame is read back before the next one draws.
    if (reflowed.size > 0) {
      engine?.refresh(reflowed)
      reflowed.clear()
      if (projector.needsFlush) projector.flush()
    }
    const state = view()
    drawAgentWork(state.currentPageId)
    shaders?.sync(state.sceneVersion)
    if (state.sceneVersion !== presentedScene) void tokens?.sync()
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
      fonts: () => fontManager.browserFacesFor(editor.graph.interVersion),
      onPatched: (ids) => {
        for (const id of ids) reflowed.add(id)
        if (projector) options.onPatched?.(projector, ids)
      },
      onReflow: (id) => reflowed.add(id),
      livePatches: () => live.patches(),
      tokens: () => canvasTokens.references,
      fontFallbacks: () => fontManager.fallbackFamilies()
    })
    const p = projector
    const canvasTokens = new CanvasTokens(
      () => editor.graph,
      (css) => p.setTokensCSS(css),
      // Every layer naming a renamed variable is rebuilt with its new name.
      () => p.reset()
    )
    tokens = canvasTokens
    void canvasTokens.sync()
    engine = new DomLayoutEngine(p, () => editor.graph)
    shaders = new ShaderLayers(p, () => editor.graph)
    ghosts = new GhostLayer(p, {
      vectorElement: options.vectorElement,
      fonts: () => fontManager.browserFacesFor(editor.graph.interVersion),
      fontFallbacks: () => fontManager.fallbackFamilies()
    })
    reveals = new RevealPlayer(p)
    const ghostLayer = ghosts
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
        void canvasTokens.sync()
        p.reset()
      }),
      // Renaming a variable or changing a mode's condition changes no layer.
      editor.onEditorEvent('history:changed', () => void canvasTokens.sync()),
      fontManager.onBrowserFace((loaded) => {
        // Artboards name the document's Inter `Inter` and get only that one.
        const face = browserFaceFor(loaded, editor.graph.interVersion)
        if (!face) return
        p.addFont(face)
        ghostLayer.addFont(face)
      }),
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
    reveals?.destroy()
    reveals = null
    ghosts?.destroy()
    ghosts = null
    tokens = null
    projector?.destroy()
    projector = null
    engine = null
    reflowed.clear()
    lastTransform = ''
    presentedScene = -1
    workPage = null
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
    },
    /**
     * Whether the DOM shows the page as the graph has it: every artboard's document loaded with
     * its fonts, no edit left to patch, no layout left to read back, and no reveal playing.
     */
    get settled() {
      if (!projector || projector.needsFlush || reflowed.size > 0 || reveals?.busy) return false
      for (const id of projector.artboardIds) {
        const doc = projector.artboardOf(id)?.doc
        if (doc?.readyState !== 'complete' || doc.fonts.status === 'loading') return false
        if (projector.isStale(id)) return false
      }
      return true
    },
    /** Redraws the page's boolean operations, once path operations can combine their operands. */
    redrawBooleanOperations() {
      if (!projector) return
      for (const node of editor.graph.getAllNodes()) {
        if (node.type === 'BOOLEAN_OPERATION') projector.nodeUpdated(node.id, {})
      }
    },
    /** Replays an agent edit on the layers drawn now; the steps come from `planReveal`. */
    reveal(steps: readonly RevealStep[]) {
      reveals?.play(steps)
    },
    /** Keeps an agent's new layers hidden until their reveal plays, at most `HOLD_TIMEOUT_MS`. */
    hold(ids: readonly string[]) {
      reveals?.hold(ids)
    },
    /** Shows held layers whose reveal will not play, such as those past the reveal's limit. */
    release(ids: readonly string[]) {
      reveals?.release(ids)
    }
  }
}
