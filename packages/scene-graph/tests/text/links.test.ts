import { describe, expect, test } from 'bun:test'

import { hyperlinkAt, hyperlinkURL, runsWithHyperlink, type StyleRun } from '@kalka/scene-graph'

const LINK = { type: 'URL', value: 'https://kalka.design' } as const

describe('hyperlinkURL', () => {
  test('gives a bare domain https, as Figma reads it', () => {
    expect(hyperlinkURL(' kalka.design/docs ')).toBe('https://kalka.design/docs')
  })

  test('keeps web, mail and phone addresses', () => {
    expect(hyperlinkURL('http://example.com')).toBe('http://example.com')
    expect(hyperlinkURL('mailto:hi@example.com')).toBe('mailto:hi@example.com')
    expect(hyperlinkURL('tel:+33100000000')).toBe('tel:+33100000000')
  })

  test('refuses empty input and other schemes', () => {
    expect(hyperlinkURL('  ')).toBeNull()
    expect(hyperlinkURL('data:text/html,hi')).toBeNull()
    expect(hyperlinkURL('file:///etc/hosts')).toBeNull()
  })
})

describe('runsWithHyperlink', () => {
  const bold: StyleRun = { start: 2, length: 3, style: { fontWeight: 700 } }

  test('lays a link over every character, keeping each run style', () => {
    const runs = runsWithHyperlink([bold], 8, LINK)
    expect(runs).toEqual([
      { start: 0, length: 2, style: { hyperlink: LINK } },
      { start: 2, length: 3, style: { fontWeight: 700, hyperlink: LINK } },
      { start: 5, length: 3, style: { hyperlink: LINK } }
    ])
    for (let index = 0; index < 8; index++) expect(hyperlinkAt(runs, index)).toEqual(LINK)
  })

  test('takes every link off, dropping runs left with no style', () => {
    const linked = runsWithHyperlink([bold], 8, LINK)
    expect(runsWithHyperlink(linked, 8, null)).toEqual([bold])
  })
})
