import {
  findLayerByPath,
  type OverlayPositionType,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

/**
 * Scrolling in a presented frame, as Figma's: frames with an overflow direction scroll their
 * content, fixed layers stay where they are while the frame around them scrolls, and sticky
 * layers scroll until they reach its top edge, then stay. Returns what undoes it.
 */
export function applyScrolling(
  graph: SceneGraph,
  container: HTMLElement,
  screenScrollers: readonly (HTMLElement | null)[]
): () => void {
  const stops: (() => void)[] = []
  const elementOf = new Map<string, HTMLElement>()
  for (const element of container.querySelectorAll<HTMLElement>('[data-layer]')) {
    const node = nodeAt(graph, container, element)
    if (node) elementOf.set(node.id, element)
  }
  const overflow = (direction: SceneNode['overflowDirection']) => ({
    x: direction === 'HORIZONTAL' || direction === 'BOTH' ? 'auto' : 'hidden',
    y: direction === 'VERTICAL' || direction === 'BOTH' ? 'auto' : 'hidden'
  })
  for (const [id, element] of elementOf) {
    const node = graph.getNode(id)
    if (!node || node.overflowDirection === 'NONE') continue
    const { x, y } = overflow(node.overflowDirection)
    element.style.overflowX = x
    element.style.overflowY = y
  }
  for (const [id, element] of elementOf) {
    const node = graph.getNode(id)
    if (!node || node.scrollBehavior === 'SCROLLS') continue
    // The frame that scrolls it: the nearest one with an overflow direction, else the screen.
    const scroller = graph.closest(
      node.parentId ?? id,
      (ancestor) => ancestor.overflowDirection !== 'NONE'
    )
    const frame = scroller ? (elementOf.get(scroller.id) ?? null) : null
    const scrollers: HTMLElement[] = frame
      ? [frame]
      : screenScrollers.filter((scroller): scroller is HTMLElement => scroller !== null)
    const behavior = node.scrollBehavior
    const top = node.y
    const place = () => {
      const left = scrollers.reduce((sum, scroller) => sum + scroller.scrollLeft, 0)
      const down = scrollers.reduce((sum, scroller) => sum + scroller.scrollTop, 0)
      element.style.translate =
        behavior === 'FIXED' ? `${left}px ${down}px` : `0px ${Math.max(0, down - top)}px`
    }
    element.style.zIndex = behavior === 'FIXED' ? '1' : element.style.zIndex
    place()
    for (const scroller of scrollers) {
      scroller.addEventListener('scroll', place, { passive: true })
      stops.push(() => scroller.removeEventListener('scroll', place))
    }
  }
  return () => {
    for (const stop of stops) stop()
  }
}

function nodeAt(
  graph: SceneGraph,
  container: HTMLElement,
  element: HTMLElement
): SceneNode | undefined {
  const host = container.getRootNode()
  const rootId = host instanceof ShadowRoot ? host.host.getAttribute('data-present-frame') : null
  if (!rootId) return undefined
  return findLayerByPath(graph, rootId, element.getAttribute('data-layer') ?? '')
}

/**
 * Where an overlay opens in the screen's box: at one of Figma's positions, or by hand relative
 * to the layer that opened it (below it when no offset was set).
 */
export function overlayPlacement(
  position: OverlayPositionType,
  size: { width: number; height: number },
  box: { width: number; height: number },
  trigger: Rect | null,
  offset: Vector | null
): Vector {
  const centerX = (box.width - size.width) / 2
  const bottom = box.height - size.height
  switch (position) {
    case 'TOP_LEFT':
      return { x: 0, y: 0 }
    case 'TOP_CENTER':
      return { x: centerX, y: 0 }
    case 'TOP_RIGHT':
      return { x: box.width - size.width, y: 0 }
    case 'BOTTOM_LEFT':
      return { x: 0, y: bottom }
    case 'BOTTOM_CENTER':
      return { x: centerX, y: bottom }
    case 'BOTTOM_RIGHT':
      return { x: box.width - size.width, y: bottom }
    case 'MANUAL':
      if (trigger)
        return offset
          ? { x: trigger.x + offset.x, y: trigger.y + offset.y }
          : { x: trigger.x, y: trigger.y + trigger.height }
      return { x: centerX, y: bottom / 2 }
    default:
      return { x: centerX, y: bottom / 2 }
  }
}
