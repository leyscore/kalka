import type { SceneGraph, SceneNode } from './index'
import type { Vector } from './primitives'
import type { PrototypeConditionalBlock, PrototypeExpression } from './prototype-variables'

/**
 * Prototyping, as Figma models it: a layer's interactions (`reactions`, a trigger and the
 * actions it runs), how a frame scrolls and how a layer stays put while it scrolls, how a frame
 * opens as an overlay, flows starting at frames, and the page's prototype settings. Names follow
 * Figma's Plugin API; times are in seconds as Figma stores them.
 */

export const PROTOTYPE_TRIGGER_TYPES = [
  'ON_CLICK',
  'ON_DRAG',
  'ON_HOVER',
  'ON_PRESS',
  'ON_KEY_DOWN',
  'MOUSE_ENTER',
  'MOUSE_LEAVE',
  'MOUSE_DOWN',
  'MOUSE_UP',
  'AFTER_TIMEOUT'
] as const
export type PrototypeTriggerType = (typeof PROTOTYPE_TRIGGER_TYPES)[number]

export interface PrototypeTrigger {
  type: PrototypeTriggerType
  /** After delay: the wait in seconds; mouse enter, leave, down and up: their delay. */
  delay: number
  /** Key/gamepad: the key codes pressed together, as `KeyboardEvent.keyCode` numbers. */
  keyCodes: number[]
}

/** How a Navigate-like action moves to its destination, as Figma's `navigation`. */
export const PROTOTYPE_NAVIGATIONS = [
  'NAVIGATE',
  'CHANGE_TO',
  'SCROLL_TO',
  'OVERLAY',
  'SWAP'
] as const
export type PrototypeNavigation = (typeof PROTOTYPE_NAVIGATIONS)[number]

export const PROTOTYPE_EASING_TYPES = [
  'EASE_IN',
  'EASE_OUT',
  'EASE_IN_AND_OUT',
  'LINEAR',
  'EASE_IN_BACK',
  'EASE_OUT_BACK',
  'EASE_IN_AND_OUT_BACK',
  'CUSTOM_CUBIC_BEZIER',
  'GENTLE',
  'QUICK',
  'BOUNCY',
  'SLOW',
  'CUSTOM_SPRING'
] as const
export type PrototypeEasingType = (typeof PROTOTYPE_EASING_TYPES)[number]

