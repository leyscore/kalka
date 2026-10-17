import { describe, expect, test } from 'bun:test'

import { isGeneratedPath } from '#cli/commands/export/storybook/manifest'

describe('Storybook export manifest paths', () => {
  test('are every file the export writes', () => {
    for (const path of [
      'Button.stories.ts',
      'Button.vue',
      'Button.tsx',
      'Button.module.css',
      'Button.design/Default.png',
      'kalka/kit-design/fonts.css',
      'kalka/kit-design/tokens.css',
      'kalka/kit-design/fonts/inter-400-normal.woff2'
    ])
      expect(isGeneratedPath(path)).toBe(true)
  })

  test('never reach outside the output folder or files the export does not write', () => {
    for (const path of [
      '../Button.stories.ts',
      '/tmp/Button.vue',
      'src/../../Button.tsx',
      'components/Button.vue',
      'kalka/kit/notes.txt',
      'Button.design/../../x.png'
    ])
      expect(isGeneratedPath(path)).toBe(false)
  })
})
