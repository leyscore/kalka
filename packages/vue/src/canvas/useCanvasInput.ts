import { useEventListener } from '@vueuse/core'
import { onScopeDispose, ref, type Ref } from 'vue'

import { RULER_SIZE } from '@open-pencil/core/constants'
import type { Editor } from '@open-pencil/core/editor'
import type { SceneNode } from '@open-pencil/scene-graph'
import { getWorldMatrix } from '@open-pencil/scene-graph/coordinate'
import Matrix from '@open-pencil/scene-graph/matrix'

import {
  handleBendHandleMove,
  handleNodeEditMouseUp,
  updateNodeEditHover
} from '#vue/canvas/node-edit-input/use'
import { handlePenDragMove, updatePenHover } from '#vue/canvas/pen-input/use'
import { createCanvasPointer } from '#vue/canvas/pointer/use'
import { createTextEditInput } from '#vue/canvas/text-edit/input'
import { handleToolMouseDown } from '#vue/canvas/tool-input/use'
import { createCanvasTransformInput } from '#vue/canvas/transform-input/use'
import { resolveAutoLayoutHover } from '#vue/shared/input/auto-layout-hover'
import { createClickCounter } from '#vue/shared/input/click-count'
import { handleDrawMove, handleDrawUp } from '#vue/shared/input/draw'
import { handleMoveMove, handleMoveUp } from '#vue/shared/input/move'
import { handleNodeEditMove } from '#vue/shared/input/node-edit'
import { setupPanZoom } from '#vue/shared/input/pan-zoom'
import { applyResize, commitResizePreview } from '#vue/shared/input/resize'
import { updateHoverCursor } from '#vue/shared/input/select'
import { useSpaceHeld } from '#vue/shared/input/space-key'
import type { DragState } from '#vue/shared/input/types'

/**
 * Wires pointer and mouse interaction to an OpenPencil canvas.
 *
 * This composable coordinates selection, dragging, resizing, rotation,
 * panning, drawing tools, scoped hit testing, and text-edit interaction.
 * It is primarily intended for editor shell components that own the canvas.
 */
