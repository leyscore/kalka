import {
  flowStartingPoints,
  type PrototypeAction,
  type PrototypeReaction,
  type PrototypeTransition,
  type PrototypeTriggerType,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

/**
 * Presenting a prototype, as Figma plays one: a screen (a top-level frame) with overlays over
 * it, a history to go back through, and instances changed to other variants. Interactions run
 * here as pure steps on that state; the presenter draws each state and plays its transition.
 */

export interface PresentOverlay {
  frameId: string
  /** The layer that opened it, which a manual position is relative to. */
  triggerId: string | null
  /** Manual position: top-left from the trigger's top-left; null for the frame's own position. */
  offset: Vector | null
  /** How it opened, played backwards when it closes. */
  transition: PrototypeTransition | null
}

export interface PresentHistoryEntry {
  screenId: string
  /** How the screen after it arrived, played backwards when going back. */
  transition: PrototypeTransition | null
}

export interface PresentState {
  pageId: string
  /** The frame the presentation started at, which Restart returns to. */
  startId: string
  screenId: string
  history: PresentHistoryEntry[]
  overlays: PresentOverlay[]
  /**
   * Change to: the variant values each changed instance shows, by its screen or overlay frame
   * and its layer path below it.
   */
  variants: Record<string, Record<string, Record<string, string>>>
}

/** What a step changed, for the presenter to animate. */
export type PresentStep =
  | {
      kind: 'screen'
      from: string
      to: string
      transition: PrototypeTransition | null
      /** Going back: the transition plays backwards. */
      back: boolean
    }
  | { kind: 'overlay'; frameId: string; transition: PrototypeTransition | null; open: boolean }
  | { kind: 'variant'; rootId: string; path: string; transition: PrototypeTransition | null }
  | { kind: 'scroll'; nodeId: string; transition: PrototypeTransition | null }
  | { kind: 'url'; url: string; newTab: boolean }

/** The top-level frame of the page that holds a layer. */
export function screenOf(graph: SceneGraph, nodeId: string): SceneNode | undefined {
  let found: SceneNode | undefined
  graph.closest(nodeId, (node) => {
    const parent = node.parentId ? graph.getNode(node.parentId) : undefined
    if (parent?.type === 'CANVAS') {
      found = node
      return true
    }
    return false
  })
  return found
}

/**
 * Where presenting starts: the selected layer's screen, else the page's first flow, else its
 * first frame. Null when the page has no frame.
 */
export function presentationStart(
  graph: SceneGraph,
  pageId: string,
  selectedIds: Iterable<string>
): string | null {
  for (const id of selectedIds) {
    const screen = screenOf(graph, id)
    if (screen) return screen.id
  }
  const [flow] = flowStartingPoints(graph, pageId)
  if (flow) return flow.node.id
  const frame = graph
    .getChildren(pageId)
    .find((node) => node.visible && (node.type === 'FRAME' || node.type === 'COMPONENT'))
  return frame?.id ?? null
}

export function startPresentation(pageId: string, startId: string): PresentState {
  return { pageId, startId, screenId: startId, history: [], overlays: [], variants: {} }
}

/** The frames shown, bottom to top: the screen, then its overlays. */
export function shownFrames(state: PresentState): string[] {
  return [state.screenId, ...state.overlays.map((overlay) => overlay.frameId)]
}

/**
 * The interaction a trigger runs on a layer, looking up from the layer through the layers
 * around it, as the top-most layer with that trigger wins and others let it through. `nodeIds`
 * lists the layer and its ancestors, innermost first, in the graph the presenter draws.
 */
export function reactionFor(
  graph: SceneGraph,
  nodeIds: readonly string[],
  trigger: PrototypeTriggerType
): { nodeId: string; reaction: PrototypeReaction } | null {
  for (const id of nodeIds) {
    const node = graph.getNode(id)
    const reaction = node?.reactions.find((candidate) => candidate.trigger.type === trigger)
    if (node && reaction) return { nodeId: node.id, reaction }
  }
  return null
}

function variantValues(graph: SceneGraph, variantId: string): Record<string, string> | null {
  const variant = graph.getNode(variantId)
  if (variant?.type !== 'COMPONENT') return null
  return { ...variant.componentPropertyValues }
}

/** The set a variant belongs to. */
function setOf(graph: SceneGraph, nodeId: string): string | null {
  const node = graph.getNode(nodeId)
  const parent = node?.parentId ? graph.getNode(node.parentId) : undefined
  return parent?.type === 'COMPONENT_SET' ? parent.id : null
}

/** The main component an instance shows, through nested instances. */
function mainOf(graph: SceneGraph, instance: SceneNode): SceneNode | undefined {
  let current = instance.componentId ? graph.getNode(instance.componentId) : undefined
  while (current?.type === 'INSTANCE' && current.componentId)
    current = graph.getNode(current.componentId)
  return current
}

export interface ActionContext {
  /** The graph the presenter draws, where `triggerPath` and instances are found. */
  graph: SceneGraph
  /** The frame, screen or overlay, the trigger is in. */
  rootId: string
  /** The triggering layer and its ancestors up to the root, innermost first. */
  nodeIds: readonly string[]
  /** Layer path below the root of each of `nodeIds`. */
  pathOf: (nodeId: string) => string
}

function navigate(
  state: PresentState,
  to: string,
  transition: PrototypeTransition | null
): { state: PresentState; step: PresentStep } {
  return {
    state: {
      ...state,
      screenId: to,
      history: [...state.history, { screenId: state.screenId, transition }],
      overlays: []
    },
    step: { kind: 'screen', from: state.screenId, to, transition, back: false }
  }
}

/**
 * Runs one action of an interaction on the presentation. Returns the new state and what to
 * animate, or null when the action has nothing to do (a missing destination, nothing to go back
 * to).
 */
export function runAction(
  graph: SceneGraph,
  state: PresentState,
  action: PrototypeAction,
  context: ActionContext
): { state: PresentState; step: PresentStep } | null {
  switch (action.type) {
    case 'URL':
      return action.url
        ? { state, step: { kind: 'url', url: action.url, newTab: action.openInNewTab } }
        : null
    case 'CLOSE': {
      const top = state.overlays.at(-1)
      if (!top) return null
      return {
        state: { ...state, overlays: state.overlays.slice(0, -1) },
        step: { kind: 'overlay', frameId: top.frameId, transition: top.transition, open: false }
      }
    }
    case 'BACK': {
      const top = state.overlays.at(-1)
      if (top)
        return {
          state: { ...state, overlays: state.overlays.slice(0, -1) },
          step: { kind: 'overlay', frameId: top.frameId, transition: top.transition, open: false }
        }
      const previous = state.history.at(-1)
      if (!previous) return null
      return {
        state: {
          ...state,
          screenId: previous.screenId,
          history: state.history.slice(0, -1),
          overlays: []
        },
        step: {
          kind: 'screen',
          from: state.screenId,
          to: previous.screenId,
          transition: previous.transition,
          back: true
        }
      }
    }
    case 'NODE':
      return runNodeAction(graph, state, action, context)
    default:
      return null
  }
}

function runNodeAction(
  graph: SceneGraph,
  state: PresentState,
  action: Extract<PrototypeAction, { type: 'NODE' }>,
  context: ActionContext
): { state: PresentState; step: PresentStep } | null {
  const destination = action.destinationId ? graph.getNode(action.destinationId) : undefined
  if (!destination) return null
  const { transition } = action
  switch (action.navigation) {
    case 'NAVIGATE': {
      const screen = screenOf(graph, destination.id)
      if (!screen || screen.id === state.screenId) return null
      return navigate(state, screen.id, transition)
    }
    case 'SCROLL_TO':
      return { state, step: { kind: 'scroll', nodeId: destination.id, transition } }
    case 'OVERLAY': {
      const overlay: PresentOverlay = {
        frameId: destination.id,
        triggerId: context.nodeIds[0] ?? null,
        offset: action.overlayRelativePosition,
        transition
      }
      return {
        state: { ...state, overlays: [...state.overlays, overlay] },
        step: { kind: 'overlay', frameId: destination.id, transition, open: true }
      }
    }
    case 'SWAP': {
      // Swap overlay replaces the top overlay; with none it swaps the screen, keeping history.
      const top = state.overlays.at(-1)
      if (!top) {
        const screen = screenOf(graph, destination.id)
        if (!screen) return null
        return {
          state: { ...state, screenId: screen.id, overlays: [] },
          step: { kind: 'screen', from: state.screenId, to: screen.id, transition, back: false }
        }
      }
      return {
        state: {
          ...state,
          overlays: [
            ...state.overlays.slice(0, -1),
            { ...top, frameId: destination.id, transition }
          ]
        },
        step: { kind: 'overlay', frameId: destination.id, transition, open: true }
      }
    }
    case 'CHANGE_TO':
      return changeTo(graph, state, destination, transition, context)
    default:
      return null
  }
}

/** Change to: the instance around the trigger whose set holds the destination shows it. */
function changeTo(
  graph: SceneGraph,
  state: PresentState,
  destination: SceneNode,
  transition: PrototypeTransition | null,
  context: ActionContext
): { state: PresentState; step: PresentStep } | null {
  const values = variantValues(graph, destination.id)
  const set = setOf(graph, destination.id)
  if (!values || !set) return null
  for (const id of context.nodeIds) {
    const node = context.graph.getNode(id)
    if (node?.type !== 'INSTANCE') continue
    const main = mainOf(context.graph, node)
    if (!main || setOf(context.graph, main.id) !== set) continue
    const path = context.pathOf(node.id)
    const changed = state.variants[context.rootId] ?? {}
    return {
      state: {
        ...state,
        variants: { ...state.variants, [context.rootId]: { ...changed, [path]: values } }
      },
      step: { kind: 'variant', rootId: context.rootId, path, transition }
    }
  }
  return null
}

/** Restart: back to where the presentation started, as it was designed. */
export function restartPresentation(state: PresentState): PresentState {
  return startPresentation(state.pageId, state.startId)
}

/** Start again from another flow. */
export function presentFlow(state: PresentState, startId: string): PresentState {
  return startPresentation(state.pageId, startId)
}
