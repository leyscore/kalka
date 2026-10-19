import * as v from 'valibot'

import { computedStyleWithEngines, drawLayerWithEngines } from '#core/layout/engine'
import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

/** What an agent usually needs to check a layout: the box, flex, type and paint. */
const DEFAULT_PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'padding',
  'margin',
  'gap',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-self',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'grid-template-columns',
  'grid-template-rows',
  'overflow',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'color',
  'background-color',
  'background-image',
  'border',
  'border-radius',
  'box-shadow',
  'opacity',
  'transform'
] as const
const MAX_PROPERTIES = 200

export const getComputedStyles = defineTool({
  name: 'get_computed_styles',
  description:
    'Get the CSS the browser computed for a layer as the canvas draws it: the final values after layout, inheritance and defaults, such as resolved widths in px. Use it to check why a layout looks the way it does. Works on layers of the page shown on the canvas.',
  execution: { kind: 'async', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    id: nodeIdInput,
    properties: v.optional(
      v.pipe(
        v.array(v.pipe(v.string(), v.regex(/^-{0,2}[a-z][a-z0-9-]*$/))),
        v.maxLength(MAX_PROPERTIES),
        v.description('CSS property names; a layout and type set by default, [] for all')
      )
    )
  }),
  execute: async (figma, { id, properties }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    // An artboard the canvas holds asleep, far from the view, is woken to be read.
    await drawLayerWithEngines(figma.graph, id)
    const styles = computedStyleWithEngines(figma.graph, id, properties ?? DEFAULT_PROPERTIES)
    if (!styles) {
      return {
        error: `Layer "${id}" is not drawn on the canvas right now; show its page first`
      }
    }
    return { id, name: node.name, styles }
  }
})
