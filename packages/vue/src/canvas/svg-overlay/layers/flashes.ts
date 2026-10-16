import {
  FLASH_ATTACK_MS,
  FLASH_COLOR,
  FLASH_HOLD_MS,
  FLASH_OVERSHOOT,
  FLASH_PADDING,
  FLASH_RADIUS,
  FLASH_RELEASE_MS,
  FLASH_STROKE_WIDTH
} from '@kalka/core/constants'
import type { SceneGraph } from '@kalka/scene-graph'
import Matrix from '@kalka/scene-graph/matrix'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** A layer to flash, and when the flash started, on the `performance.now()` clock. */
export interface Flash {
  nodeId: string
  startTime: number
}

export const FLASH_DURATION_MS = FLASH_ATTACK_MS + FLASH_HOLD_MS + FLASH_RELEASE_MS

/** Flashes still running at `now` on layers that still exist; the rest are done. */
export function liveFlashes(graph: SceneGraph, flashes: readonly Flash[], now: number): Flash[] {
  return flashes.filter(
    (flash) =>
      now - flash.startTime <= FLASH_DURATION_MS && graph.getNode(flash.nodeId) !== undefined
  )
}

/** Fade in while the ring closes in from an overshoot, hold, then fade out. */
function envelope(elapsed: number): { opacity: number; extraPad: number } {
  if (elapsed < FLASH_ATTACK_MS) {
    const t = elapsed / FLASH_ATTACK_MS
    const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    return { opacity: ease, extraPad: (1 - ease) * FLASH_OVERSHOOT }
  }
  if (elapsed < FLASH_ATTACK_MS + FLASH_HOLD_MS) return { opacity: 1, extraPad: 0 }
  const t = (elapsed - FLASH_ATTACK_MS - FLASH_HOLD_MS) / FLASH_RELEASE_MS
  return { opacity: 1 - t * t, extraPad: 0 }
}

/**
 * A rounded ring around a layer, a little outside its box and turned with it, as the Skia
 * highlight rectangle draws it. `extraPad` widens it, for a ring that closes in.
 */
export function highlightRing(
  context: OverlayContext,
  nodeId: string,
  stroke: string,
  extraPad = 0
): OverlayShape[] {
  const { graph } = context
  const { panX, panY, zoom } = context.view
  const node = graph.getNode(nodeId)
  if (!node) return []
  const abs = graph.getAbsolutePosition(nodeId)
  const cx = (abs.x + node.width / 2) * zoom + panX
  const cy = (abs.y + node.height / 2) * zoom + panY
  const hw = (node.width / 2) * zoom
  const hh = (node.height / 2) * zoom
  const pad = FLASH_PADDING + extraPad
  const ring: OverlayShape = {
    type: 'rect',
    x: cx - hw - pad,
    y: cy - hh - pad,
    width: (hw + pad) * 2,
    height: (hh + pad) * 2,
    rx: FLASH_RADIUS,
    stroke,
    strokeWidth: FLASH_STROKE_WIDTH
  }
  if (node.rotation === 0) return [ring]
  return [
    {
      type: 'group',
      matrix: Matrix.rotated((node.rotation * Math.PI) / 180, cx, cy),
      children: [ring]
    }
  ]
}

/**
 * Rings drawn around layers to point them out, such as those an agent just made. Pure in `now`:
 * the caller owns the flash list, drops finished ones (see `liveFlashes`) and asks for frames
 * while any run.
 */
export function flashesLayer(
  context: OverlayContext,
  flashes: readonly Flash[],
  now: number
): OverlayShape[] {
  const { graph } = context
  const shapes: OverlayShape[] = []
  // Backwards, as the Skia loop walks it, so older flashes draw over newer ones.
  for (let i = flashes.length - 1; i >= 0; i--) {
    const flash = flashes[i]
    const elapsed = now - flash.startTime
    if (elapsed > FLASH_DURATION_MS) continue
    const node = graph.getNode(flash.nodeId)
    if (!node) continue
    const { opacity, extraPad } = envelope(elapsed)

    shapes.push(...highlightRing(context, flash.nodeId, css(FLASH_COLOR, opacity), extraPad))
  }
  return shapes
}
