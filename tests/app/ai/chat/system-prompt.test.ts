import { expect, test } from 'bun:test'

import { DESIGN_GUIDE } from '@kalka/core/tools'

import SYSTEM_PROMPT from '@/app/ai/chat/system-prompt'
import { isAIToolEnabled } from '@/app/ai/tools/catalog'

test('the chat agent gets the design process MCP agents read, once', () => {
  expect(SYSTEM_PROMPT.split(DESIGN_GUIDE)).toHaveLength(2)
})

test('the tools the design process names are on by default in the chat', () => {
  const steps = [
    'list_variables',
    'create_collection',
    'create_variable',
    'create_page',
    'write_html',
    'update_css_class',
    'create_component',
    'combine_as_variants',
    'create_instance',
    'get_screenshot',
    'add_breakpoint',
    'finish_working_on_nodes'
  ]
  expect(steps.filter((name) => !isAIToolEnabled(name, {}))).toEqual([])
})
