import * as v from 'valibot'

import {
  flowStartingPoints,
  PROTOTYPE_DIRECTIONS,
  PROTOTYPE_EASING_TYPES,
  PROTOTYPE_NAVIGATIONS,
  PROTOTYPE_TRANSITION_TYPES,
  PROTOTYPE_TRIGGER_TYPES,
  type PrototypeAction,
  type PrototypeEasing,
  type PrototypeReaction,
  type PrototypeTransition
} from '@kalka/scene-graph'
import { orderKeyBetween } from '@kalka/scene-graph/order-keys'

import {
  assertProxyEditable,
  graph,
  raw,
  updateNode,
  type NodeProxyInternals,
  type ProxyThis
} from '#core/figma-api/accessor-utils'

/**
 * Prototyping through the Plugin API: a layer's `reactions` (read, set, and `setReactionsAsync`),
 * and a page's `flowStartingPoints`, in Figma's shapes. Kalka plays navigation, overlays, scroll
 * to, change to, back, close and links; a reaction with another action is refused with why.
 */

const vector = v.object({ x: v.number(), y: v.number() })

const easingSchema = v.object({
  type: v.picklist(PROTOTYPE_EASING_TYPES),
  easingFunctionCubicBezier: v.optional(
    v.object({ x1: v.number(), y1: v.number(), x2: v.number(), y2: v.number() })
  ),
  easingFunctionSpring: v.optional(
    v.object({
      mass: v.number(),
      stiffness: v.number(),
      damping: v.number(),
      initialVelocity: v.optional(v.number())
    })
  )
})

const transitionSchema = v.nullable(
  v.object({
    type: v.picklist([...PROTOTYPE_TRANSITION_TYPES, 'SCROLL_ANIMATE']),
    direction: v.optional(v.picklist(PROTOTYPE_DIRECTIONS)),
    matchLayers: v.optional(v.boolean()),
    easing: easingSchema,
    duration: v.pipe(v.number(), v.minValue(0))
  })
)

const actionSchema = v.union([
  v.object({ type: v.picklist(['BACK', 'CLOSE']) }),
  v.object({ type: v.literal('URL'), url: v.string(), openInNewTab: v.optional(v.boolean()) }),
  v.object({
    type: v.literal('NODE'),
    destinationId: v.nullable(v.string()),
    navigation: v.picklist(PROTOTYPE_NAVIGATIONS),
    transition: transitionSchema,
    preserveScrollPosition: v.optional(v.boolean()),
    resetScrollPosition: v.optional(v.boolean()),
    overlayRelativePosition: v.optional(vector)
  })
])

const triggerSchema = v.object({
  type: v.picklist(PROTOTYPE_TRIGGER_TYPES),
  timeout: v.optional(v.pipe(v.number(), v.minValue(0))),
  delay: v.optional(v.pipe(v.number(), v.minValue(0))),
  keyCodes: v.optional(v.array(v.number()))
})

const reactionSchema = v.object({
  trigger: v.nullable(triggerSchema),
  action: v.optional(v.nullable(v.unknown())),
  actions: v.optional(v.array(v.unknown()))
})

type FigmaEasing = v.InferOutput<typeof easingSchema>

function easingFromFigma(easing: FigmaEasing): PrototypeEasing {
  const bezier = easing.easingFunctionCubicBezier
  const spring = easing.easingFunctionSpring
  return {
    type: easing.type,
    bezier: easing.type === 'CUSTOM_CUBIC_BEZIER' && bezier ? { ...bezier } : null,
    spring:
      easing.type === 'CUSTOM_SPRING' && spring
        ? { mass: spring.mass, stiffness: spring.stiffness, damping: spring.damping }
        : null
  }
}

function easingToFigma(easing: PrototypeEasing) {
  if (easing.type === 'CUSTOM_CUBIC_BEZIER' && easing.bezier)
    return { type: easing.type, easingFunctionCubicBezier: { ...easing.bezier } }
  if (easing.type === 'CUSTOM_SPRING' && easing.spring)
    return { type: easing.type, easingFunctionSpring: { ...easing.spring, initialVelocity: 0 } }
  return { type: easing.type }
}

function transitionToFigma(transition: PrototypeTransition) {
  const common = {
    type: transition.type,
    easing: easingToFigma(transition.easing),
    duration: transition.duration
  }
  if (transition.type === 'DISSOLVE' || transition.type === 'SMART_ANIMATE') return common
  return { ...common, direction: transition.direction, matchLayers: transition.matchLayers }
}

function actionToFigma(action: PrototypeAction) {
  switch (action.type) {
    case 'BACK':
    case 'CLOSE':
      return { type: action.type }
    case 'URL':
      return { type: 'URL', url: action.url, openInNewTab: action.openInNewTab }
    case 'NODE':
      return {
        type: 'NODE',
        destinationId: action.destinationId,
        navigation: action.navigation,
        transition: action.transition ? transitionToFigma(action.transition) : null,
        preserveScrollPosition: action.preserveScrollPosition,
        resetScrollPosition: action.resetScrollPosition,
        ...(action.overlayRelativePosition
          ? { overlayRelativePosition: { ...action.overlayRelativePosition } }
          : {})
      }
  }
}

