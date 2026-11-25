import type { Size } from '@kalka/scene-graph/primitives'

/** Room between a pin and the thread card beside it. */
const PIN_GAP = 36
/** How far above the pin's point the card starts, so it reads beside the pin's head. */
const CARD_RISE = 28
/** The least room kept between the card and the edges of the canvas. */
const EDGE_MARGIN = 8

export type CardSize = Size

/**
 * Where an open thread or a draft sits beside its pin, in the canvas's pixels: to the pin's right,
 * or to its left when the right side has no room, and moved in from any edge so the field and its
 * send button stay in view, as Figma keeps its comment composer.
 */
export function commentCardPlacement(
  pin: { left: number; top: number },
  card: CardSize,
  canvas: CardSize
): { left: number; top: number } {
  const right = pin.left + PIN_GAP
  const fitsRight = right + card.width + EDGE_MARGIN <= canvas.width
  const left = fitsRight ? right : pin.left - PIN_GAP - card.width
  return {
    left: clamp(left, EDGE_MARGIN, canvas.width - card.width - EDGE_MARGIN),
    top: clamp(pin.top - CARD_RISE, EDGE_MARGIN, canvas.height - card.height - EDGE_MARGIN)
  }
}

/** Keeps a value between two bounds, preferring the lower one when the canvas is too small. */
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(value, high))
}
