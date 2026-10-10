import { describe, expect, test } from 'bun:test'

import {
  OPEN_PENCIL_PLUGIN_DATA,
  parseHTMLClasses,
  parseHTMLTag,
  readPluginData,
  OPEN_PENCIL_PLUGIN_ID
} from '@open-pencil/scene-graph'

describe('HTML tags and classes of a layer', () => {
  test('a tag is one a layer can take, in lower case', () => {
    expect(parseHTMLTag('H1')).toBe('h1')
    expect(parseHTMLTag(' nav ')).toBe('nav')
    for (const refused of ['script', 'iframe', 'img', 'input', 'table', 'details', '', null])
      expect(parseHTMLTag(refused)).toBeNull()
  })

  test('classes keep framework names, each once, and drop what could leave the attribute', () => {
    expect(parseHTMLClasses('  hero  md:px-4 w-[12px] w-1/2 hero ')).toEqual([
      'hero',
      'md:px-4',
      'w-[12px]',
      'w-1/2'
    ])
    expect(parseHTMLClasses(['a b', 'x"y', "it's", '<b>', 'c=d', 'ok'])).toEqual(['a', 'b', 'ok'])
    expect(parseHTMLClasses(null)).toEqual([])
  })

  test('stored values from a file are read through the same rules', () => {
    const entry = (key: string, value: string) => [{ pluginId: OPEN_PENCIL_PLUGIN_ID, key, value }]
    const { htmlTag, htmlClasses } = OPEN_PENCIL_PLUGIN_DATA
    expect(readPluginData(entry(htmlTag.key, 'section'), htmlTag)).toBe('section')
    expect(readPluginData(entry(htmlTag.key, 'script'), htmlTag)).toBeUndefined()
    expect(readPluginData(entry(htmlClasses.key, '["card","x\\"y"]'), htmlClasses)).toEqual([
      'card'
    ])
    expect(readPluginData(entry(htmlClasses.key, '{not json'), htmlClasses)).toBeUndefined()
  })
})
