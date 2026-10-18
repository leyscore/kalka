import { onScopeDispose, watch, type Ref } from 'vue'

import type { Editor, EditorState } from '@kalka/core/editor'
import { installLayoutEngine } from '@kalka/core/layout'
import { fontManager } from '@kalka/core/text'
import type { VectorElementRenderer } from '@kalka/dom-css/export'

import { createFrameRequest } from '#vue/canvas/frame-request'

import { bindSceneEvents, redrawAfter } from './events'
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

  /**
   * Draws one frame, requested by whatever changed: the view, the graph, a gesture, a font, a
   * preview. True while work is left for the next frame, such as a reveal still playing.
   */
  function tick(): boolean {
    if (!projector) return false
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
    return projector.needsFlush || reflowed.size > 0 || (reveals?.busy ?? false)
  }

  const frames = createFrameRequest(tick)
  const redraw = () => frames.request()

  // What the view shows: its pan, zoom and page, the graph's versions, a gesture's preview, and
  // what agents are still writing. Each change draws one frame; nothing does while none comes.
  watch(
    () => {
      const state = view()
      return [
        state.panX,
        state.panY,
        state.zoom,
        state.currentPageId,
        state.sceneVersion,
        state.renderVersion,
        state.nodeEditState,
        state.rotationPreview,
        options.previews?.()
      ]
    },
    redraw,
    { flush: 'sync' }
  )

  function start(element: HTMLElement) {
    projector = new DomSceneProjector(element, {
      getGraph: () => editor.graph,
      getPageId: () => view().currentPageId,
      vectorElement: options.vectorElement,
      fonts: () => fontManager.browserFacesFor(editor.graph.interVersion),
      onPatched: (ids) => {
        for (const id of ids) reflowed.add(id)
        if (projector) options.onPatched?.(projector, ids)
        // A held layer drawn outside a frame, as when its artboard's document loads, is hidden
        // at once rather than on the frame this asks for.
        if (reveals?.busy) reveals.tick()
        redraw()
      },
      onReflow: (id) => {
        reflowed.add(id)
        redraw()
      },
      livePatches: () => live.patches(),
      tokens: () => canvasTokens.references,
      fontFallbacks: () => fontManager.fallbackFamilies()
    })
    const p = projector
    const canvasTokens = new CanvasTokens(
      () => editor.graph,
      redrawAfter((css: string) => p.setTokensCSS(css), redraw),
      // Every layer naming a renamed variable is rebuilt with its new name.
      redrawAfter(() => p.reset(), redraw)
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
      ...bindSceneEvents(editor, p, canvasTokens, ghostLayer, redraw),
      installLayoutEngine(engine)
    )
    redraw()
  }

  function stop() {
    frames.cancel()
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
      redraw()
    },
    /** Replays an agent edit on the layers drawn now; the steps come from `planReveal`. */
    reveal(steps: readonly RevealStep[]) {
      reveals?.play(steps)
      redraw()
    },
    /** Keeps an agent's new layers hidden until their reveal plays, at most `HOLD_TIMEOUT_MS`. */
    hold(ids: readonly string[]) {
      reveals?.hold(ids)
      redraw()
    },
    /** Shows held layers whose reveal will not play, such as those past the reveal's limit. */
    release(ids: readonly string[]) {
      reveals?.release(ids)
      redraw()
    }
  }
}
