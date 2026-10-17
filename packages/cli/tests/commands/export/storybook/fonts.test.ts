import { describe, expect, test } from 'bun:test'

import { documentFolder } from '#cli/commands/export/storybook/fonts'

describe('Storybook document folders', () => {
  test('differ for documents of the same name exported into one folder', () => {
    expect(documentFolder('../kit/design.fig', undefined)).toBe('kalka/kit-design')
    expect(documentFolder('../app/design.fig', undefined)).toBe('kalka/app-design')
    // A one-page export keeps its page's fonts apart from the others'.
    expect(documentFolder('design.fig', 'Icons')).toBe('kalka/design-icons')
    // However far the document is from the output, the name is its folder and file.
    expect(documentFolder('../../../../work/kits/primitives.fig', undefined)).toBe(
      'kalka/kits-primitives'
    )
    expect(documentFolder('v1.2/design.fig', undefined)).toBe('kalka/v1-2-design')
  })
})
