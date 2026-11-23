import { describe, expect, test } from 'bun:test'

import { isWholePage } from '@/app/editor/clipboard/external-html'

describe('isWholePage', () => {
  test('takes a saved page with a doctype or a styled head as a whole page', () => {
    expect(isWholePage('<!DOCTYPE html><html><body><h1>Hi</h1></body></html>')).toBe(true)
    expect(
      isWholePage('<html><head><link rel="stylesheet" href="site.css"></head><body></body></html>')
    ).toBe(true)
  })

  test('keeps a selection copied from a browser as a fragment', () => {
    expect(
      isWholePage('<html><body><!--StartFragment--><p>Copied</p><!--EndFragment--></body></html>')
    ).toBe(false)
    expect(isWholePage('<meta charset="utf-8"><div class="hero">Copied</div>')).toBe(false)
  })
})
