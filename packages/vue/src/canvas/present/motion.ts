import type {
  PrototypeDirection,
  PrototypeEasing,
  PrototypeTransition,
  Spring
} from '@kalka/scene-graph'

/**
 * A prototype's animations as Web Animations: where a layer or screen starts and ends (a
 * translation, a scale from its top-left and an opacity), timed by Figma's easing curves.
 * Springs are physical (mass, stiffness, damping) and play until they settle, sampled into
 * keyframes since the baseline browsers have no `linear()` easing.
 */

export interface Pose {
  x: number
  y: number
  sx: number
  sy: number
  opacity: number
}

export const REST: Pose = { x: 0, y: 0, sx: 1, sy: 1, opacity: 1 }

const BEZIERS: Partial<Record<PrototypeEasing['type'], string>> = {
  LINEAR: 'linear',
  EASE_IN: 'cubic-bezier(0.42, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.58, 1)',
  EASE_IN_AND_OUT: 'cubic-bezier(0.42, 0, 0.58, 1)',
  EASE_IN_BACK: 'cubic-bezier(0.3, -0.05, 0.7, -0.5)',
  EASE_OUT_BACK: 'cubic-bezier(0.45, 1.45, 0.8, 1)',
  EASE_IN_AND_OUT_BACK: 'cubic-bezier(0.7, -0.4, 0.4, 1.4)'
}

/** Figma's spring presets, mass 1. */
const SPRINGS: Partial<Record<PrototypeEasing['type'], Spring>> = {
  GENTLE: { mass: 1, stiffness: 100, damping: 15 },
  QUICK: { mass: 1, stiffness: 300, damping: 20 },
  BOUNCY: { mass: 1, stiffness: 600, damping: 15 },
  SLOW: { mass: 1, stiffness: 80, damping: 20 }
}

function springOf(easing: PrototypeEasing): Spring | null {
  if (easing.type === 'CUSTOM_SPRING') return easing.spring
  return SPRINGS[easing.type] ?? null
}

/** A spring's position from 0 towards 1 over time, sampled until it settles. */
function springSamples(spring: Spring): { duration: number; values: number[] } {
  const step = 1 / 120
  const values: number[] = []
  let position = 0
  let velocity = 0
  let still = 0
  for (let t = 0; t < 4; t += step) {
    const force = -spring.stiffness * (position - 1) - spring.damping * velocity
    velocity += (force / Math.max(spring.mass, 0.01)) * step
    position += velocity * step
    values.push(position)
    still = Math.abs(position - 1) < 0.001 && Math.abs(velocity) < 0.01 ? still + 1 : 0
    if (still > 6) break
  }
  values.push(1)
  return { duration: values.length * step * 1000, values }
}

function css(pose: Pose): Keyframe {
  return {
    transform: `translate(${pose.x}px, ${pose.y}px) scale(${pose.sx}, ${pose.sy})`,
    opacity: pose.opacity
  }
}

function lerp(from: Pose, to: Pose, t: number): Pose {
  const mix = (a: number, b: number) => a + (b - a) * t
  return {
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    sx: mix(from.sx, to.sx),
    sy: mix(from.sy, to.sy),
    opacity: Math.min(1, Math.max(0, mix(from.opacity, to.opacity)))
  }
}

/** Animates an element from one pose to another with a transition's easing and duration. */
export function animatePose(
  element: Element,
  from: Pose,
  to: Pose,
  transition: Pick<PrototypeTransition, 'duration' | 'easing'>
): Animation {
  const spring = springOf(transition.easing)
  if (spring) {
    const { duration, values } = springSamples(spring)
    const stride = Math.max(1, Math.floor(values.length / 40))
    const sampled = values.filter((_, index) => index % stride === 0 || index === values.length - 1)
    return element.animate(
      sampled.map((t) => css(lerp(from, to, t))),
      { duration, easing: 'linear', fill: 'both' }
    )
  }
  const bezier = transition.easing.bezier
  const easing =
    transition.easing.type === 'CUSTOM_CUBIC_BEZIER' && bezier
      ? `cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2})`
      : (BEZIERS[transition.easing.type] ?? 'ease-out')
  return element.animate([css(from), css(to)], {
    duration: Math.max(1, transition.duration * 1000),
    easing,
    fill: 'both'
  })
}

/** An offset of a whole screen box towards a side, in pixels. */
function towards(direction: PrototypeDirection, width: number, height: number, amount = 1): Pose {
  switch (direction) {
    case 'LEFT':
      return { ...REST, x: -width * amount }
    case 'RIGHT':
      return { ...REST, x: width * amount }
    case 'TOP':
      return { ...REST, y: -height * amount }
    default:
      return { ...REST, y: height * amount }
  }
}

const OPPOSITE: Record<PrototypeDirection, PrototypeDirection> = {
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  TOP: 'BOTTOM',
  BOTTOM: 'TOP'
}

