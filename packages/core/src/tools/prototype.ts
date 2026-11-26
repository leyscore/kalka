import * as v from 'valibot'

import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

/**
 * Prototyping for agents: a layer's interactions read and set in the Plugin API's `reactions`
 * shape, which `figma` scripts use too, and a page's flows. Setting goes through the same
 * accessors, so what Kalka cannot play is refused with why.
 */

const REACTIONS_HELP =
  'Interactions in the Figma Plugin API shape: [{ trigger: { type: "ON_CLICK" | "ON_HOVER" | ' +
  '"ON_PRESS" | "ON_DRAG" | "AFTER_TIMEOUT" (timeout s) | "MOUSE_ENTER" | "MOUSE_LEAVE" | ' +
  '"MOUSE_DOWN" | "MOUSE_UP" (delay s) | "ON_KEY_DOWN" (keyCodes) | "ON_MEDIA_HIT" ' +
  '(mediaHitTime s, in the video of the layer) | "ON_MEDIA_END" }, actions: [...] }]. Actions: ' +
  '{ type: "NODE", destinationId, navigation: "NAVIGATE" | "OVERLAY" | "SWAP" | "SCROLL_TO" | ' +
  '"CHANGE_TO", transition: null | { type: "DISSOLVE" | "SMART_ANIMATE" | "MOVE_IN" | ' +
  '"MOVE_OUT" | "PUSH" | "SLIDE_IN" | "SLIDE_OUT", direction?, duration (s), easing: { type } } }, ' +
  '{ type: "BACK" }, { type: "CLOSE" }, { type: "URL", url, openInNewTab? }, ' +
  '{ type: "SET_VARIABLE", variableId, variableValue: VariableData }, ' +
  '{ type: "SET_VARIABLE_MODE", variableCollectionId, variableModeId }, ' +
  '{ type: "CONDITIONAL", conditionalBlocks: [{ condition?: VariableData, actions }] }, ' +
  '{ type: "UPDATE_MEDIA_RUNTIME", destinationId (a layer with a video paint; null for this ' +
  'one), mediaAction: "PLAY" | "PAUSE" | "TOGGLE_PLAY_PAUSE" | "MUTE" | "UNMUTE" | ' +
  '"TOGGLE_MUTE_UNMUTE" | "SKIP_FORWARD" | "SKIP_BACKWARD" (amountToSkip s) | "SKIP_TO" ' +
  '(newTimestamp s) }. ' +
  'VariableData: { type: "FLOAT" | "STRING" | "BOOLEAN" | "COLOR", value } | ' +
  '{ type: "VARIABLE_ALIAS", value: { type: "VARIABLE_ALIAS", id } } | ' +
  '{ type: "EXPRESSION", value: { expressionFunction: "ADDITION" | "SUBTRACTION" | ' +
  '"MULTIPLICATION" | "DIVISION" | "EQUALS" | "NOT_EQUAL" | "LESS_THAN" | ' +
  '"LESS_THAN_OR_EQUAL" | "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "AND" | "OR" | "NOT" | ' +
  '"NEGATE", expressionArguments: [VariableData] } }. An empty list removes every interaction.'

export const getInteractions = defineTool({
  name: 'get_interactions',
  description:
    "Read a layer's prototype interactions (triggers and actions) in the Figma Plugin API " +
    'reactions shape, and the flow that starts at it when it is a frame.',
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({ id: nodeIdInput }),
  execute: (figma, { id }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    const flow = figma.currentPage.flowStartingPoints?.find((start) => start.nodeId === id)
    return { id, reactions: node.reactions, ...(flow ? { flow: flow.name } : {}) }
  }
})

export const setInteractions = defineTool({
  name: 'set_interactions',
  description:
    "Replace a layer's prototype interactions: what a click, hover, key or delay does when the " +
    'page is presented (navigate, overlays, scroll to, change to a variant, back, links, set ' +
    'variables and modes, conditionals). Read them first with get_interactions to edit one.',
  execution: { kind: 'sync', mutation: 'properties' },
  input: v.strictObject({
    id: nodeIdInput,
    reactions: v.pipe(v.array(v.record(v.string(), v.unknown())), v.description(REACTIONS_HELP))
  }),
  execute: (figma, { id, reactions }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    try {
      node.reactions = reactions
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
    return { id, reactions: node.reactions }
  }
})

export const setPrototypeFlows = defineTool({
  name: 'set_prototype_flows',
  description:
    "Set the current page's prototype flows, in order: each starts at a top-level frame and is " +
    'what Present plays first. An empty list removes them.',
  execution: { kind: 'sync', mutation: 'properties' },
  input: v.strictObject({
    flows: v.pipe(
      v.array(v.strictObject({ node_id: nodeIdInput, name: v.pipe(v.string(), v.minLength(1)) })),
      v.description('Flows in order, by the frame each starts at')
    )
  }),
  execute: (figma, { flows }) => {
    try {
      figma.currentPage.flowStartingPoints = flows.map((flow) => ({
        nodeId: flow.node_id,
        name: flow.name
      }))
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
    return { flows: figma.currentPage.flowStartingPoints }
  }
})
