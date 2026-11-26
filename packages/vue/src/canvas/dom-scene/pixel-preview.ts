import type { PixelPreview as PixelPreviewScale } from '@kalka/core/canvas'
import type { EditorState } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'

import { artboardFrameBox, placeBox } from './frame'
import type { DomSceneProjector } from './projector'
import { EmbeddedFonts, rasterizeSnapshot, snapshotImage, type SnapshotSource } from './snapshot'

const DEVICE_PIXELS: Record<PixelPreviewScale, number> = { '1x': 1, '2x': 2 }

/** Whether pixel preview shows anything a crisp page would not: the view enlarges its pixels. */
export function pixelPreviewScale(state: EditorState, pixelRatio: number): number | null {
  if (!state.pixelPreview || state.play) return null
  const scale = DEVICE_PIXELS[state.pixelPreview]
  return state.zoom * pixelRatio > scale ? scale : null
}

interface Picture {
  canvas: HTMLCanvasElement
  /** The scene version and scale it shows, or is being drawn at. */
  key: string
}

/**
 * Figma's View › Pixel preview: each artboard on screen drawn at one or two device pixels per
 * canvas pixel and enlarged without smoothing, so the zoomed-in canvas shows the pixels an
 * export at 1x or 2x has. The artboard is drawn by the same projection its snapshots use, into
 * a canvas over its iframe, which turns transparent while the picture shows.
 */
export class PixelPreview {
  private container: HTMLElement | null = null
  private style: HTMLStyleElement | null = null
  private readonly pictures = new Map<string, Picture>()
  private readonly fonts = new EmbeddedFonts()
  private drawing = false

  constructor(
    private readonly projector: DomSceneProjector,
    private readonly source: (id: string) => SnapshotSource,
    private readonly redraw: () => void
  ) {}

  private get graph(): SceneGraph {
    return this.projector.graph
  }

  /** Draws the pictures the view asks for, one at a time; each drawn asks for the next frame. */
  sync(state: EditorState, pixelRatio: number): void {
    const scale = pixelPreviewScale(state, pixelRatio)
    if (scale === null) {
      this.clear()
      return
    }
    this.start()
    const shown = this.liveArtboards()
    for (const [id, picture] of this.pictures) {
      if (shown.includes(id)) continue
      picture.canvas.remove()
      this.pictures.delete(id)
    }
    const key = `${state.sceneVersion}@${scale}`
    const due = shown.find((id) => this.pictures.get(id)?.key !== key)
    if (due && !this.drawing) void this.draw(due, scale, key)
  }

  /** The artboards that have a live iframe now, which are those on screen or near it. */
  private liveArtboards(): string[] {
    const frames = this.projector.world.querySelectorAll<HTMLIFrameElement>(
      'iframe[data-kalka-artboard]'
    )
    return [...frames].flatMap((frame) => frame.dataset.kalkaArtboard ?? [])
  }

  private async draw(id: string, scale: number, key: string): Promise<void> {
    const node = this.graph.getNode(id)
    const doc = this.projector.world.ownerDocument
    if (!node) return
    this.drawing = true
    try {
      const image = snapshotImage(this.source(id), scale, this.fonts, doc)
      const bitmap = image ? await rasterizeSnapshot(image) : null
      if (!bitmap || !this.container) {
        bitmap?.close()
        return
      }
      const canvas = this.pictures.get(id)?.canvas ?? doc.createElement('canvas')
      canvas.dataset.kalkaPixelPreview = id
      canvas.style.cssText =
        'position:absolute;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges'
      placeBox(canvas, artboardFrameBox(this.graph, node))
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
      bitmap.close()
      if (!canvas.isConnected) this.container.append(canvas)
      this.pictures.set(id, { canvas, key })
      this.hideFrames()
    } finally {
      this.drawing = false
      this.redraw()
    }
  }

  /** The iframes under pictures turn transparent; they keep their layout for measuring. */
  private hideFrames(): void {
    if (!this.style) return
    const selectors = [...this.pictures.keys()].map(
      (id) => `iframe[data-kalka-artboard="${id.replaceAll(/["\\]/g, '\\$&')}"]`
    )
    this.style.textContent =
      selectors.length > 0 ? `${selectors.join(',')}{opacity:0!important}` : ''
  }

  /** Starts showing pictures: their layer over the artboards, holding the rule hiding iframes. */
  start(): void {
    if (this.container) return
    const doc = this.projector.world.ownerDocument
    this.container = doc.createElement('div')
    this.container.dataset.kalkaPixelPreview = ''
    this.container.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'
    this.projector.world.append(this.container)
    // The rule lives in the world, so it goes with the projector's world.
    this.style = doc.createElement('style')
    this.container.append(this.style)
  }

  clear(): void {
    this.container?.remove()
    this.style?.remove()
    this.container = null
    this.style = null
    this.pictures.clear()
  }

  destroy(): void {
    this.clear()
  }
}
