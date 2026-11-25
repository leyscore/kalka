import { useEventListener } from '@vueuse/core'
import { ref, type Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'
import type { Vector } from '@kalka/scene-graph/primitives'

import { cycleSafeTarget, findMoveDropTarget } from '#vue/shared/input/drop-target'

const RASTER_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif'
])
const COMPONENT_MIME = 'application/x-kalka-component'
/** A library asset dragged from the assets panel, not yet in the document. */
export const LIBRARY_ASSET_MIME = 'application/x-kalka-library-asset'

export interface CanvasDropOptions {
  /**
   * Brings a dragged library asset into the document and returns the component to instance, or
   * null; without it library assets do not drop.
   */
  resolveLibraryAsset?: (asset: string) => Promise<string | null>
}

type CanvasPoint = Vector

function dropPoint(e: DragEvent, canvas: HTMLCanvasElement, editor: Editor) {
  const rect = canvas.getBoundingClientRect()
  return editor.screenToCanvas(e.clientX - rect.left, e.clientY - rect.top)
}

function componentDropPlacement(componentId: string, cx: number, cy: number, editor: Editor) {
  const component = editor.graph.getNode(componentId)
  if (component?.type !== 'COMPONENT') return null

  // An instance never lands inside its own component; Figma puts it in the nearest frame that can hold it.
  const dragged = new Set([componentId])
  const target = cycleSafeTarget(findMoveDropTarget(cx, cy, editor, dragged), [componentId], editor)
  const parentId = target?.id ?? editor.state.currentPageId
  const parentOffset =
    parentId === editor.state.currentPageId
      ? { x: 0, y: 0 }
      : editor.graph.getAbsolutePosition(parentId)
  return {
    parentId,
    x: cx - parentOffset.x - component.width / 2,
    y: cy - parentOffset.y - component.height / 2
  }
}

/** Places an instance of the component centred on a canvas point, in the frame there that can hold it. */
function placeComponent(editor: Editor, componentId: string, point: CanvasPoint): string | null {
  const placement = componentDropPlacement(componentId, point.x, point.y, editor)
  if (!placement) return null
  const id = editor.createInstanceFromComponent(
    componentId,
    placement.x,
    placement.y,
    placement.parentId
  )
  editor.requestRender()
  return id
}

/** Brings a dropped library asset into the document, then places an instance of it where it fell. */
export async function dropLibraryAsset(
  editor: Editor,
  asset: string,
  point: CanvasPoint,
  resolve: (asset: string) => Promise<string | null>
): Promise<string | null> {
  const componentId = await resolve(asset)
  return componentId ? placeComponent(editor, componentId, point) : null
}

export function useCanvasDrop(
  canvasRef: Ref<HTMLCanvasElement | null>,
  editor: Editor,
  onActivate?: () => void,
  options: CanvasDropOptions = {}
) {
  const isDraggingOver = ref(false)

  function hasComponentData(e: DragEvent): boolean {
    const types = e.dataTransfer?.types ?? []
    return (
      types.includes(COMPONENT_MIME) ||
      (options.resolveLibraryAsset !== undefined && types.includes(LIBRARY_ASSET_MIME))
    )
  }

  useEventListener(canvasRef, 'dragover', (e: DragEvent) => {
    if (!hasComponentData(e) && !hasFileData(e)) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    isDraggingOver.value = true
  })

  useEventListener(canvasRef, 'dragenter', (e: DragEvent) => {
    if (!hasComponentData(e) && !hasFileData(e)) return
    onActivate?.()
    e.preventDefault()
    isDraggingOver.value = true
  })

  useEventListener(canvasRef, 'dragleave', () => {
    isDraggingOver.value = false
  })

  useEventListener(canvasRef, 'drop', (e: DragEvent) => {
    onActivate?.()
    e.preventDefault()
    isDraggingOver.value = false

    const canvas = canvasRef.value
    if (!canvas) return
    const point = dropPoint(e, canvas, editor)

    const componentId = e.dataTransfer?.getData(COMPONENT_MIME)
    if (componentId) {
      placeComponent(editor, componentId, point)
      return
    }

    const asset = e.dataTransfer?.getData(LIBRARY_ASSET_MIME)
    if (asset && options.resolveLibraryAsset) {
      void dropLibraryAsset(editor, asset, point, options.resolveLibraryAsset).catch(
        (error: unknown) => console.error('Failed to place a library component', error)
      )
      return
    }

    const files = filterCanvasFiles(e.dataTransfer?.files ?? null)
    if (!files.length) return
    void editor.placeFiles(files, point.x, point.y).catch((error: unknown) => {
      console.error('Failed to place dropped files', error)
    })
  })

  return { isDraggingOver }
}

function hasFileData(e: DragEvent): boolean {
  return e.dataTransfer?.types.includes('Files') ?? false
}

function isSVGFile(file: File): boolean {
  return (
    file.type === 'image/svg+xml' || (file.type === '' && file.name.toLowerCase().endsWith('.svg'))
  )
}

export function filterCanvasFiles(files: ArrayLike<File> | Iterable<File> | null): File[] {
  if (!files) return []
  return Array.from(files).filter((file) => RASTER_IMAGE_TYPES.has(file.type) || isSVGFile(file))
}

export function extractImageFilesFromClipboard(e: ClipboardEvent): File[] {
  const files = e.clipboardData?.files
  return files ? Array.from(files).filter((file) => RASTER_IMAGE_TYPES.has(file.type)) : []
}