export interface CubicBezier {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Spring {
  mass: number
  stiffness: number
  damping: number
  /** The speed the motion starts at, in progress per second; 0 starts at rest, as presets do. */
  initialVelocity?: number
}

export interface PrototypeEasing {
  type: PrototypeEasingType
  /** The curve of `CUSTOM_CUBIC_BEZIER`. */
  bezier: CubicBezier | null
  /** The spring of `CUSTOM_SPRING`. */
  spring: Spring | null
}

/** Animations other than Instant, which is no transition. */
export const PROTOTYPE_TRANSITION_TYPES = [
  'DISSOLVE',
  'SMART_ANIMATE',
  'MOVE_IN',
  'MOVE_OUT',
  'PUSH',
  'SLIDE_IN',
  'SLIDE_OUT'
] as const
export type PrototypeTransitionType = (typeof PROTOTYPE_TRANSITION_TYPES)[number]

export const PROTOTYPE_DIRECTIONS = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM'] as const
/** The way a directional transition moves the screen: `LEFT` moves it leftwards. */
export type PrototypeDirection = (typeof PROTOTYPE_DIRECTIONS)[number]

export interface PrototypeTransition {
  type: PrototypeTransitionType
  /** For move, push and slide; ignored by dissolve and smart animate. */
  direction: PrototypeDirection
  /** Move, push and slide that also smart-animate the layers both screens share. */
  matchLayers: boolean
  /** Seconds. */
  duration: number
  easing: PrototypeEasing
}

export interface PrototypeNodeAction {
  type: 'NODE'
  /** The frame, overlay, variant or layer to go to; null until one is picked. */
  destinationId: string | null
  navigation: PrototypeNavigation
  /** Null plays the change at once (Instant). */
  transition: PrototypeTransition | null
  /** Navigate: keep the scroll position the screen had. */
  preserveScrollPosition: boolean
  /** Change to: start the destination's scroll position over. */
  resetScrollPosition: boolean
  /** Open overlay at a manual position: its top-left from the top-left of the triggering layer. */
  overlayRelativePosition: Vector | null
}

/** Set variable: the variable takes the expression's value while the prototype plays. */
export interface PrototypeSetVariableAction {
  type: 'SET_VARIABLE'
  variableId: string | null
  value: PrototypeExpression | null
}

/** Set variable mode: the collection shows that mode while the prototype plays. */
export interface PrototypeSetVariableModeAction {
  type: 'SET_VARIABLE_MODE'
  collectionId: string | null
  modeId: string | null
}

/** What a media action does to a video, as Figma's `mediaAction`. */
export const PROTOTYPE_MEDIA_ACTIONS = [
  'PLAY',
  'PAUSE',
  'TOGGLE_PLAY_PAUSE',
  'MUTE',
  'UNMUTE',
  'TOGGLE_MUTE_UNMUTE',
  'SKIP_FORWARD',
  'SKIP_BACKWARD',
  'SKIP_TO'
] as const
export type PrototypeMediaActionType = (typeof PROTOTYPE_MEDIA_ACTIONS)[number]

/**
 * A media action: plays, pauses, mutes or moves through the video of a layer with a video
 * paint, as Figma's `UPDATE_MEDIA_RUNTIME`. Times are in seconds.
 */
export interface PrototypeMediaAction {
  type: 'UPDATE_MEDIA_RUNTIME'
  /** The layer whose video it controls; null for the layer the interaction is on. */
  destinationId: string | null
  mediaAction: PrototypeMediaActionType
  /** Skip forward and backward: how far. */
  amountToSkip: number
  /** Skip to: where. */
  newTimestamp: number
}

/** Conditional: the first block whose condition holds runs its actions. */
export interface PrototypeConditionalAction {
  type: 'CONDITIONAL'
  blocks: PrototypeConditionalBlock<PrototypeAction>[]
}

export type PrototypeAction =
  | { type: 'BACK' }
  | { type: 'CLOSE' }
  | { type: 'URL'; url: string; openInNewTab: boolean }
  | PrototypeNodeAction
  | PrototypeSetVariableAction
  | PrototypeSetVariableModeAction
  | PrototypeConditionalAction
  | PrototypeMediaAction

export interface PrototypeReaction {
  trigger: PrototypeTrigger
  actions: PrototypeAction[]
}

export const OVERFLOW_DIRECTIONS = ['NONE', 'HORIZONTAL', 'VERTICAL', 'BOTH'] as const
export type OverflowDirection = (typeof OVERFLOW_DIRECTIONS)[number]

/** How a layer moves while the frame it sits in scrolls. */
export const SCROLL_BEHAVIORS = ['SCROLLS', 'FIXED', 'STICKY_SCROLLS'] as const
export type ScrollBehavior = (typeof SCROLL_BEHAVIORS)[number]

export const OVERLAY_POSITIONS = [
  'CENTER',
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT',
  'MANUAL'
] as const
export type OverlayPositionType = (typeof OVERLAY_POSITIONS)[number]

export type OverlayBackgroundInteraction = 'NONE' | 'CLOSE_ON_CLICK_OUTSIDE'

/** A flow: the frame it starts at carries its name and description. */
export interface PrototypeStartingPoint {
  name: string
  description: string
  /** Its place among the page's flows, a fractional order key. */
  position: string
}

/** The device a page's prototype plays on; null plays it in the window as it is. */
export interface PrototypeDevice {
  /** A known device by name, or a custom size. */
  presetIdentifier: string
  size: Vector
  rotation: 'NONE' | 'CCW_90'
}

/** Screens Figma offers for presenting, by its preset names, in points. */
export const PROTOTYPE_DEVICE_PRESETS: readonly { id: string; name: string; size: Vector }[] = [
  { id: 'IPHONE_16', name: 'iPhone 16', size: { x: 393, y: 852 } },
  { id: 'IPHONE_16_PRO_MAX', name: 'iPhone 16 Pro Max', size: { x: 440, y: 956 } },
  { id: 'IPHONE_SE', name: 'iPhone SE', size: { x: 375, y: 667 } },
  { id: 'ANDROID_COMPACT', name: 'Android Compact', size: { x: 412, y: 917 } },
  { id: 'ANDROID_MEDIUM', name: 'Android Medium', size: { x: 700, y: 840 } },
  { id: 'IPAD_MINI', name: 'iPad mini', size: { x: 744, y: 1133 } },
  { id: 'IPAD_PRO_11', name: 'iPad Pro 11"', size: { x: 834, y: 1194 } },
  { id: 'MACBOOK_AIR', name: 'MacBook Air', size: { x: 1280, y: 832 } },
  { id: 'DESKTOP', name: 'Desktop', size: { x: 1440, y: 1024 } }
]

/** The curves of Figma's eased animations, which `cubic-bezier()` plays as they are. */
export const PROTOTYPE_EASING_CURVES: Readonly<Partial<Record<PrototypeEasingType, CubicBezier>>> =
  {
    LINEAR: { x1: 0, y1: 0, x2: 1, y2: 1 },
    EASE_IN: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
    EASE_OUT: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    EASE_IN_AND_OUT: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    EASE_IN_BACK: { x1: 0.3, y1: -0.05, x2: 0.7, y2: -0.5 },
    EASE_OUT_BACK: { x1: 0.45, y1: 1.45, x2: 0.8, y2: 1 },
    EASE_IN_AND_OUT_BACK: { x1: 0.7, y1: -0.4, x2: 0.4, y2: 1.4 }
  }

/** Figma's spring presets, mass 1. */
export const PROTOTYPE_SPRING_PRESETS: Readonly<Partial<Record<PrototypeEasingType, Spring>>> = {
  GENTLE: { mass: 1, stiffness: 100, damping: 15 },
  QUICK: { mass: 1, stiffness: 300, damping: 20 },
  BOUNCY: { mass: 1, stiffness: 600, damping: 15 },
  SLOW: { mass: 1, stiffness: 80, damping: 20 }
}

/** The curve an easing plays, its own for a custom bezier; null for a spring. */
export function easingCurve(easing: PrototypeEasing): CubicBezier | null {
  if (easing.type === 'CUSTOM_CUBIC_BEZIER')
    return easing.bezier ?? PROTOTYPE_EASING_CURVES.EASE_OUT ?? null
  return PROTOTYPE_EASING_CURVES[easing.type] ?? null
}

/** The spring an easing plays, its own for a custom spring; null for a curve. */
export function easingSpring(easing: PrototypeEasing): Spring | null {
  if (easing.type === 'CUSTOM_SPRING')
    return easing.spring ?? PROTOTYPE_SPRING_PRESETS.GENTLE ?? null
  return PROTOTYPE_SPRING_PRESETS[easing.type] ?? null
}

/**
 * Switches an easing to a custom curve or spring, as Figma's Custom bezier and Custom spring
 * start from the easing chosen before.
 */
export function customEasing(
  easing: PrototypeEasing,
  type: 'CUSTOM_CUBIC_BEZIER' | 'CUSTOM_SPRING'
): PrototypeEasing {
  if (type === 'CUSTOM_CUBIC_BEZIER') {
    const bezier = easingCurve(easing) ?? { x1: 0, y1: 0, x2: 0.58, y2: 1 }
    return { type, bezier: { ...bezier }, spring: null }
  }
  const spring = easingSpring(easing) ?? { mass: 1, stiffness: 100, damping: 15 }
  return { type, bezier: null, spring: { ...spring } }
}

/** A spring's position from 0 towards 1 over time, sampled at 120 Hz until it settles. */
export function springSamples(spring: Spring): { duration: number; values: number[] } {
  const step = 1 / 120
  const values: number[] = []
  let position = 0
  let velocity = spring.initialVelocity ?? 0
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

export const DEFAULT_PROTOTYPE_EASING: PrototypeEasing = {
  type: 'EASE_OUT',
  bezier: null,
  spring: null
}

/** A new interaction, as Figma adds one: On click, Navigate to, Instant. */
export function createPrototypeReaction(destinationId: string | null = null): PrototypeReaction {
  return {
    trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
    actions: [createNodeAction(destinationId)]
  }
}

export function createNodeAction(
  destinationId: string | null,
  navigation: PrototypeNavigation = 'NAVIGATE'
): PrototypeNodeAction {
  return {
    type: 'NODE',
    destinationId,
    navigation,
    transition: null,
    preserveScrollPosition: false,
    resetScrollPosition: false,
    overlayRelativePosition: null
  }
}

/** The transition Figma picks when one is turned on: dissolve, ease out, 300 ms. */
export function createPrototypeTransition(
  type: PrototypeTransitionType = 'DISSOLVE'
): PrototypeTransition {
  return {
    type,
    direction: 'LEFT',
    matchLayers: false,
    duration: 0.3,
    easing: { ...DEFAULT_PROTOTYPE_EASING }
  }
}

export function isNodeAction(action: PrototypeAction): action is PrototypeNodeAction {
  return action.type === 'NODE'
}

/** The actions an action runs: itself, and for a conditional every action of its blocks. */
export function flattenPrototypeActions(actions: readonly PrototypeAction[]): PrototypeAction[] {
  return actions.flatMap((action) =>
    action.type === 'CONDITIONAL'
      ? [action, ...flattenPrototypeActions(action.blocks.flatMap((block) => block.actions))]
      : [action]
  )
}

/** Every layer that names `nodeId` as a destination, with the reaction that does. */
export function prototypeConnections(
  graph: SceneGraph,
  pageId: string
): { sourceId: string; destinationId: string; reactionIndex: number; actionIndex: number }[] {
  const connections: {
    sourceId: string
    destinationId: string
    reactionIndex: number
    actionIndex: number
  }[] = []
  const visit = (node: SceneNode): void => {
    node.reactions.forEach((reaction, reactionIndex) =>
      // A conditional's branches connect too; their index counts through the flattened actions.
      flattenPrototypeActions(reaction.actions).forEach((action, actionIndex) => {
        if (action.type === 'NODE' && action.destinationId && graph.getNode(action.destinationId))
          connections.push({
            sourceId: node.id,
            destinationId: action.destinationId,
            reactionIndex,
            actionIndex
          })
      })
    )
    for (const child of graph.getChildren(node.id)) visit(child)
  }
  for (const child of graph.getChildren(pageId)) visit(child)
  return connections
}

/** The page's flows in order: the frames that start one, with their starting point. */
export function flowStartingPoints(
  graph: SceneGraph,
  pageId: string
): { node: SceneNode; startingPoint: PrototypeStartingPoint }[] {
  const flows: { node: SceneNode; startingPoint: PrototypeStartingPoint }[] = []
  for (const node of graph.getChildren(pageId))
    if (node.prototypeStartingPoint)
      flows.push({ node, startingPoint: node.prototypeStartingPoint })
  // Positions are fractional-index strings, ordered by code unit as Figma orders them.
  return flows.sort((a, b) => {
    if (a.startingPoint.position === b.startingPoint.position) return 0
    return a.startingPoint.position < b.startingPoint.position ? -1 : 1
  })
}

/** Whether the page has anything to play as a prototype: a flow or an interaction. */
export function pageHasPrototype(graph: SceneGraph, pageId: string): boolean {
  const visit = (node: SceneNode): boolean =>
    node.reactions.length > 0 || graph.getChildren(node.id).some(visit)
  return graph
    .getChildren(pageId)
    .some((node) => node.prototypeStartingPoint !== null || visit(node))
}

/** Prototype fields of a layer, cloned for a copy. */
export function copyPrototypeFields(
  src: SceneNode
): Pick<
  SceneNode,
  | 'reactions'
  | 'overlayBackground'
  | 'prototypeStartingPoint'
  | 'prototypeDevice'
  | 'prototypeBackground'
> {
  return {
    reactions: structuredClone(src.reactions),
    overlayBackground: src.overlayBackground ? { ...src.overlayBackground } : null,
    prototypeStartingPoint: src.prototypeStartingPoint ? { ...src.prototypeStartingPoint } : null,
    prototypeDevice: src.prototypeDevice ? structuredClone(src.prototypeDevice) : null,
    prototypeBackground: src.prototypeBackground ? { ...src.prototypeBackground } : null
  }
}
