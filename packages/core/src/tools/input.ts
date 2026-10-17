import * as v from 'valibot'

export const nodeIdInput = v.pipe(v.string(), v.description('Node ID'))
export const nodeInput = v.strictObject({ id: nodeIdInput })
export const nodeComparisonInput = v.strictObject({
  from: v.pipe(v.string(), v.description('Source node ID')),
  to: v.pipe(v.string(), v.description('Target node ID'))
})

export function nodeTraversalInput(depthDescription: string) {
  return v.strictObject({
    id: nodeIdInput,
    depth: v.optional(toolNumber(v.pipe(v.number(), v.description(depthDescription))))
  })
}
export const positionInputs = {
  x: toolNumber(v.pipe(v.number(), v.description('X position in the parent, or on the page'))),
  y: toolNumber(v.pipe(v.number(), v.description('Y position in the parent, or on the page')))
}

/** Reuse a native number schema for both numeric and numeric-string agent inputs. */
export function toolNumber(schema: v.GenericSchema<number, number> = v.number()) {
  // JSON Schema numbers are finite. Express that with representable bounds as well as at runtime.
  const finite = v.pipe(schema, v.minValue(-Number.MAX_VALUE), v.maxValue(Number.MAX_VALUE))
  return v.union([
    finite,
    v.pipe(
      v.string(),
      v.regex(/\S/, 'Expected a nonblank numeric string'),
      v.description(v.getDescription(schema) ?? 'Numeric value'),
      v.transform(Number),
      finite
    )
  ])
}

/** A node ID as Figma's MCP tools take it: `1:2`, or `1-2` as the `node-id` of Figma links. */
export const figmaNodeIdInput = v.pipe(
  v.string(),
  v.transform((id) => id.trim().replace(/^(\d+)-(\d+)$/, '$1:$2')),
  v.description('Node ID such as 1:2 (the 1-2 form of Figma links also works)')
)

/**
 * Arguments Figma's MCP tools take that Kalka has no use for, accepted so that calls written for
 * Figma run unchanged: Kalka reads the open document and does not tailor results to a stack.
 */
export const figmaClientInputs = {
  fileKey: v.optional(
    v.pipe(v.string(), v.description('Figma file key; ignored, Kalka reads the open document'))
  ),
  clientLanguages: v.optional(
    v.pipe(v.string(), v.description('Languages of the client project; accepted and ignored'))
  ),
  clientFrameworks: v.optional(
    v.pipe(v.string(), v.description('Frameworks of the client project; accepted and ignored'))
  )
}
