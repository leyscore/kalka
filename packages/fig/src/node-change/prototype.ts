import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import {
  PROTOTYPE_MEDIA_ACTIONS,
  type OverflowDirection,
  type SceneGraph,
  type OverlayPositionType,
  type PrototypeAction,
  type PrototypeDevice,
  type PrototypeDirection,
  type PrototypeEasing,
  type PrototypeEasingType,
  type PrototypeMediaActionType,
  type PrototypeNavigation,
  type PrototypeReaction,
  type PrototypeStartingPoint,
  type PrototypeTransition,
  type PrototypeTriggerType,
  type SceneNode,
  type ScrollBehavior
} from '@kalka/scene-graph'
import { orderKeyBetween } from '@kalka/scene-graph/order-keys'
import type { Color, GUID, Vector } from '@kalka/scene-graph/primitives'

import {
  exportVariableAction,
  importVariableAction,
  type VariableRefs
} from './prototype-variables'

/**
 * Figma's prototype records (`prototypeInteractions`, scrolling, overlay and flow fields, and a
 * page's device) as the scene graph's prototype fields, both ways. Figma stores times in seconds
 * and a directional transition by the side the incoming screen comes from (`SLIDE_FROM_LEFT`
 * moves it rightwards).
 */

type Fields = Pick<
  SceneNode,
  | 'reactions'
  | 'overflowDirection'
  | 'scrollBehavior'
  | 'overlayPositionType'
  | 'overlayBackground'
  | 'overlayBackgroundInteraction'
  | 'prototypeStartingPoint'
  | 'prototypeDevice'
  | 'prototypeBackground'
>

type Obj = { [key: string]: unknown }

