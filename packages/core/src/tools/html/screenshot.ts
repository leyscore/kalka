import * as v from 'valibot'

import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'
import { exportImage, rasterScaleInputs } from '#core/tools/vector/export'

export const getScreenshot = defineTool({
  name: 'get_screenshot',
  description:
    'See a layer as it looks: a PNG of the layer, or of the whole current page when no id is given. Use after writing or restyling to check the result.',
  execution: { kind: 'async', mutation: 'none' },
  output: 'file',
  exposure: { webmcp: false },
  input: v.strictObject({
    id: v.optional(nodeIdInput),
    ...rasterScaleInputs
  }),
  execute: (figma, { id, scale, maxEdge }) =>
    exportImage.execute(figma, { ids: id ? [id] : undefined, format: 'PNG', scale, maxEdge })
})