/**
 * How the incoming and outgoing screens move for a transition, and which one draws on top.
 * Going back plays the way in backwards: a move in becomes a move out the other way.
 */
export function screenPoses(
  transition: PrototypeTransition,
  back: boolean,
  size: { width: number; height: number }
): { incoming: [Pose, Pose]; outgoing: [Pose, Pose]; outgoingOnTop: boolean } {
  const { width, height } = size
  const type = back
    ? ((
        {
          MOVE_IN: 'MOVE_OUT',
          MOVE_OUT: 'MOVE_IN',
          SLIDE_IN: 'SLIDE_OUT',
          SLIDE_OUT: 'SLIDE_IN'
        } as const
      )[transition.type as 'MOVE_IN'] ?? transition.type)
    : transition.type
  const direction = back ? OPPOSITE[transition.direction] : transition.direction
  // A screen moving `direction` comes in from the other side.
  const from = towards(OPPOSITE[direction], width, height)
  const to = towards(direction, width, height)
  switch (type) {
    case 'MOVE_IN':
      return { incoming: [from, REST], outgoing: [REST, REST], outgoingOnTop: false }
    case 'MOVE_OUT':
      return { incoming: [REST, REST], outgoing: [REST, to], outgoingOnTop: true }
    case 'PUSH':
      return { incoming: [from, REST], outgoing: [REST, to], outgoingOnTop: false }
    case 'SLIDE_IN':
      return {
        incoming: [from, REST],
        outgoing: [REST, towards(direction, width, height, 0.3)],
        outgoingOnTop: false
      }
    case 'SLIDE_OUT':
      return {
        incoming: [towards(OPPOSITE[direction], width, height, 0.3), REST],
        outgoing: [REST, to],
        outgoingOnTop: true
      }
    default:
      // Dissolve, and smart animate for the layers it does not match.
      return {
        incoming: [{ ...REST, opacity: 0 }, REST],
        outgoing: [REST, REST],
        outgoingOnTop: false
      }
  }
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

function boxOf(element: Element, origin: DOMRect, scale: number): Box {
  const rect = element.getBoundingClientRect()
  return {
    x: (rect.left - origin.left) / scale,
    y: (rect.top - origin.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale
  }
}

/** Each layer's box by its layer path, relative to `origin`, in the stage's units. */
export function layerBoxes(root: ParentNode, origin: DOMRect, scale: number): Map<string, Box> {
  const boxes = new Map<string, Box>()
  for (const element of root.querySelectorAll('[data-layer]')) {
    const path = element.getAttribute('data-layer')
    if (path !== null && !boxes.has(path)) boxes.set(path, boxOf(element, origin, scale))
  }
  return boxes
}

/**
 * Smart animate: each layer of `root` that `before` also has, matched by name and hierarchy
 * (its layer path), moves and resizes from where it was; the others fade in. A layer inside a
 * matched layer moves within it, so their motions compose.
 */
export function smartAnimate(
  root: ParentNode,
  before: ReadonlyMap<string, Box>,
  origin: DOMRect,
  scale: number,
  transition: PrototypeTransition
): Animation[] {
  const animations: Animation[] = []
  const visit = (
    element: Element,
    parent: { box: Box; old: Box; sx: number; sy: number } | null
  ) => {
    const path = element.getAttribute('data-layer')
    let next = parent
    if (path !== null && element instanceof HTMLElement) {
      const box = boxOf(element, origin, scale)
      const old = before.get(path)
      if (old && box.width > 0 && box.height > 0) {
        // Where the layer was, in its parent's frame at the start of the parent's own motion.
        const psx = parent?.sx ?? 1
        const psy = parent?.sy ?? 1
        const oldLocal = parent ? { x: old.x - parent.old.x, y: old.y - parent.old.y } : old
        const newLocal = parent ? { x: box.x - parent.box.x, y: box.y - parent.box.y } : box
        const sx = old.width / box.width
        const sy = old.height / box.height
        const from: Pose = {
          x: oldLocal.x / psx - newLocal.x,
          y: oldLocal.y / psy - newLocal.y,
          sx: sx / psx,
          sy: sy / psy,
          opacity: 1
        }
        if (
          Math.abs(from.x) > 0.5 ||
          Math.abs(from.y) > 0.5 ||
          Math.abs(from.sx - 1) > 0.005 ||
          Math.abs(from.sy - 1) > 0.005
        ) {
          element.style.transformOrigin = '0 0'
          animations.push(animatePose(element, from, REST, transition))
        }
        next = { box, old, sx, sy }
      } else if (!old) {
        animations.push(animatePose(element, { ...REST, opacity: 0 }, REST, transition))
        return
      }
    }
    for (const child of element.children) visit(child, next)
  }
  for (const child of Array.from(root.children)) visit(child, null)
  return animations
}
