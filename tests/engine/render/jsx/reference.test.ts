import { expect, test } from 'bun:test'

import {
  JSX_REFERENCE as BARREL_REFERENCE,
  CODEGEN_PROMPT as BARREL_CODEGEN
} from '@open-pencil/core'
import { AUTHORING_EXAMPLES, JSX_REFERENCE, renderJSX } from '@open-pencil/core/design-jsx'
import { CODEGEN_PROMPT } from '@open-pencil/core/tools'

import SYSTEM_PROMPT from '@/app/ai/chat/system-prompt'

import { getNodeOrThrow } from '#tests/helpers/assert'
import { makeSceneGraph } from '#tests/helpers/scene'

for (const example of AUTHORING_EXAMPLES) {
  test(`shared authoring example: ${example.title}`, async () => {
    const graph = makeSceneGraph()
    graph.addCollection({
      id: 'tokens',
      name: 'Tokens',
      modes: [{ modeId: 'default', name: 'Default' }],
      defaultModeId: 'default',
      variableIds: []
    })
    for (const [name, value] of [
      ['Space/small', 8],
      ['Space/medium', 16],
      ['Type/body', 12]
    ] as const) {
      graph.addVariable({
        id: name,
        name,
        type: 'FLOAT',
        collectionId: 'tokens',
        valuesByMode: { default: value },
        description: '',
        hiddenFromPublishing: false
      })
    }
    const [result] = await renderJSX(graph, example.jsx)
    const frame = getNodeOrThrow(graph, result.id)
    expect(frame.width).toBe(280)
    expect(frame.height).toBeGreaterThan(32)
    expect(frame.layoutMode).toBe('VERTICAL')
    expect(graph.getChildren(frame.id).every((child) => child.type === 'TEXT')).toBe(true)
    expect(JSX_REFERENCE).toContain(example.jsx)
  })
}

test('public exports and runtime prompts use the same authoring reference', () => {
  expect(BARREL_REFERENCE).toBe(JSX_REFERENCE)
  expect(BARREL_CODEGEN).toBe(CODEGEN_PROMPT)
  expect(CODEGEN_PROMPT).toContain(JSX_REFERENCE)
  expect(SYSTEM_PROMPT).toContain(JSX_REFERENCE)
  expect(CODEGEN_PROMPT.split(JSX_REFERENCE)).toHaveLength(2)
  expect(SYSTEM_PROMPT.split(JSX_REFERENCE)).toHaveLength(2)
})
