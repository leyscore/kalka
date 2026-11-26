import * as v from 'valibot'

import { KalkaAPI, type StrokeDrawChange } from '#core/kalka-api'
import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'
import { STROKE_BRUSHES, STROKE_WIDTH_PRESET_IDS } from '#core/vector/stroke-outline'

const BRUSHES = [
  ...STROKE_BRUSHES.STRETCH.map((id) => `STRETCH:${id}`),
  ...STROKE_BRUSHES.SCATTER.map((id) => `SCATTER:${id}`)
]

export const setStrokeDraw = defineTool({
  name: 'set_stroke_draw',
  description:
    "Set a vector's or line's Figma Draw stroke: a width profile that thickens and thins it " +
    'along the path, and a brush it is drawn with. Leave a field out to keep it; "uniform" ' +
    'and "none" clear them. Returns the width profile points and the brush.',
  execution: { kind: 'sync', mutation: 'properties' },
  input: v.strictObject({
    id: nodeIdInput,
    width_profile: v.optional(
      v.pipe(v.picklist(STROKE_WIDTH_PRESET_IDS), v.description('Width profile preset'))
    ),
    brush: v.optional(
      v.pipe(
        v.picklist(['none', ...BRUSHES]),
        v.description(
          'Brush as TYPE:id: a stretch brush bends one shape along the path, a scatter brush drops copies'
        )
      )
    )
  }),
  execute: (figma, { id, width_profile, brush }) => {
    try {
      const change: StrokeDrawChange = {}
      if (width_profile) change.widthProfile = width_profile
      if (brush) change.brush = brush === 'none' ? null : brush
      return { id, ...new KalkaAPI(figma).setStrokeDraw(id, change) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }
})