function isRecord(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** Seconds stored as 32-bit floats, back to the milliseconds they were set in. */
function seconds(value: unknown, fallback: number): number {
  return Math.round(num(value, fallback) * 1000) / 1000
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function guidOf(value: unknown): string | null {
  if (!isRecord(value)) return null
  const { sessionID, localID } = value
  if (typeof sessionID !== 'number' || typeof localID !== 'number') return null
  // Figma's unset GUID names no layer.
  if (sessionID === 4294967295 && localID === 4294967295) return null
  return guidToString({ sessionID, localID })
}

function color(value: unknown): Color | null {
  if (!isRecord(value)) return null
  return { r: num(value.r, 0), g: num(value.g, 0), b: num(value.b, 0), a: num(value.a, 1) }
}

function vector(value: unknown): Vector | null {
  return isRecord(value) ? { x: num(value.x, 0), y: num(value.y, 0) } : null
}

const TRIGGERS: Readonly<Partial<{ [type: string]: PrototypeTriggerType }>> = {
  ON_CLICK: 'ON_CLICK',
  DRAG: 'ON_DRAG',
  ON_HOVER: 'ON_HOVER',
  ON_PRESS: 'ON_PRESS',
  ON_KEY_DOWN: 'ON_KEY_DOWN',
  MOUSE_IN: 'MOUSE_ENTER',
  MOUSE_ENTER: 'MOUSE_ENTER',
  MOUSE_OUT: 'MOUSE_LEAVE',
  MOUSE_LEAVE: 'MOUSE_LEAVE',
  MOUSE_DOWN: 'MOUSE_DOWN',
  MOUSE_UP: 'MOUSE_UP',
  AFTER_TIMEOUT: 'AFTER_TIMEOUT'
}

const TRIGGER_EXPORT: { [type in PrototypeTriggerType]: string } = {
  ON_CLICK: 'ON_CLICK',
  ON_DRAG: 'DRAG',
  ON_HOVER: 'ON_HOVER',
  ON_PRESS: 'ON_PRESS',
  ON_KEY_DOWN: 'ON_KEY_DOWN',
  MOUSE_ENTER: 'MOUSE_IN',
  MOUSE_LEAVE: 'MOUSE_OUT',
  MOUSE_DOWN: 'MOUSE_DOWN',
  MOUSE_UP: 'MOUSE_UP',
  AFTER_TIMEOUT: 'AFTER_TIMEOUT'
}

const NAVIGATIONS: Readonly<Partial<{ [type: string]: PrototypeNavigation }>> = {
  NAVIGATE: 'NAVIGATE',
  OVERLAY: 'OVERLAY',
  SWAP: 'SWAP',
  SWAP_STATE: 'CHANGE_TO',
  SCROLL_TO: 'SCROLL_TO'
}

const NAVIGATION_EXPORT: { [type in PrototypeNavigation]: string } = {
  NAVIGATE: 'NAVIGATE',
  OVERLAY: 'OVERLAY',
  SWAP: 'SWAP',
  CHANGE_TO: 'SWAP_STATE',
  SCROLL_TO: 'SCROLL_TO'
}

const EASINGS: Readonly<Partial<{ [type: string]: PrototypeEasingType }>> = {
  IN_CUBIC: 'EASE_IN',
  OUT_CUBIC: 'EASE_OUT',
  INOUT_CUBIC: 'EASE_IN_AND_OUT',
  LINEAR: 'LINEAR',
  HOLD: 'LINEAR',
  IN_BACK_CUBIC: 'EASE_IN_BACK',
  OUT_BACK_CUBIC: 'EASE_OUT_BACK',
  INOUT_BACK_CUBIC: 'EASE_IN_AND_OUT_BACK',
  CUSTOM_CUBIC: 'CUSTOM_CUBIC_BEZIER',
  SPRING: 'GENTLE',
  GENTLE_SPRING: 'GENTLE',
  SPRING_PRESET_ONE: 'QUICK',
  SPRING_PRESET_TWO: 'BOUNCY',
  SPRING_PRESET_THREE: 'SLOW',
  CUSTOM_SPRING: 'CUSTOM_SPRING'
}

const EASING_EXPORT: { [type in PrototypeEasingType]: string } = {
  EASE_IN: 'IN_CUBIC',
  EASE_OUT: 'OUT_CUBIC',
  EASE_IN_AND_OUT: 'INOUT_CUBIC',
  LINEAR: 'LINEAR',
  EASE_IN_BACK: 'IN_BACK_CUBIC',
  EASE_OUT_BACK: 'OUT_BACK_CUBIC',
  EASE_IN_AND_OUT_BACK: 'INOUT_BACK_CUBIC',
  CUSTOM_CUBIC_BEZIER: 'CUSTOM_CUBIC',
  GENTLE: 'GENTLE_SPRING',
  QUICK: 'SPRING_PRESET_ONE',
  BOUNCY: 'SPRING_PRESET_TWO',
  SLOW: 'SPRING_PRESET_THREE',
  CUSTOM_SPRING: 'CUSTOM_SPRING'
}

/** Each of Figma's transition types as a transition and the way it moves. */
const TRANSITIONS: Readonly<
  Partial<{ [type: string]: [PrototypeTransition['type'], PrototypeDirection] }>
> = {
  DISSOLVE: ['DISSOLVE', 'LEFT'],
  FADE: ['DISSOLVE', 'LEFT'],
  SMART_ANIMATE: ['SMART_ANIMATE', 'LEFT'],
  MAGIC_MOVE: ['SMART_ANIMATE', 'LEFT'],
  SCROLL_ANIMATE: ['SMART_ANIMATE', 'LEFT'],
  SLIDE_FROM_LEFT: ['SLIDE_IN', 'RIGHT'],
  SLIDE_FROM_RIGHT: ['SLIDE_IN', 'LEFT'],
  SLIDE_FROM_TOP: ['SLIDE_IN', 'BOTTOM'],
  SLIDE_FROM_BOTTOM: ['SLIDE_IN', 'TOP'],
  PUSH_FROM_LEFT: ['PUSH', 'RIGHT'],
  PUSH_FROM_RIGHT: ['PUSH', 'LEFT'],
  PUSH_FROM_TOP: ['PUSH', 'BOTTOM'],
  PUSH_FROM_BOTTOM: ['PUSH', 'TOP'],
  MOVE_FROM_LEFT: ['MOVE_IN', 'RIGHT'],
  MOVE_FROM_RIGHT: ['MOVE_IN', 'LEFT'],
  MOVE_FROM_TOP: ['MOVE_IN', 'BOTTOM'],
  MOVE_FROM_BOTTOM: ['MOVE_IN', 'TOP'],
  SLIDE_OUT_TO_LEFT: ['SLIDE_OUT', 'LEFT'],
  SLIDE_OUT_TO_RIGHT: ['SLIDE_OUT', 'RIGHT'],
  SLIDE_OUT_TO_TOP: ['SLIDE_OUT', 'TOP'],
  SLIDE_OUT_TO_BOTTOM: ['SLIDE_OUT', 'BOTTOM'],
  MOVE_OUT_TO_LEFT: ['MOVE_OUT', 'LEFT'],
  MOVE_OUT_TO_RIGHT: ['MOVE_OUT', 'RIGHT'],
  MOVE_OUT_TO_TOP: ['MOVE_OUT', 'TOP'],
  MOVE_OUT_TO_BOTTOM: ['MOVE_OUT', 'BOTTOM']
}

/** The side a screen moving `direction` comes from. */
const OPPOSITE: { [direction in PrototypeDirection]: string } = {
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  TOP: 'BOTTOM',
  BOTTOM: 'TOP'
}

function transitionType(transition: PrototypeTransition): string {
  switch (transition.type) {
    case 'DISSOLVE':
    case 'SMART_ANIMATE':
      return transition.type
    case 'SLIDE_IN':
      return `SLIDE_FROM_${OPPOSITE[transition.direction]}`
    case 'PUSH':
      return `PUSH_FROM_${OPPOSITE[transition.direction]}`
    case 'MOVE_IN':
      return `MOVE_FROM_${OPPOSITE[transition.direction]}`
    case 'SLIDE_OUT':
      return `SLIDE_OUT_TO_${transition.direction}`
    case 'MOVE_OUT':
      return `MOVE_OUT_TO_${transition.direction}`
    default:
      return 'DISSOLVE'
  }
}

function importEasing(action: Obj): PrototypeEasing {
  const type = EASINGS[str(action.easingType) ?? ''] ?? 'EASE_OUT'
  const values = Array.isArray(action.easingFunction)
    ? action.easingFunction.filter((value): value is number => typeof value === 'number')
    : []
  return {
    type,
    bezier:
      type === 'CUSTOM_CUBIC_BEZIER' && values.length >= 4
        ? { x1: values[0], y1: values[1], x2: values[2], y2: values[3] }
        : null,
    spring:
      type === 'CUSTOM_SPRING' && values.length >= 3
        ? {
            mass: values[0],
            stiffness: values[1],
            damping: values[2],
            // The spring's start speed, when the file gives one.
            ...(values[3] ? { initialVelocity: values[3] } : {})
          }
        : null
  }
}

function importTransition(action: Obj): PrototypeTransition | null {
  const known = TRANSITIONS[str(action.transitionType) ?? '']
  if (!known) return null
  return {
    type: known[0],
    direction: known[1],
    matchLayers: known[0] !== 'SMART_ANIMATE' && action.transitionShouldSmartAnimate === true,
    duration: seconds(action.transitionDuration, 0.3),
    easing: importEasing(action)
  }
}

const MEDIA_ACTIONS: ReadonlySet<string> = new Set(PROTOTYPE_MEDIA_ACTIONS)

function isMediaAction(value: string): value is PrototypeMediaActionType {
  return MEDIA_ACTIONS.has(value)
}

function importAction(action: unknown): PrototypeAction | null {
  if (!isRecord(action)) return null
  switch (str(action.connectionType)) {
    case 'BACK':
      return { type: 'BACK' }
    case 'CLOSE':
      return { type: 'CLOSE' }
    case 'URL':
      return {
        type: 'URL',
        url: str(action.connectionURL) ?? '',
        openInNewTab: action.openUrlInNewTab !== false
      }
    case 'UPDATE_MEDIA_RUNTIME': {
      const mediaAction = str(action.mediaAction) ?? 'PLAY'
      if (!isMediaAction(mediaAction)) return null
      return {
        type: 'UPDATE_MEDIA_RUNTIME',
        destinationId: guidOf(action.transitionNodeID),
        mediaAction,
        amountToSkip: typeof action.mediaSkipByAmount === 'number' ? action.mediaSkipByAmount : 0,
        newTimestamp: typeof action.mediaSkipToTime === 'number' ? action.mediaSkipToTime : 0
      }
    }
    case 'INTERNAL_NODE': {
      const navigation = NAVIGATIONS[str(action.navigationType) ?? 'NAVIGATE']
      if (!navigation) return null
      return {
        type: 'NODE',
        destinationId: guidOf(action.transitionNodeID),
        navigation,
        transition: importTransition(action),
        preserveScrollPosition: action.transitionPreserveScroll === true,
        resetScrollPosition: action.transitionResetScrollPosition === true,
        overlayRelativePosition: vector(action.overlayRelativePosition)
      }
    }
    default:
      return importVariableAction(action, importAction)
  }
}

function importReaction(interaction: unknown): PrototypeReaction | null {
  if (!isRecord(interaction) || interaction.isDeleted === true) return null
  const event = isRecord(interaction.event) ? interaction.event : {}
  const type = TRIGGERS[str(event.interactionType) ?? '']
  if (!type) return null
  const keyTrigger = isRecord(event.keyTrigger) ? event.keyTrigger : {}
  const actions = (Array.isArray(interaction.actions) ? interaction.actions : [])
    .map(importAction)
    .filter((action): action is PrototypeAction => action !== null)
  if (actions.length === 0) return null
  return {
    trigger: {
      type,
      delay: seconds(event.transitionTimeout, type === 'AFTER_TIMEOUT' ? 0.8 : 0),
      keyCodes: Array.isArray(keyTrigger.keyCodes)
        ? keyTrigger.keyCodes.filter((code): code is number => typeof code === 'number')
        : []
    },
    actions
  }
}

/** The interactions Kalka plays among a record's `prototypeInteractions`. */
export function importReactions(value: unknown): PrototypeReaction[] {
  return (Array.isArray(value) ? value : [])
    .map(importReaction)
    .filter((reaction): reaction is PrototypeReaction => reaction !== null)
}

function overflow(value: unknown): OverflowDirection {
  return value === 'HORIZONTAL' || value === 'VERTICAL' || value === 'BOTH' ? value : 'NONE'
}

function scrollBehavior(value: unknown): ScrollBehavior {
  if (value === 'FIXED_WHEN_CHILD_OF_SCROLLING_FRAME') return 'FIXED'
  return value === 'STICKY_SCROLLS' ? 'STICKY_SCROLLS' : 'SCROLLS'
}

const OVERLAY_POSITIONS = new Set<string>([
  'CENTER',
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT',
  'MANUAL'
])

function overlayPosition(value: unknown): OverlayPositionType {
  return typeof value === 'string' && OVERLAY_POSITIONS.has(value)
    ? (value as OverlayPositionType)
    : 'CENTER'
}

function startingPoint(value: unknown): PrototypeStartingPoint | null {
  if (!isRecord(value)) return null
  return {
    name: str(value.name) ?? '',
    description: str(value.description) ?? '',
    position: str(value.position) ?? ''
  }
}

function device(value: unknown): PrototypeDevice | null {
  if (!isRecord(value)) return null
  const type = str(value.type)
  if (type !== 'PRESET' && type !== 'CUSTOM') return null
  const size = vector(value.size)
  if (!size || size.x <= 0 || size.y <= 0) return null
  return {
    presetIdentifier: type === 'PRESET' ? (str(value.presetIdentifier) ?? '') : '',
    size,
    rotation: value.rotation === 'CCW_90' ? 'CCW_90' : 'NONE'
  }
}

/** A record's prototype fields, as the scene graph keeps them. */
export function importPrototypeFields(nc: NodeChange): Fields {
  const background = isRecord(nc.overlayBackgroundAppearance) ? nc.overlayBackgroundAppearance : {}
  return {
    reactions: importReactions(nc.prototypeInteractions),
    overflowDirection: overflow(nc.scrollDirection),
    scrollBehavior: scrollBehavior(nc.scrollBehavior),
    overlayPositionType: overlayPosition(nc.overlayPositionType),
    overlayBackground:
      background.backgroundType === 'SOLID_COLOR' ? color(background.backgroundColor) : null,
    overlayBackgroundInteraction:
      nc.overlayBackgroundInteraction === 'CLOSE_ON_CLICK_OUTSIDE'
        ? 'CLOSE_ON_CLICK_OUTSIDE'
        : 'NONE',
    prototypeStartingPoint: startingPoint(nc.prototypeStartingPoint),
    prototypeDevice: device(nc.prototypeDevice),
    prototypeBackground: color(nc.prototypeBackgroundColor)
  }
}

function exportTransition(transition: PrototypeTransition | null): Obj {
  if (!transition) return { transitionType: 'INSTANT_TRANSITION', transitionDuration: 0 }
  const fields: Obj = {
    transitionType: transitionType(transition),
    transitionDuration: transition.duration,
    easingType: EASING_EXPORT[transition.easing.type],
    transitionShouldSmartAnimate: transition.type === 'SMART_ANIMATE' || transition.matchLayers
  }
  const { bezier, spring } = transition.easing
  if (transition.easing.type === 'CUSTOM_CUBIC_BEZIER' && bezier)
    fields.easingFunction = [bezier.x1, bezier.y1, bezier.x2, bezier.y2]
  if (transition.easing.type === 'CUSTOM_SPRING' && spring)
    fields.easingFunction = spring.initialVelocity
      ? [spring.mass, spring.stiffness, spring.damping, spring.initialVelocity]
      : [spring.mass, spring.stiffness, spring.damping]
  return fields
}

/** How exported interactions name layers (`node`), variables, collections and modes. */
export interface PrototypeRefs extends VariableRefs {
  node: (id: string) => GUID | undefined
}

function exportAction(action: PrototypeAction, refs: PrototypeRefs): Obj | null {
  switch (action.type) {
    case 'BACK':
    case 'CLOSE':
      return { connectionType: action.type }
    case 'URL': {
      const fields: Obj = { connectionType: 'URL', connectionURL: action.url }
      if (!action.openInNewTab) fields.openUrlInNewTab = false
      return fields
    }
    case 'SET_VARIABLE':
    case 'SET_VARIABLE_MODE':
    case 'CONDITIONAL':
      return exportVariableAction(action, refs, (nested) => exportAction(nested, refs))
    case 'UPDATE_MEDIA_RUNTIME': {
      const fields: Obj = {
        connectionType: 'UPDATE_MEDIA_RUNTIME',
        mediaAction: action.mediaAction
      }
      const guid = action.destinationId ? refs.node(action.destinationId) : undefined
      if (guid) fields.transitionNodeID = guid
      if (action.mediaAction === 'SKIP_FORWARD' || action.mediaAction === 'SKIP_BACKWARD')
        fields.mediaSkipByAmount = action.amountToSkip
      if (action.mediaAction === 'SKIP_TO') fields.mediaSkipToTime = action.newTimestamp
      return fields
    }
    case 'NODE': {
      const guid = action.destinationId ? refs.node(action.destinationId) : undefined
      if (!guid) return null
      const fields: Obj = {
        connectionType: 'INTERNAL_NODE',
        transitionNodeID: guid,
        navigationType: NAVIGATION_EXPORT[action.navigation],
        ...exportTransition(action.transition)
      }
      if (action.preserveScrollPosition) fields.transitionPreserveScroll = true
      if (action.resetScrollPosition) fields.transitionResetScrollPosition = true
      if (action.overlayRelativePosition)
        fields.overlayRelativePosition = { ...action.overlayRelativePosition }
      return fields
    }
  }
}

/** `prototypeInteractions` for a layer's reactions, naming what they reach through `refs`. */
export function exportReactions(
  reactions: readonly PrototypeReaction[],
  refs: PrototypeRefs
): Obj[] {
  const interactions: Obj[] = []
  for (const reaction of reactions) {
    const actions = reaction.actions
      .map((action) => exportAction(action, refs))
      .filter((action): action is Obj => action !== null)
    if (actions.length === 0) continue
    const event: Obj = { interactionType: TRIGGER_EXPORT[reaction.trigger.type] }
    if (reaction.trigger.delay > 0) event.transitionTimeout = reaction.trigger.delay
    if (reaction.trigger.type === 'ON_KEY_DOWN')
      event.keyTrigger = { keyCodes: [...reaction.trigger.keyCodes], triggerDevice: 'KEYBOARD' }
    interactions.push({ event, actions })
  }
  return interactions
}

function exportColor(value: Color): Obj {
  return { r: value.r, g: value.g, b: value.b, a: value.a }
}

/**
 * Writes a layer's prototype fields onto its record. A file's own interactions, until the layer's
 * are edited (`rawNodeFields` leaves them out then), are written as the file held them, which keeps
 * what Kalka does not play (media, variable mode lookups) and the interactions' GUIDs.
 */
export function exportPrototypeFields(
  node: SceneNode,
  nc: Obj,
  rawNodeFields: Readonly<Obj>,
  refs: PrototypeRefs
): void {
  const raw = rawNodeFields.prototypeInteractions
  if (
    raw !== undefined &&
    JSON.stringify(importReactions(raw)) === JSON.stringify(node.reactions)
  ) {
    nc.prototypeInteractions = structuredClone(raw)
  } else if (node.reactions.length > 0) {
    nc.prototypeInteractions = exportReactions(node.reactions, refs)
  }
  if (node.overflowDirection !== 'NONE') nc.scrollDirection = node.overflowDirection
  if (node.scrollBehavior !== 'SCROLLS')
    nc.scrollBehavior =
      node.scrollBehavior === 'FIXED' ? 'FIXED_WHEN_CHILD_OF_SCROLLING_FRAME' : 'STICKY_SCROLLS'
  if (node.overlayPositionType !== 'CENTER') nc.overlayPositionType = node.overlayPositionType
  if (node.overlayBackgroundInteraction !== 'NONE')
    nc.overlayBackgroundInteraction = node.overlayBackgroundInteraction
  if (node.overlayBackground)
    nc.overlayBackgroundAppearance = {
      backgroundType: 'SOLID_COLOR',
      backgroundColor: exportColor(node.overlayBackground)
    }
  if (node.prototypeStartingPoint) nc.prototypeStartingPoint = { ...node.prototypeStartingPoint }
  exportPageSettings(node, nc)
}

/**
 * Gives each written interaction an `id` of its own, as Figma names every interaction: a copied
 * layer carries its original's interactions with their GUIDs, so a repeated or missing one gets
 * a new GUID from `mint`. `seen` holds the interaction GUIDs written so far in the file.
 */
export function uniqueInteractionIds(nc: Obj, seen: Set<string>, mint: () => GUID): void {
  if (!Array.isArray(nc.prototypeInteractions)) return
  for (const interaction of nc.prototypeInteractions) {
    if (!isRecord(interaction)) continue
    const id = guidOf(interaction.id)
    if (id && !seen.has(id)) {
      seen.add(id)
      continue
    }
    const guid = mint()
    seen.add(guidToString(guid))
    interaction.id = guid
  }
}

/** A page's device and background, onto its canvas record. */
export function exportPageSettings(node: SceneNode, nc: Obj): void {
  if (node.prototypeDevice) {
    const { presetIdentifier, size, rotation } = node.prototypeDevice
    const written: Obj = {
      type: presetIdentifier ? 'PRESET' : 'CUSTOM',
      size: { ...size },
      rotation
    }
    if (presetIdentifier) written.presetIdentifier = presetIdentifier
    nc.prototypeDevice = written
  }
  if (node.prototypeBackground) nc.prototypeBackgroundColor = exportColor(node.prototypeBackground)
}

/**
 * Files from before flows name where their prototype starts on the page itself
 * (`prototypeStartNodeID`). Figma opens such a page with that frame as its one flow, and so does
 * this, unless the page has flows already.
 */
export function importLegacyFlowStarts(
  graph: SceneGraph,
  pages: readonly { sourceId: string; properties: NodeChange }[],
  sources: ReadonlyMap<string, string>
): void {
  for (const page of pages) {
    const pageId = sources.get(page.sourceId)
    const startGuid = guidOf(page.properties.prototypeStartNodeID)
    const startId = startGuid ? sources.get(startGuid) : undefined
    const start = startId ? graph.getNode(startId) : undefined
    if (!pageId || !start || start.parentId !== pageId) continue
    if (graph.getChildren(pageId).some((node) => node.prototypeStartingPoint)) continue
    graph.preserveSourceMetadataDuring(() =>
      graph.updateNode(start.id, {
        prototypeStartingPoint: {
          name: 'Flow 1',
          description: '',
          position: orderKeyBetween(null, null)
        }
      })
    )
  }
}
