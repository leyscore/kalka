import type { SceneNode } from './types'

/** Whether an auto layout frame draws its first child on top, as Figma's "First on top". */
export function stacksFirstOnTop(parent: SceneNode): boolean {
  return parent.itemReverseZIndex && parent.layoutMode !== 'NONE'
}

/**
 * A layer's children from the one drawn on top down: the last is on top, unless an auto layout
 * frame stacks its first child on top (Figma's canvas stacking, `itemReverseZIndex`).
 */
export function childIdsTopFirst(parent: SceneNode): string[] {
  return stacksFirstOnTop(parent) ? [...parent.childIds] : parent.childIds.toReversed()
}
