import { describe, expect, test } from 'bun:test'

import { splitSnapshotBreakpoints } from '@/app/editor/clipboard/breakpoints'

describe('splitSnapshotBreakpoints', () => {
  test('separates the narrower copies from the widest, widest first', () => {
    const { html, breakpoints } = splitSnapshotBreakpoints(
      '<div class="hero">Wide</div>' +
        '<template data-kalka-breakpoint="390" data-kalka-name="Phone"><div class="hero">Narrow</div></template>' +
        '<template data-kalka-breakpoint="810" data-kalka-name="Tablet"><div class="hero">Mid</div></template>'
    )
    expect(html).toBe('<div class="hero">Wide</div>')
    expect(breakpoints).toEqual([
      { width: 810, name: 'Tablet', html: '<div class="hero">Mid</div>' },
      { width: 390, name: 'Phone', html: '<div class="hero">Narrow</div>' }
    ])
  })

  test('leaves HTML without copies as it is', () => {
    const source = '<section><template><p>Kept</p></template></section>'
    expect(splitSnapshotBreakpoints(source)).toEqual({ html: source, breakpoints: [] })
  })

  test('names an unnamed copy after its width', () => {
    const { breakpoints } = splitSnapshotBreakpoints(
      '<p>Wide</p><template data-kalka-breakpoint="600"><p>Narrow</p></template>'
    )
    expect(breakpoints.map((breakpoint) => breakpoint.name)).toEqual(['600'])
  })
})
