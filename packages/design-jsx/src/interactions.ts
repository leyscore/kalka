import * as v from 'valibot'

import {
  createNodeAction,
  createPrototypeTransition,
  parsePrototypeExpression,
  PROTOTYPE_DIRECTIONS,
  PROTOTYPE_EASING_TYPES,
  PROTOTYPE_MEDIA_ACTIONS,
  PROTOTYPE_TRANSITION_TYPES,
  PROTOTYPE_TRIGGER_TYPES,
  type PrototypeAction,
  type PrototypeEasing,
  type PrototypeExpression,
  type PrototypeNavigation,
  type PrototypeReaction,
  type PrototypeTransition,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { RenderOptions } from './types'
import { parseScriptInput } from './validation'

/**
 * Prototype interactions in design JSX: `interactions={[{ trigger: 'ON_CLICK', actions: [{
 * navigate: 'Details', transition: { type: 'SMART_ANIMATE' } }] }]}`. Triggers, transitions and
 * easings take Figma's names; layers, variables and modes go by name, and the layers an action
 * goes to are found once the whole tree has rendered, so an interaction can point at a frame
 * written after it. Times are in seconds, as Figma's Plugin API writes them.
 */

const easingSchema = v.union([
  v.picklist(PROTOTYPE_EASING_TYPES),
  v.strictObject({
    type: v.picklist(PROTOTYPE_EASING_TYPES),
    bezier: v.optional(
      v.strictObject({ x1: v.number(), y1: v.number(), x2: v.number(), y2: v.number() })
    ),
    spring: v.optional(
      v.strictObject({
        mass: v.number(),
        stiffness: v.number(),
        damping: v.number(),
        initialVelocity: v.optional(v.number())
      })
    )
  })
])

const transitionSchema = v.strictObject({
  type: v.picklist(PROTOTYPE_TRANSITION_TYPES),
  direction: v.optional(v.picklist(PROTOTYPE_DIRECTIONS)),
  duration: v.optional(v.pipe(v.number(), v.minValue(0))),
  easing: v.optional(easingSchema),
  matchLayers: v.optional(v.boolean())
})

const layerName = v.pipe(v.string(), v.minLength(1))
const animated = { transition: v.optional(transitionSchema) }

export type JSXInteractionAction =
  | { navigate: string; transition?: JSXTransition; preserveScroll?: boolean }
  | { overlay: string; transition?: JSXTransition; position?: Vector }
  | { swap: string; transition?: JSXTransition }
  | { scrollTo: string; transition?: JSXTransition }
  | { changeTo: string; transition?: JSXTransition; resetScroll?: boolean }
  | { back: true }
  | { close: true }
  | { url: string; newTab?: boolean }
  | { set: string; to: string }
  | { mode: string; collection: string }
  | { conditional: { if?: string; actions: JSXInteractionAction[] }[] }
  | { media: (typeof PROTOTYPE_MEDIA_ACTIONS)[number]; target?: string; seconds?: number }

export type JSXTransition = v.InferOutput<typeof transitionSchema>
export type JSXEasing = v.InferOutput<typeof easingSchema>

const actionSchema: v.GenericSchema<JSXInteractionAction> = v.union([
  v.strictObject({ navigate: layerName, ...animated, preserveScroll: v.optional(v.boolean()) }),
  v.strictObject({
    overlay: layerName,
    ...animated,
    position: v.optional(v.strictObject({ x: v.number(), y: v.number() }))
  }),
  v.strictObject({ swap: layerName, ...animated }),
  v.strictObject({ scrollTo: layerName, ...animated }),
  v.strictObject({ changeTo: layerName, ...animated, resetScroll: v.optional(v.boolean()) }),
  v.strictObject({ back: v.literal(true) }),
  v.strictObject({ close: v.literal(true) }),
  v.strictObject({ url: v.string(), newTab: v.optional(v.boolean()) }),
  v.strictObject({ set: layerName, to: v.string() }),
  v.strictObject({ mode: layerName, collection: layerName }),
  v.strictObject({
    conditional: v.array(
      v.strictObject({
        if: v.optional(v.string()),
        actions: v.array(v.lazy(() => actionSchema))
      })
    )
  }),
  v.strictObject({
    media: v.picklist(PROTOTYPE_MEDIA_ACTIONS),
    target: v.optional(layerName),
    seconds: v.optional(v.pipe(v.number(), v.minValue(0)))
  })
])

const interactionSchema = v.strictObject({
  trigger: v.optional(v.picklist(PROTOTYPE_TRIGGER_TYPES), 'ON_CLICK'),
  /** After delay: the wait; mouse enter, leave, down and up: their delay. */
  delay: v.optional(v.pipe(v.number(), v.minValue(0))),
  /** Key/gamepad: the key codes pressed together. */
  keys: v.optional(v.array(v.pipe(v.number(), v.integer()))),
  /** Video hits: the time in the layer's video. */
  at: v.optional(v.pipe(v.number(), v.minValue(0))),
  actions: v.array(actionSchema)
})

export type JSXInteraction = v.InferInput<typeof interactionSchema>

const interactionsSchema = v.array(interactionSchema)

/** An element's `interactions` prop, checked; throws with every problem and where it is. */
export function parseInteractions(value: unknown): v.InferOutput<typeof interactionsSchema> {
  return parseScriptInput('Invalid interactions', interactionsSchema, value)
}

/** Layers an interaction names, looked up among those the render made first. */
export interface InteractionLookup {
  layer(name: string): string | undefined
}

/**
 * Finds layers by name: first among the rendered roots and their layers, in tree order, then
 * on the page they were rendered on, then anywhere in the document.
 */
export function createInteractionLookup(
  graph: SceneGraph,
  rootIds: readonly string[],
  pageId: string | undefined
): InteractionLookup {
  const inTree = (ids: readonly string[], name: string): string | undefined => {
    for (const id of ids) {
      const node = graph.getNode(id)
      if (!node) continue
      if (node.name === name) return node.id
      const found = inTree(node.childIds, name)
      if (found) return found
    }
    return undefined
  }
  return {
    layer: (name) =>
      inTree(rootIds, name) ??
      (pageId ? inTree(graph.getNode(pageId)?.childIds ?? [], name) : undefined) ??
      inTree(
        graph.getPages().map((page) => page.id),
        name
      )
  }
}

function easingOf(easing: JSXEasing | undefined): PrototypeEasing | undefined {
  if (easing === undefined) return undefined
  if (typeof easing === 'string') return { type: easing, bezier: null, spring: null }
  return { type: easing.type, bezier: easing.bezier ?? null, spring: easing.spring ?? null }
}

function transitionOf(transition: JSXTransition | undefined): PrototypeTransition | null {
  if (!transition) return null
  const base = createPrototypeTransition(transition.type)
  return {
    ...base,
    direction: transition.direction ?? base.direction,
    duration: transition.duration ?? base.duration,
    easing: easingOf(transition.easing) ?? base.easing,
    matchLayers: transition.matchLayers ?? base.matchLayers
  }
}

const NAVIGATIONS = {
  navigate: 'NAVIGATE',
  overlay: 'OVERLAY',
  swap: 'SWAP',
  scrollTo: 'SCROLL_TO',
  changeTo: 'CHANGE_TO'
} as const satisfies Record<string, PrototypeNavigation>

/** Turns JSX interactions into a layer's interactions, naming what it cannot find. */
class InteractionResolver {
  readonly warnings: string[] = []

  constructor(
    private readonly graph: SceneGraph,
    private readonly lookup: InteractionLookup,
    private readonly owner: string
  ) {}

  private layer(name: string): string | null {
    const id = this.lookup.layer(name)
    if (!id) this.warnings.push(`<${this.owner}> interaction: no layer named "${name}".`)
    return id ?? null
  }

  private variable(name: string): string | undefined {
    for (const variable of this.graph.variables.values())
      if (variable.name === name) return variable.id
    return undefined
  }

  private expression(text: string): PrototypeExpression | null {
    const result = parsePrototypeExpression(
      text,
      (name) => this.variable(name),
      (variableId, name) => {
        const collectionId = this.graph.variables.get(variableId)?.collectionId
        const collection = collectionId
          ? this.graph.variableCollections.get(collectionId)
          : undefined
        return collection?.modes.find((mode) => mode.name === name)?.modeId
      }
    )
    if ('expression' in result) return result.expression
    this.warnings.push(
      result.error === 'unknown'
        ? `<${this.owner}> interaction: no variable named "${result.name}".`
        : `<${this.owner}> interaction: "${text}" is not a valid expression.`
    )
    return null
  }

  private nodeAction(
    navigation: PrototypeNavigation,
    destination: string,
    transition: JSXTransition | undefined
  ) {
    return {
      ...createNodeAction(this.layer(destination), navigation),
      transition: transitionOf(transition)
    }
  }

  private setMode(modeName: string, collectionName: string): PrototypeAction {
    const collection = [...this.graph.variableCollections.values()].find(
      (candidate) => candidate.name === collectionName
    )
    const mode = collection?.modes.find((candidate) => candidate.name === modeName)
    if (!collection)
      this.warnings.push(`<${this.owner}> interaction: no collection named "${collectionName}".`)
    else if (!mode)
      this.warnings.push(
        `<${this.owner}> interaction: "${collectionName}" has no mode named "${modeName}".`
      )
    return {
      type: 'SET_VARIABLE_MODE',
      collectionId: collection?.id ?? null,
      modeId: mode?.modeId ?? null
    }
  }

  // One branch per action kind, as the union lists them.
  // eslint-disable-next-line complexity
  action(action: JSXInteractionAction): PrototypeAction {
    if ('navigate' in action)
      return {
        ...this.nodeAction(NAVIGATIONS.navigate, action.navigate, action.transition),
        preserveScrollPosition: action.preserveScroll ?? false
      }
    if ('overlay' in action)
      return {
        ...this.nodeAction(NAVIGATIONS.overlay, action.overlay, action.transition),
        overlayRelativePosition: action.position ? { ...action.position } : null
      }
    if ('swap' in action) return this.nodeAction(NAVIGATIONS.swap, action.swap, action.transition)
    if ('scrollTo' in action)
      return this.nodeAction(NAVIGATIONS.scrollTo, action.scrollTo, action.transition)
    if ('changeTo' in action)
      return {
        ...this.nodeAction(NAVIGATIONS.changeTo, action.changeTo, action.transition),
        resetScrollPosition: action.resetScroll ?? false
      }
    if ('back' in action) return { type: 'BACK' }
    if ('close' in action) return { type: 'CLOSE' }
    if ('url' in action)
      return { type: 'URL', url: action.url, openInNewTab: action.newTab ?? true }
    if ('set' in action) {
      const variableId = this.variable(action.set) ?? null
      if (!variableId)
        this.warnings.push(`<${this.owner}> interaction: no variable named "${action.set}".`)
      return { type: 'SET_VARIABLE', variableId, value: this.expression(action.to) }
    }
    if ('mode' in action) return this.setMode(action.mode, action.collection)
    if ('conditional' in action)
      return {
        type: 'CONDITIONAL',
        blocks: action.conditional.map((block) => ({
          condition: block.if === undefined ? null : this.expression(block.if),
          actions: block.actions.map((item) => this.action(item))
        }))
      }
    const seconds = action.seconds ?? 0
    return {
      type: 'UPDATE_MEDIA_RUNTIME',
      destinationId: action.target === undefined ? null : this.layer(action.target),
      mediaAction: action.media,
      amountToSkip: action.media === 'SKIP_TO' ? 0 : seconds,
      newTimestamp: action.media === 'SKIP_TO' ? seconds : 0
    }
  }
}

/** A rendered layer and the interactions its element asked for. */
export interface PendingInteractions {
  nodeId: string
  interactions: v.InferOutput<typeof interactionsSchema>
}

/**
 * Gives each rendered layer the interactions its element wrote, once every layer exists, and
 * returns a warning for each layer, variable or mode an interaction names that it cannot find.
 */
export function applyInteractions(
  graph: SceneGraph,
  pending: readonly PendingInteractions[],
  lookup: InteractionLookup
): string[] {
  const warnings: string[] = []
  for (const { nodeId, interactions } of pending) {
    const node: SceneNode | undefined = graph.getNode(nodeId)
    if (!node) continue
    const resolver = new InteractionResolver(graph, lookup, node.name || node.type)
    const reactions: PrototypeReaction[] = interactions.map((interaction) => ({
      trigger: {
        type: interaction.trigger,
        delay: interaction.delay ?? 0,
        keyCodes: interaction.keys ?? [],
        ...(interaction.at === undefined ? {} : { mediaHitTime: interaction.at })
      },
      actions: interaction.actions.map((action) => resolver.action(action))
    }))
    graph.updateNode(nodeId, { reactions })
    warnings.push(...resolver.warnings)
  }
  return warnings
}

/** The page a layer is on, or the page itself. */
function pageOf(graph: SceneGraph, id: string): string | undefined {
  let node = graph.getNode(id)
  while (node && node.type !== 'CANVAS')
    node = node.parentId ? graph.getNode(node.parentId) : undefined
  return node?.id
}

/**
 * Collects the interactions of the layers a render makes, through its `onNode`, and sets them
 * once the roots exist: `apply` returns the warnings of what they name but cannot find.
 */
export function collectInteractions(graph: SceneGraph, next?: RenderOptions['onNode']) {
  const pending: PendingInteractions[] = []
  const onNode: NonNullable<RenderOptions['onNode']> = (element, node) => {
    if (element.props.interactions !== undefined)
      pending.push({ nodeId: node.id, interactions: parseInteractions(element.props.interactions) })
    next?.(element, node)
  }
  /** Sets them on `roots`' layers; the warnings go on the first root, where callers read them. */
  const apply = (roots: readonly SceneNode[], parentId: string) => {
    const ids = roots.map((root) => root.id)
    return applyInteractions(
      graph,
      pending,
      createInteractionLookup(graph, ids, pageOf(graph, parentId))
    )
  }
  return { onNode, apply }
}
