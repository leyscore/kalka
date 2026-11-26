import {
  AUTO_LAYOUT_HOVER_GAP_PILL,
  AUTO_LAYOUT_HOVER_MAGENTA,
  AUTO_LAYOUT_HOVER_MAGENTA_FILL,
  SELECTION_COLOR
} from '@kalka/core/constants'
import type { SmartGap } from '@kalka/core/editor'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

import { stripedRect, valuePill } from '#vue/canvas/svg-overlay/layers/auto-layout-hover'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'
import {
  CENTER_HANDLE_RADIUS,
  GAP_HANDLE_LENGTH,
  smartSelectionChrome,
  type SmartSelectionHandles
} from '#vue/shared/input/smart-selection/geometry'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
const MAGENTA = css({ ...AUTO_LAYOUT_HOVER_MAGENTA, a: 1 })
const ACCENT = css(SELECTION_COLOR)
/** Screen pixels between the pill and the gap's centre, as auto layout's gap pill sits. */
const PILL_OFFSET = 14
/** The squares of the Tidy up icon, a 2×2 grid, in the button's screen box. */
const ICON_CELL = 4
const ICON_GAP = 2

function screen(context: OverlayContext, p: Vector): Vector {
  const { panX, panY, zoom } = context.view
  return { x: p.x * zoom + panX, y: p.y * zoom + panY }
}

/** A short bar across the gap at its centre: the handle that drags every gap along its axis. */
function gapHandle(context: OverlayContext, gap: SmartGap, lit: boolean): OverlayShape {
  const c = screen(context, { x: gap.x + gap.width / 2, y: gap.y + gap.height / 2 })
  const half = GAP_HANDLE_LENGTH / 2
  const paint = { stroke: MAGENTA, strokeWidth: lit ? 3 : 2 }
  return gap.axis === 'x'
    ? { type: 'line', x1: c.x, y1: c.y - half, x2: c.x, y2: c.y + half, ...paint }
    : { type: 'line', x1: c.x - half, y1: c.y, x2: c.x + half, y2: c.y, ...paint }
}

function centerHandle(context: OverlayContext, point: Vector, lit: boolean): OverlayShape {
  const c = screen(context, point)
  return {
    type: 'ellipse',
    cx: c.x,
    cy: c.y,
    rx: CENTER_HANDLE_RADIUS,
    ry: CENTER_HANDLE_RADIUS,
    fill: lit ? MAGENTA : WHITE,
    stroke: MAGENTA,
    strokeWidth: 1.5
  }
}

/** Figma's Tidy up button: a small rounded square with a 2×2 grid, out of the bottom right. */
function tidyButton(context: OverlayContext, box: Rect, lit: boolean): OverlayShape[] {
  const { x, y } = screen(context, box)
  const size = box.width * context.view.zoom
  const icon = ICON_CELL * 2 + ICON_GAP
  const left = x + (size - icon) / 2
  const top = y + (size - icon) / 2
  const cells = [0, 1].flatMap((row) =>
    [0, 1].map((column): OverlayShape => ({
      type: 'rect',
      x: left + column * (ICON_CELL + ICON_GAP),
      y: top + row * (ICON_CELL + ICON_GAP),
      width: ICON_CELL,
      height: ICON_CELL,
      rx: 1,
      fill: lit ? WHITE : ACCENT
    }))
  )
  return [
    {
      type: 'rect',
      x,
      y,
      width: size,
      height: size,
      rx: 4,
      fill: lit ? ACCENT : WHITE,
      stroke: ACCENT,
      strokeWidth: 1
    },
    ...cells
  ]
}

type Handle = NonNullable<OverlayContext['overlays']['smartSelectionHandle']>

/** The hatched gaps along the active axis, every handle, every centre, and the dragged value. */
function handleShapes(
  context: OverlayContext,
  handles: SmartSelectionHandles,
  handle: Handle | null | undefined
): OverlayShape[] {
  const activeAxis = handle?.kind === 'gap' ? handle.axis : undefined
  const active = handles.gaps.filter((gap) => gap.axis === activeAxis)
  const shapes: OverlayShape[] = active.flatMap((gap) =>
    stripedRect(
      context,
      [gap.x, gap.y, gap.width, gap.height],
      AUTO_LAYOUT_HOVER_MAGENTA,
      AUTO_LAYOUT_HOVER_MAGENTA_FILL
    )
  )
  for (const gap of handles.gaps) shapes.push(gapHandle(context, gap, gap.axis === activeAxis))
  for (const { id, point } of handles.centers) {
    shapes.push(centerHandle(context, point, handle?.kind === 'center' && handle.nodeId === id))
  }
  const first = active.at(0)
  if (!handle?.dragging || !first) return shapes
  const value = activeAxis === 'x' ? handles.grid.columnGap : handles.grid.rowGap
  const c = screen(context, { x: first.x + first.width / 2, y: first.y + first.height / 2 })
  const label = String(Math.round(value))
  return [
    ...shapes,
    ...valuePill(context, label, c.x + PILL_OFFSET, c.y - PILL_OFFSET, AUTO_LAYOUT_HOVER_GAP_PILL)
  ]
}

/**
 * Figma's smart selection over three or more evenly spaced layers: a handle in each gap, which
 * hatches every gap along its axis when hovered or dragged and shows the spacing while dragged,
 * and a dot at each layer's centre that reorders it. A selection that is not arranged shows the
 * Tidy up button instead. Hidden while layers move, one is reordered, or something is edited.
 */
export function smartSelectionLayer(context: OverlayContext): OverlayShape[] {
  const { overlays, graph, selectedIds, view } = context
  if (!overlays.smartSelection || overlays.transforming) return []
  if (overlays.editingTextId || overlays.nodeEditState || selectedIds.size < 2) return []
  const handle = overlays.smartSelectionHandle
  // The grabbed layer follows the pointer out of the row, so nothing is even until it lands.
  if (handle?.kind === 'center' && handle.dragging) return []
  const chrome = smartSelectionChrome(graph, selectedIds, view.zoom)
  if (chrome.handles) return handleShapes(context, chrome.handles, handle)
  return chrome.tidy ? tidyButton(context, chrome.tidy, handle?.kind === 'tidy') : []
}
