import {
  createPrototypeTransition,
  formatPrototypeExpression,
  type PrototypeAction,
  type PrototypeEasing,
  type PrototypeExpression,
  type PrototypeReaction,
  type PrototypeTransition,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import type { JSXProp, JSXValue } from './value'

/**
 * A layer's prototype interactions as the `interactions` prop renders them back: the layers,
 * variables and modes they name by name, and only what differs from the defaults the renderer
 * fills in. An action whose layer, variable or mode is gone is left out.
 */

type JSXObject = { [key: string]: JSXValue | undefined }

const present = (values: (JSXObject | null)[]) =>
  values.filter((value): value is JSXObject => value !== null)

const DIRECTIONAL = new Set(['MOVE_IN', 'MOVE_OUT', 'PUSH', 'SLIDE_IN', 'SLIDE_OUT'])

/** An easing as JSX writes it: its name, with its curve or spring when custom; none for the default. */
function easingValue(easing: PrototypeEasing, defaultType: string): JSXValue | undefined {
  if (easing.bezier || easing.spring)
    return {
      type: easing.type,
      bezier: easing.bezier ? { ...easing.bezier } : undefined,
      spring: easing.spring ? { ...easing.spring } : undefined
    }
  return easing.type === defaultType ? undefined : easing.type
}

function transitionValue(transition: PrototypeTransition): JSXObject {
  const base = createPrototypeTransition(transition.type)
  return {
    type: transition.type,
    direction: DIRECTIONAL.has(transition.type) ? transition.direction : undefined,
    duration: transition.duration === base.duration ? undefined : transition.duration,
    easing: easingValue(transition.easing, base.easing.type),
    matchLayers: transition.matchLayers || undefined
  }
}

const NAVIGATION_KEYS = {
  NAVIGATE: 'navigate',
  OVERLAY: 'overlay',
  SWAP: 'swap',
  SCROLL_TO: 'scrollTo',
  CHANGE_TO: 'changeTo'
} as const

class InteractionWriter {
  constructor(private readonly graph: SceneGraph) {}

  private name(id: string | null): string | undefined {
    return id ? this.graph.getNode(id)?.name : undefined
  }

  private expression(expression: PrototypeExpression): string {
    const { variables, variableCollections } = this.graph
    return formatPrototypeExpression(
      expression,
      (id) => variables.get(id)?.name ?? id,
      (id, modeId) => {
        const collectionId = variables.get(id)?.collectionId
        const collection = collectionId ? variableCollections.get(collectionId) : undefined
        return collection?.modes.find((mode) => mode.modeId === modeId)?.name ?? modeId
      }
    )
  }

  // One branch per action type, as the union lists them.
  // eslint-disable-next-line complexity
  action(action: PrototypeAction): JSXObject | null {
    switch (action.type) {
      case 'BACK':
        return { back: true }
      case 'CLOSE':
        return { close: true }
      case 'URL':
        return { url: action.url, newTab: action.openInNewTab ? undefined : false }
      case 'NODE': {
        const destination = this.name(action.destinationId)
        if (destination === undefined) return null
        return {
          [NAVIGATION_KEYS[action.navigation]]: destination,
          transition: action.transition ? transitionValue(action.transition) : undefined,
          preserveScroll: action.preserveScrollPosition || undefined,
          resetScroll: action.resetScrollPosition || undefined,
          position: action.overlayRelativePosition
            ? { ...action.overlayRelativePosition }
            : undefined
        }
      }
      case 'SET_VARIABLE': {
        const variable = action.variableId ? this.graph.variables.get(action.variableId) : undefined
        if (!variable || !action.value) return null
        return { set: variable.name, to: this.expression(action.value) }
      }
      case 'SET_VARIABLE_MODE': {
        const collection = action.collectionId
          ? this.graph.variableCollections.get(action.collectionId)
          : undefined
        const mode = collection?.modes.find((candidate) => candidate.modeId === action.modeId)
        return collection && mode ? { mode: mode.name, collection: collection.name } : null
      }
      case 'CONDITIONAL':
        return {
          conditional: action.blocks.map((block) => ({
            if: block.condition ? this.expression(block.condition) : undefined,
            actions: this.actions(block.actions)
          }))
        }
      case 'UPDATE_MEDIA_RUNTIME': {
        const seconds = action.mediaAction === 'SKIP_TO' ? action.newTimestamp : action.amountToSkip
        return {
          media: action.mediaAction,
          target: this.name(action.destinationId),
          seconds: seconds > 0 ? seconds : undefined
        }
      }
      default: {
        const exhaustive: never = action
        return exhaustive
      }
    }
  }

  actions(actions: readonly PrototypeAction[]): JSXObject[] {
    return present(actions.map((action) => this.action(action)))
  }

  interaction(reaction: PrototypeReaction): JSXObject | null {
    const actions = this.actions(reaction.actions)
    if (actions.length === 0) return null
    const { trigger } = reaction
    return {
      trigger: trigger.type === 'ON_CLICK' ? undefined : trigger.type,
      delay: trigger.delay > 0 ? trigger.delay : undefined,
      keys: trigger.keyCodes.length > 0 ? [...trigger.keyCodes] : undefined,
      at: trigger.type === 'ON_MEDIA_HIT' ? trigger.mediaHitTime : undefined,
      actions
    }
  }
}

/** The `interactions` prop of a layer with interactions. */
export function collectInteractionProps(node: SceneNode, graph: SceneGraph, props: JSXProp[]) {
  if (node.reactions.length === 0) return
  const writer = new InteractionWriter(graph)
  const interactions = present(node.reactions.map((reaction) => writer.interaction(reaction)))
  if (interactions.length > 0) props.push(['interactions', interactions])
}
