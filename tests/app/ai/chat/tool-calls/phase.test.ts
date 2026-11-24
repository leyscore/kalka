import { describe, expect, test } from 'bun:test'

import type { ToolCallPart } from '@/app/ai/chat/tool-calls/display'
import { plannedSections, toolPhase, toolSteps } from '@/app/ai/chat/tool-calls/phase'

function call(name: string, id: string): ToolCallPart {
  return {
    type: `tool-${name}`,
    toolCallId: id,
    state: 'input-available',
    input: {}
  } as ToolCallPart
}

describe('toolPhase', () => {
  test('names the step a tool belongs to', () => {
    expect(toolPhase('ask_user')).toBe('ask')
    expect(toolPhase('find_references')).toBe('references')
    expect(toolPhase('create_variable')).toBe('style')
    expect(toolPhase('get_screenshot')).toBe('check')
    expect(toolPhase('analyze_spacing')).toBe('check')
    expect(toolPhase('get_page_tree')).toBe('read')
    expect(toolPhase('render')).toBe('build')
  })

  test('counts a node edit as building, though its name starts like a lookup', () => {
    expect(toolPhase('node_resize')).toBe('build')
    expect(toolPhase('node_bounds')).toBe('read')
  })

  test('counts a tool it does not know as building', () => {
    expect(toolPhase('some_new_tool')).toBe('build')
  })
})

describe('toolSteps', () => {
  test('cuts a run where the purpose changes and keeps the order', () => {
    const steps = toolSteps([
      call('find_references', 'a'),
      call('create_variable', 'b'),
      call('add_font', 'c'),
      call('render', 'd'),
      call('get_screenshot', 'e'),
      call('render', 'f')
    ])
    expect(steps.map((step) => step.phase)).toEqual([
      'references',
      'style',
      'build',
      'check',
      'build'
    ])
    expect(steps.map((step) => step.parts.map((part) => part.toolCallId))).toEqual([
      ['a'],
      ['b', 'c'],
      ['d'],
      ['e'],
      ['f']
    ])
  })

  test('reads an MCP tool by its own name', () => {
    const [step] = toolSteps([call('mcp__kalka__find_references', 'a')])
    expect(step?.phase).toBe('references')
  })
})

describe('announced sections', () => {
  const plan = (sections: { name: string; height: number }[]) =>
    ({
      type: 'tool-plan_sections',
      toolCallId: 'plan',
      state: 'output-available',
      input: { sections },
      output: {}
    }) as ToolCallPart
  const write = (id: string, state = 'output-available') =>
    ({ type: 'tool-write_html', toolCallId: id, state, input: {} }) as ToolCallPart
  const sections = [
    { name: 'Hero', height: 700 },
    { name: 'Roasts', height: 500 },
    { name: 'Footer', height: 200 }
  ]

  test('a run that announced none has none', () => {
    expect(plannedSections([write('a')])).toBeNull()
    expect(plannedSections([plan([])])).toBeNull()
  })

  test('a section counts as built a write late, the first write being the page shell', () => {
    const built = (parts: ToolCallPart[]) => plannedSections(parts)?.map((section) => section.done)
    expect(built([plan(sections)])).toEqual([false, false, false])
    expect(built([plan(sections), write('shell')])).toEqual([false, false, false])
    expect(built([plan(sections), write('shell'), write('hero')])).toEqual([true, false, false])
    expect(
      built([plan(sections), write('shell'), write('hero'), write('roasts', 'input-streaming')])
    ).toEqual([true, false, false])
  })

  test('the latest plan wins and keeps what was built before it changed', () => {
    const next = [
      { name: 'Hero', height: 700 },
      { name: 'Pricing', height: 600 }
    ]
    const result = plannedSections([plan(sections), write('shell'), write('hero'), plan(next)])
    expect(result).toEqual([
      { name: 'Hero', height: 700, done: true },
      { name: 'Pricing', height: 600, done: false }
    ])
  })
})
