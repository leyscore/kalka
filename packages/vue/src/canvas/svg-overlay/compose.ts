import type { OverlayLayerId } from '@open-pencil/core/canvas'

import {
  dropTargetLayer,
  enteredContainerLayer,
  hoverLayer,
  insertIndicatorLayer,
  marqueeLayer,
  selectionLayer,
  snapGuidesLayer,
  type OverlayContext
} from './layers/selection'
import type { OverlayShape } from './shapes'

/** The overlays this backend draws; the Skia overlay canvas leaves them out. */
export const SVG_OVERLAY_LAYERS: ReadonlySet<OverlayLayerId> = new Set([
  'hover',
  'selection',
  'enteredContainer',
  'dropTarget',
  'marquee',
  'snapGuides',
  'layoutInsertIndicator'
])

function measuring(context: OverlayContext): boolean {
  const { overlays } = context
  return (
    overlays.measurementMode !== undefined &&
    overlays.measurementMode !== 'off' &&
    !overlays.editingTextId &&
    !overlays.nodeEditState &&
    !overlays.penState
  )
}

/** Every SVG overlay for a frame, bottom to top, in the order the Skia pass draws them. */
export function composeOverlay(context: OverlayContext): OverlayShape[] {
  if (context.overlays.playing) return []
  const hovered =
    measuring(context) || context.overlays.hoveredNodeId === context.overlays.nodeEditState?.nodeId
      ? null
      : context.overlays.hoveredNodeId
  return [
    ...hoverLayer(context, hovered),
    ...enteredContainerLayer(context),
    ...dropTargetLayer(context),
    ...selectionLayer(context),
    ...snapGuidesLayer(context),
    ...marqueeLayer(context),
    ...insertIndicatorLayer(context)
  ]
}