function triggerToFigma(reaction: PrototypeReaction) {
  const { type, delay, keyCodes } = reaction.trigger
  switch (type) {
    case 'AFTER_TIMEOUT':
      return { type, timeout: delay }
    case 'MOUSE_ENTER':
    case 'MOUSE_LEAVE':
      return { type, delay, deprecatedVersion: false }
    case 'MOUSE_DOWN':
    case 'MOUSE_UP':
      return { type, delay }
    case 'ON_KEY_DOWN':
      return { type, device: 'KEYBOARD', keyCodes: [...keyCodes] }
    default:
      return { type }
  }
}

/** A layer's interactions in the Plugin API's shape, with the deprecated `action` too. */
export function reactionsToFigma(reactions: readonly PrototypeReaction[]) {
  return reactions.map((reaction) => {
    const actions = reaction.actions.map(actionToFigma)
    return { trigger: triggerToFigma(reaction), action: actions[0], actions }
  })
}

function actionFromFigma(value: unknown): PrototypeAction {
  const parsed = v.safeParse(actionSchema, value)
  if (!parsed.success) {
    const type = v.safeParse(v.object({ type: v.string() }), value)
    throw new Error(
      type.success
        ? `Kalka does not play ${type.output.type} actions yet; it plays NODE, BACK, CLOSE and URL`
        : 'An action needs a type'
    )
  }
  const action = parsed.output
  if (action.type === 'URL')
    return { type: 'URL', url: action.url, openInNewTab: action.openInNewTab ?? true }
  if (action.type !== 'NODE') return { type: action.type }
  const transition = action.transition
  return {
    type: 'NODE',
    destinationId: action.destinationId,
    navigation: action.navigation,
    transition: transition
      ? {
          type: transition.type === 'SCROLL_ANIMATE' ? 'SMART_ANIMATE' : transition.type,
          direction: transition.direction ?? 'LEFT',
          matchLayers: transition.matchLayers ?? false,
          duration: transition.duration,
          easing: easingFromFigma(transition.easing)
        }
      : null,
    preserveScrollPosition: action.preserveScrollPosition ?? false,
    resetScrollPosition: action.resetScrollPosition ?? false,
    overlayRelativePosition: action.overlayRelativePosition
      ? { ...action.overlayRelativePosition }
      : null
  }
}

/**
 * Interactions given in the Plugin API's shape, as the scene graph keeps them. A reaction with no
 * trigger, which Figma keeps while one is being made, is left out: it never runs.
 */
export function reactionsFromFigma(value: unknown): PrototypeReaction[] {
  if (!Array.isArray(value)) throw new Error('reactions must be an array')
  return value.flatMap((item): PrototypeReaction[] => {
    const parsed = v.safeParse(reactionSchema, item)
    if (!parsed.success) throw new Error(`Invalid reaction: ${v.summarize(parsed.issues)}`)
    const { trigger, action, actions } = parsed.output
    if (!trigger) return []
    const given = actions ?? (action ? [action] : [])
    return [
      {
        trigger: {
          type: trigger.type,
          delay: trigger.type === 'AFTER_TIMEOUT' ? (trigger.timeout ?? 0) : (trigger.delay ?? 0),
          keyCodes: [...(trigger.keyCodes ?? [])]
        },
        actions: given.map(actionFromFigma)
      }
    ]
  })
}

const flowSchema = v.array(v.object({ nodeId: v.string(), name: v.string() }))

export function installPrototypeAccessors(prototype: object, internals: NodeProxyInternals): void {
  Object.defineProperties(prototype, {
    reactions: {
      get(this: ProxyThis) {
        return Object.freeze(reactionsToFigma(raw(this, internals).reactions))
      },
      set(this: ProxyThis, value: unknown) {
        updateNode(this, internals, { reactions: reactionsFromFigma(value) })
      }
    },
    setReactionsAsync: {
      value(this: ProxyThis, value: unknown): Promise<void> {
        try {
          updateNode(this, internals, { reactions: reactionsFromFigma(value) })
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      }
    },
    // A page's flows, in order, each by the frame it starts at.
    flowStartingPoints: {
      get(this: ProxyThis) {
        const node = raw(this, internals)
        if (node.type !== 'CANVAS') return undefined
        return Object.freeze(
          flowStartingPoints(graph(this, internals), node.id).map((flow) => ({
            nodeId: flow.node.id,
            name: flow.startingPoint.name
          }))
        )
      },
      set(this: ProxyThis, value: unknown) {
        const page = raw(this, internals)
        if (page.type !== 'CANVAS') throw new Error('flowStartingPoints is a page property')
        const parsed = v.safeParse(flowSchema, value)
        if (!parsed.success) throw new Error('flowStartingPoints takes { nodeId, name } entries')
        assertProxyEditable(this, internals)
        const scene = graph(this, internals)
        const wanted = new Map(parsed.output.map((flow) => [flow.nodeId, flow.name]))
        for (const id of wanted.keys())
          if (scene.getNode(id)?.parentId !== page.id)
            throw new Error(`A flow starts at a top-level frame of the page; ${id} is not one`)
        let position: string | null = null
        const order = new Map<string, string>()
        for (const id of wanted.keys()) {
          position = orderKeyBetween(position, null)
          order.set(id, position)
        }
        for (const child of scene.getChildren(page.id)) {
          const name = wanted.get(child.id)
          const at = order.get(child.id)
          if (name === undefined || at === undefined) {
            if (child.prototypeStartingPoint)
              scene.updateNode(child.id, { prototypeStartingPoint: null })
            continue
          }
          scene.updateNode(child.id, {
            prototypeStartingPoint: {
              name,
              description: child.prototypeStartingPoint?.description ?? '',
              position: at
            }
          })
        }
      }
    }
  })
}
