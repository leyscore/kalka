import { describe, expect, test } from 'bun:test'

// eslint-disable-next-line open-pencil/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toJsonSchema as toJSONSchema } from '@valibot/to-json-schema'

import { isAtomicTool } from '@open-pencil/core/tools'

import { ALL_TOOLS } from '#tests/helpers/tools'

describe('tool definitions', () => {
  test('all tools have unique names and native input schemas', () => {
    const names = ALL_TOOLS.map((tool) => tool.name)
    expect(new Set(names).size).toBe(names.length)
    for (const tool of ALL_TOOLS) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(typeof tool.execute).toBe('function')
      expect(toJSONSchema(tool.input, { typeMode: 'input' }).type).toBe('object')
    }
  })

  test('browser exposure is explicit and restricted to inspection or atomic property edits', () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.mutates).toBe(tool.execution.mutation !== 'none')
      if (!tool.exposure.webmcp) continue
      expect(tool.execution.mutation === 'none' || isAtomicTool(tool)).toBe(true)
      expect(
        tool.capabilities.every(
          (capability) => capability === 'document:read' || capability === 'document:write'
        )
      ).toBe(true)
    }
  })
})
