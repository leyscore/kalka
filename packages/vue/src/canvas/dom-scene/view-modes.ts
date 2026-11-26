import type { EditorState } from '@kalka/core/editor'
import { fontManager } from '@kalka/core/text'
import type { VectorElementRenderer } from '@kalka/dom-css/export'

import { outlineCSS, outlineKey, outlineView } from './outlines'
import { PixelPreview } from './pixel-preview'
import type { DomSceneProjector } from './projector'

/** What in a pane's state changes how its artboards are drawn: outline mode and pixel preview. */
export function viewModeDependencies(state: EditorState): unknown[] {
  return [
    state.outlineMode,
    state.outlineObjectBounds,
    state.pixelPreview,
    state.outlineMode === 'selection' ? [...state.selectedIds].join(',') : ''
  ]
}

/**
 * Figma's view modes on the DOM canvas: outline mode restyles the artboards when it, the
 * selection it shows, or the scene changes, and pixel preview pictures them over their iframes.
 * It follows whichever projector the pane has, starting again for a new one; what it adds
 * lives in that projector's world and artboards, so it goes with them.
 */
export class ViewModes {
  private projector: DomSceneProjector | null = null
  private pixels: PixelPreview | null = null
  /** What the artboards' outline stylesheets were last written for. */
  private outlinedFor = ''

  constructor(
    private readonly getProjector: () => DomSceneProjector | null,
    private readonly vectorElement: VectorElementRenderer | undefined,
    private readonly redraw: () => void
  ) {}

  sync(state: EditorState): void {
    const projector = this.getProjector()
    if (!projector) return
    if (projector !== this.projector) this.follow(projector)
    const pixelRatio = projector.world.ownerDocument.defaultView?.devicePixelRatio ?? 1
    const outlines = outlineView(state, pixelRatio)
    const key = outlineKey(outlines, state.sceneVersion)
    if (key !== this.outlinedFor) {
      this.outlinedFor = key
      const graph = projector.graph
      projector.setOutlines(outlines ? (id) => outlineCSS(graph, id, outlines) : null)
    }
    this.pixels?.sync(state, pixelRatio)
  }

  private follow(projector: DomSceneProjector): void {
    this.clear()
    this.projector = projector
    this.pixels = new PixelPreview(
      projector,
      (id) => ({
        graph: projector.graph,
        nodeId: id,
        fonts: fontManager.browserFacesFor(projector.graph.interVersion),
        vectorElement: this.vectorElement,
        fontFallbacks: fontManager.fallbackFamilies()
      }),
      this.redraw
    )
  }

  /** Lets go of the projector, removing what pixel preview put over its artboards. */
  clear(): void {
    this.pixels?.destroy()
    this.pixels = null
    this.projector = null
    this.outlinedFor = ''
  }
}