export function useCanvasInput(
  canvasRef: Ref<HTMLCanvasElement | null>,
  editor: Editor,
  hitTestSectionTitle: (cx: number, cy: number) => SceneNode | null,
  hitTestComponentLabel: (cx: number, cy: number) => SceneNode | null,
  hitTestFrameTitle: (cx: number, cy: number) => SceneNode | null,
  onCursorMove?: (cx: number, cy: number) => void,
  onActivate?: () => void,
  isEnabled: () => boolean = () => true
) {
  const drag = ref<DragState | null>(null)
  const cursorOverride = ref<string | null>(null)
  const autoLayoutPaddingEdit = ref<{
    nodeId: string
    side: 'top' | 'right' | 'bottom' | 'left'
    value: number
    previous: number
  } | null>(null)
  const selectedIdsBeforeClickSequence = ref<ReadonlySet<string>>(new Set())
  const lastPointer = ref<{ cx: number; cy: number } | null>(null)
  const pointerInside = ref(false)
  let altHeld = false
  let metaHeld = false
  let controlHeld = false
  const spaceHeld = useSpaceHeld()
  const { recordClick, getClickCount } = createClickCounter()

  const { getCoords, canvasToLocal, hitTestInScope, hitFns } = createCanvasPointer(
    canvasRef,
    editor,
    hitTestSectionTitle,
    hitTestComponentLabel,
    hitTestFrameTitle
  )

  function canMeasure() {
    return (
      pointerInside.value &&
      !drag.value &&
      editor.state.activeTool === 'SELECT' &&
      editor.state.selectedIds.size > 0 &&
      !editor.state.editingTextId &&
      !editor.state.nodeEditState &&
      !editor.state.penState
    )
  }

  function refreshMeasurement() {
    const mode = altHeld && canMeasure() ? (metaHeld || controlHeld ? 'deep' : 'shallow') : 'off'
    editor.setMeasurementMode(mode)
    const pointer = lastPointer.value
    if (!pointer || drag.value || editor.state.activeTool !== 'SELECT' || !pointerInside.value)
      return
    cursorOverride.value = updateHoverCursor(
      pointer.cx,
      pointer.cy,
      editor,
      hitFns,
      mode === 'deep'
    )
    editor.setAutoLayoutHover(
      mode === 'off' ? resolveAutoLayoutHover(pointer.cx, pointer.cy, editor) : null
    )
  }

  function deleteSelectedGuide(event: KeyboardEvent): boolean {
    if (event.code !== 'Delete' && event.code !== 'Backspace') return false
    const selected = editor.state.selectedGuide
    if (!selected || editor.state.editingTextId) return false
    if (!editor.removeGuide(selected.ownerId, selected.guideId)) return false
    editor.setSelectedGuide(null)
    event.preventDefault()
    return true
  }

  function updateModifier(code: string, held: boolean) {
    if (!isEnabled()) return
    if (code === 'AltLeft' || code === 'AltRight') altHeld = held
    if (code === 'MetaLeft' || code === 'MetaRight') metaHeld = held
    if (code === 'ControlLeft' || code === 'ControlRight') controlHeld = held
    if (code.startsWith('Alt') || code.startsWith('Meta') || code.startsWith('Control')) {
      refreshMeasurement()
    }
  }

  function resetMeasurementModifiers() {
    altHeld = false
    metaHeld = false
    controlHeld = false
    editor.setMeasurementMode('off')
  }

  function setDrag(d: DragState) {
    editor.setMeasurementMode('off')
    drag.value = d
  }

  const { handleTextEditClick, onDblClick: onTextDblClick } = createTextEditInput({
    editor,
    getCoords,
    hitTestInScope,
    hitTestSectionTitle,
    hitTestComponentLabel,
    getClickCount,
    wasSelectedBeforeClickSequence: (id) => selectedIdsBeforeClickSequence.value.has(id),
    setDrag
  })

  const {
    tryStartRotation,
    handlePanMove,
    handleRotateMove,
    handleTextSelectMove,
    handleMarqueeMove
  } = createCanvasTransformInput(editor, canvasToLocal, setDrag)

  function paddingValue(node: SceneNode, side: 'top' | 'right' | 'bottom' | 'left') {
    if (side === 'top') return node.paddingTop
    if (side === 'right') return node.paddingRight
    if (side === 'bottom') return node.paddingBottom
    return node.paddingLeft
  }

  function paddingKey(side: 'top' | 'right' | 'bottom' | 'left') {
    if (side === 'top') return 'paddingTop' as const
    if (side === 'right') return 'paddingRight' as const
    if (side === 'bottom') return 'paddingBottom' as const
    return 'paddingLeft' as const
  }

  function startAutoLayoutPaddingEdit(e: MouseEvent): boolean {
    const { cx, cy } = getCoords(e)
    const hover = resolveAutoLayoutHover(cx, cy, editor)
    if (hover?.kind !== 'padding' && hover?.kind !== 'padding-value') return false
    if (!hover.side) return false
    const node = editor.graph.getNode(hover.nodeId)
    if (!node) return false
    const value = paddingValue(node, hover.side)
    autoLayoutPaddingEdit.value = {
      nodeId: node.id,
      side: hover.side,
      value,
      previous: value
    }
    e.preventDefault()
    e.stopPropagation()
    return true
  }

  function updateAutoLayoutPaddingEdit(value: number) {
    const edit = autoLayoutPaddingEdit.value
    if (!edit || !Number.isFinite(value)) return
    const next = Math.max(0, value)
    autoLayoutPaddingEdit.value = { ...edit, value: next }
    editor.updateNode(edit.nodeId, { [paddingKey(edit.side)]: next })
  }

  function commitAutoLayoutPaddingEdit(value: number) {
    const edit = autoLayoutPaddingEdit.value
    if (!edit || !Number.isFinite(value)) {
      autoLayoutPaddingEdit.value = null
      return
    }
    const next = Math.max(0, value)
    editor.updateNode(edit.nodeId, { [paddingKey(edit.side)]: edit.previous })
    editor.updateNodeWithUndo(edit.nodeId, { [paddingKey(edit.side)]: next }, 'Update padding')
    autoLayoutPaddingEdit.value = null
  }

  function cancelAutoLayoutPaddingEdit() {
    const edit = autoLayoutPaddingEdit.value
    if (edit) editor.updateNode(edit.nodeId, { [paddingKey(edit.side)]: edit.previous })
    autoLayoutPaddingEdit.value = null
  }

  function guideOwner(cx: number, cy: number): { id: string; position: number } {
    let node = editor.graph.hitTestDeep(cx, cy, editor.state.currentPageId)
    while (node) {
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        return { id: node.id, position: 0 }
      }
      node = node.parentId ? (editor.graph.getNode(node.parentId) ?? null) : null
    }
    return { id: editor.state.currentPageId, position: 0 }
  }

  function guideHitTest(sx: number, sy: number) {
    const tolerance = 5
    const page = editor.graph.getNode(editor.state.currentPageId)
    if (!page) return null
    const hits: Array<{
      ownerId: string
      guideId: string
      axis: 'x' | 'y'
      position: number
      distance: number
    }> = []

    const visit = (owner: SceneNode) => {
      const matrix = getWorldMatrix(owner, editor.graph)
      for (const guide of owner.guides) {
        const start = Matrix.mapPoint(
          matrix,
          guide.axis === 'x' ? { x: guide.position, y: 0 } : { x: 0, y: guide.position }
        )
        const end = Matrix.mapPoint(
          matrix,
          guide.axis === 'x'
            ? { x: guide.position, y: owner.height }
            : { x: owner.width, y: guide.position }
        )
        const x1 =
          owner.type === 'CANVAS' && guide.axis === 'y'
            ? 0
            : start.x * editor.state.zoom + editor.state.panX
        const y1 =
          owner.type === 'CANVAS' && guide.axis === 'x'
            ? 0
            : start.y * editor.state.zoom + editor.state.panY
        const x2 =
          owner.type === 'CANVAS' && guide.axis === 'y'
            ? (canvasRef.value?.width ?? sx)
            : end.x * editor.state.zoom + editor.state.panX
        const y2 =
          owner.type === 'CANVAS' && guide.axis === 'x'
            ? (canvasRef.value?.height ?? sy)
            : end.y * editor.state.zoom + editor.state.panY
        const dx = x2 - x1
        const dy = y2 - y1
        const lengthSquared = dx * dx + dy * dy
        const t =
          lengthSquared === 0
            ? 0
            : Math.max(0, Math.min(1, ((sx - x1) * dx + (sy - y1) * dy) / lengthSquared))
        const distance = Math.hypot(sx - (x1 + t * dx), sy - (y1 + t * dy))
        if (distance <= tolerance) {
          hits.push({
            ownerId: owner.id,
            guideId: guide.id,
            axis: guide.axis,
            position: guide.position,
            distance
          })
        }
      }
      for (const childId of owner.childIds) {
        const child = editor.graph.getNode(childId)
        if (child) visit(child)
      }
    }
    visit(page)
    return hits.sort((a, b) => a.distance - b.distance)[0] ?? null
  }

  function guideCursor(axis: 'x' | 'y') {
    return axis === 'x' ? 'ew-resize' : 'ns-resize'
  }

  function rulerGuideAxis(sx: number, sy: number): 'x' | 'y' | null {
    if (sy < RULER_SIZE) return 'y'
    if (sx < RULER_SIZE) return 'x'
    return null
  }

  function updateGuideHoverCursor(sx: number, sy: number, cx: number, cy: number) {
    const guideHit = guideHitTest(sx, sy)
    editor.setHoveredGuide(
      guideHit ? { ownerId: guideHit.ownerId, guideId: guideHit.guideId } : null
    )
    if (guideHit) return guideCursor(guideHit.axis)
    const rulerAxis = rulerGuideAxis(sx, sy)
    if (rulerAxis) return guideCursor(rulerAxis)
    return updateHoverCursor(cx, cy, editor, hitFns, editor.state.measurementMode === 'deep')
  }

  function startExistingGuideDrag(sx: number, sy: number): boolean {
    const hit = guideHitTest(sx, sy)
    if (!hit) return false
    editor.setSelectedGuide({ ownerId: hit.ownerId, guideId: hit.guideId })
    editor.setHoveredGuide(null)
    cursorOverride.value = guideCursor(hit.axis)
    setDrag({
      type: 'guide',
      axis: hit.axis,
      ownerId: hit.ownerId,
      position: hit.position,
      startScreenX: sx,
      startScreenY: sy,
      currentScreenX: sx,
      currentScreenY: sy,
      dragStarted: false,
      guideId: hit.guideId,
      originalOwnerId: hit.ownerId,
      originalPosition: hit.position
    })
    return true
  }

  function startGuideDrag(sx: number, sy: number, cx: number, cy: number): boolean {
    if (!('showRulers' in editor.state) || editor.state.showRulers !== true) return false
    if (sx < RULER_SIZE && sy < RULER_SIZE) return false
    let axis: 'x' | 'y' | null = null
    if (sy < RULER_SIZE) axis = 'y'
    else if (sx < RULER_SIZE) axis = 'x'
    if (!axis) return false
    const target = guideOwner(cx, cy)
    const owner = editor.graph.getNode(target.id)
    const local = owner && owner.type !== 'CANVAS' ? canvasToLocal(cx, cy, owner.id) : null
    const position = axis === 'x' ? (local?.lx ?? cx) : (local?.ly ?? cy)
    setDrag({
      type: 'guide',
      axis,
      ownerId: target.id,
      position,
      startScreenX: sx,
      startScreenY: sy,
      currentScreenX: sx,
      currentScreenY: sy,
      dragStarted: false
    })
    return true
  }

  function onDblClick(e: MouseEvent) {
    if (startAutoLayoutPaddingEdit(e)) return
    onTextDblClick(e)
  }

  function onMouseDown(e: MouseEvent) {
    onActivate?.()
    if (!isEnabled()) return
    editor.setMeasurementMode('off')
    const paddingEdit = autoLayoutPaddingEdit.value
    if (paddingEdit) {
      commitAutoLayoutPaddingEdit(paddingEdit.value)
    }
    if (!editor.state.editingTextId) canvasRef.value?.focus()
    editor.setHoveredNode(null)
    const { sx, sy, cx, cy } = getCoords(e)
    if (e.button === 0 && startExistingGuideDrag(sx, sy)) {
      e.preventDefault()
      return
    }
    if (e.button === 0 && startGuideDrag(sx, sy, cx, cy)) {
      e.preventDefault()
      return
    }
    editor.setSelectedGuide(null)

    const selectedIdsBeforeMouseDown = new Set(editor.state.selectedIds)
    const clickCount = recordClick(sx, sy)
    if (clickCount === 1) selectedIdsBeforeClickSequence.value = selectedIdsBeforeMouseDown
    handleToolMouseDown({
      event: e,
      cx,
      cy,
      sx,
      sy,
      editor,
      hitFns,
      cursorOverride,
      setDrag,
      tryStartRotation,
      handleTextEditClick
    })
  }

  // Dispatching the full drag union is intentionally centralized here.
  // eslint-disable-next-line complexity
  function onMouseMove(e: MouseEvent) {
    if (!isEnabled()) return
    pointerInside.value = true
    const coords = getCoords(e)
    lastPointer.value = { cx: coords.cx, cy: coords.cy }
    if (onCursorMove) {
      onCursorMove(coords.cx, coords.cy)
    }

    if (!drag.value) {
      const { cx, cy } = coords
      updatePenHover(cx, cy, editor)
    }

    if (!drag.value) {
      const { cx, cy } = coords
      updateNodeEditHover(editor, cx, cy)
    }

    if (!drag.value && editor.state.activeTool === 'SELECT') {
      const { sx, sy, cx, cy } = coords
      cursorOverride.value = updateGuideHoverCursor(sx, sy, cx, cy)
      editor.setAutoLayoutHover(
        editor.state.measurementMode === 'off' ? resolveAutoLayoutHover(cx, cy, editor) : null
      )
    }

    if (!drag.value) return
    const d = drag.value

    if (d.type === 'pan') {
      handlePanMove(d, e)
      return
    }

    const { sx, sy, cx, cy } = getCoords(e)

    if (d.type === 'guide') {
      d.currentScreenX = sx
      d.currentScreenY = sy
      if (!d.dragStarted && Math.hypot(sx - d.startScreenX, sy - d.startScreenY) < 3) return
      d.dragStarted = true
      cursorOverride.value = guideCursor(d.axis)
      const target = guideOwner(cx, cy)
      const owner = editor.graph.getNode(target.id)
      const local = owner && owner.type !== 'CANVAS' ? canvasToLocal(cx, cy, owner.id) : null
      d.ownerId = target.id
      d.position = d.axis === 'x' ? (local?.lx ?? cx) : (local?.ly ?? cy)
      editor.setGuidePreview({
        ownerId: d.ownerId,
        axis: d.axis,
        position: d.position,
        source:
          d.guideId && d.originalOwnerId
            ? { ownerId: d.originalOwnerId, guideId: d.guideId }
            : undefined
      })
      return
    }

    if (d.type === 'rotate') {
      handleRotateMove(d, cx, cy, e.shiftKey)
      return
    }
    if (d.type === 'move') {
      handleMoveMove(d, cx, cy, sx, sy, editor, e.ctrlKey)
      return
    }
    if (d.type === 'text-select') {
      handleTextSelectMove(cx, cy)
      return
    }
    if (d.type === 'resize') {
      applyResize(d, cx, cy, e.shiftKey, editor, e.ctrlKey)
      return
    }

    if (d.type === 'pen-drag') {
      handlePenDragMove(d, cx, cy, spaceHeld.value, e, editor)
      return
    }

    if (d.type === 'edit-node' || d.type === 'edit-handle') {
      handleNodeEditMove(d, cx, cy, editor, e.altKey, e.metaKey || e.ctrlKey, e.shiftKey, e.ctrlKey)
      return
    }

    if (d.type === 'bend-handle') {
      handleBendHandleMove(d, cx, cy, e, editor)
      return
    }

    if (d.type === 'draw') {
      handleDrawMove(d, cx, cy, e.shiftKey, editor)
      return
    }

    handleMarqueeMove(d, cx, cy)
  }

  function finishGuideDrag(d: Extract<DragState, { type: 'guide' }>) {
    if (d.dragStarted) {
      if (d.currentScreenX < RULER_SIZE || d.currentScreenY < RULER_SIZE) {
        if (d.guideId && d.originalOwnerId) editor.removeGuide(d.originalOwnerId, d.guideId)
      } else if (d.guideId && d.originalOwnerId) {
        if (d.ownerId === d.originalOwnerId) editor.moveGuide(d.ownerId, d.guideId, d.position)
        else editor.transferGuide(d.originalOwnerId, d.ownerId, d.guideId, d.position)
        editor.setSelectedGuide({ ownerId: d.ownerId, guideId: d.guideId })
      } else {
        const guideId = editor.addGuide(d.ownerId, d.axis, d.position)
        if (guideId) editor.setSelectedGuide({ ownerId: d.ownerId, guideId })
      }
    }
    editor.setGuidePreview(null)
    editor.setHoveredGuide(null)
  }

  function onMouseUp() {
    if (!isEnabled()) return
    if (!drag.value) return
    const d = drag.value

    if (handleNodeEditMouseUp(drag, editor)) return

    if (d.type === 'guide') {
      finishGuideDrag(d)
    } else if (d.type === 'move') handleMoveUp(d, editor)
    else if (d.type === 'text-select') {
      drag.value = null
      return
    } else if (d.type === 'resize') commitResizePreview(d, editor)
    else if (d.type === 'pen-drag') {
      const penState = editor.state.penState as
        | (typeof editor.state.penState & {
            pendingClose?: boolean
          })
        | null
      if (penState?.pendingClose) {
        editor.penCommit(true)
      }
      drag.value = null
      return
    } else if (d.type === 'rotate') {
      const preview = editor.state.rotationPreview
      if (preview) {
        editor.updateNode(d.nodeId, { rotation: preview.angle })
        editor.commitRotation(d.nodeId, d.origRotation)
      }
      editor.setRotationPreview(null)
    } else if (d.type === 'draw') handleDrawUp(d, editor)
    else if (d.type === 'marquee') editor.setMarquee(null)

    drag.value = null
    cursorOverride.value = null
    refreshMeasurement()
  }

  function clearTransientInteractionFeedback() {
    editor.setSnapGuides([])
    editor.setLayoutInsertIndicator(null)
    editor.setDropTarget(null)
    editor.setGuidePreview(null)
    editor.setHoveredGuide(null)
  }

  function cancelPointerInteraction() {
    drag.value = null
    cursorOverride.value = null
    clearTransientInteractionFeedback()
  }

  useEventListener(canvasRef, 'dblclick', onDblClick)
  useEventListener(canvasRef, 'mousedown', onMouseDown)
  useEventListener(canvasRef, 'mousemove', onMouseMove)
  useEventListener(canvasRef, 'mouseup', onMouseUp)
  useEventListener(window, 'keydown', (event) => {
    if (!deleteSelectedGuide(event)) updateModifier(event.code, true)
  })
  useEventListener(window, 'keyup', (event) => updateModifier(event.code, false))
  useEventListener(window, 'blur', () => {
    resetMeasurementModifiers()
    cancelPointerInteraction()
  })
  useEventListener(canvasRef, 'mouseleave', () => {
    pointerInside.value = false
    if (!isEnabled()) return
    editor.setMeasurementMode('off')
    if (!drag.value) {
      editor.setHoveredNode(null)
      editor.setHoveredGuide(null)
    }
  })
  useEventListener(
    window,
    'mouseup',
    () => {
      if (drag.value) onMouseUp()
    },
    { capture: true }
  )

  const stopToolListener = editor.onEditorEvent('tool:changed', () => {
    if (!isEnabled()) return
    editor.setMeasurementMode('off')
    cancelPointerInteraction()
  })
  onScopeDispose(stopToolListener)

  setupPanZoom(canvasRef, editor, drag, onMouseDown, onMouseMove, onMouseUp)
  return {
    drag,
    cursorOverride,
    autoLayoutPaddingEdit,
    updateAutoLayoutPaddingEdit,
    commitAutoLayoutPaddingEdit,
    cancelAutoLayoutPaddingEdit,
    cleanupInteractions() {
      cancelAutoLayoutPaddingEdit()
      drag.value = null
      cursorOverride.value = null
      pointerInside.value = false
      clearTransientInteractionFeedback()
      resetMeasurementModifiers()
    }
  }
}
