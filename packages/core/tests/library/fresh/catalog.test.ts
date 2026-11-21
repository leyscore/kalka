import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { corePackagePath } from '#core-tests/helpers/paths'

import {
  FRESH_CATEGORIES,
  FRESH_COMPONENTS,
  freshVariants,
  isValidLibraryAssetKey
} from '@kalka/core/library'

const FOLDER = corePackagePath('src/library/fresh')

const LICENSE_FILES: Record<string, string[]> = {
  'Paper Shaders': ['paper-shaders-LICENSE.txt', 'paper-shaders-NOTICE.txt'],
  'Fancy Components': ['fancy-components-LICENSE.txt'],
  'Cult UI': ['cult-ui-LICENSE.txt'],
  Codrops: ['codrops-button-hover-styles-LICENSE.txt']
}

describe('Kalka Fresh catalog', () => {
  test('has between 20 and 30 components in every category, each with a unique key', () => {
    expect(FRESH_COMPONENTS.length).toBeGreaterThanOrEqual(20)
    expect(FRESH_COMPONENTS.length).toBeLessThanOrEqual(30)
    const keys = FRESH_COMPONENTS.map((component) => component.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys.every(isValidLibraryAssetKey)).toBe(true)
    for (const category of FRESH_CATEGORIES)
      expect(FRESH_COMPONENTS.some((component) => component.category === category)).toBe(true)
  })

  test('credits every component to a permissive source whose licence files ship with it', () => {
    const credits = readFileSync(join(FOLDER, 'CREDITS.md'), 'utf8')
    for (const component of FRESH_COMPONENTS) {
      expect(['MIT', 'Apache-2.0']).toContain(component.source.license)
      expect(component.source.url).toStartWith('https://')
      expect(credits).toContain(`\`${component.key}\``)
      for (const file of LICENSE_FILES[component.source.library] ?? ['missing'])
        expect(existsSync(join(FOLDER, 'licenses', file))).toBe(true)
    }
  })

  test("paints with the colour roles and shows each text property's default", () => {
    for (const component of FRESH_COMPONENTS) {
      const variants = freshVariants(component).map((values) => component.html(values))
      for (const html of variants) {
        expect(html).toMatch(/var\(--color-(ground|ink|accent|muted|line), #/)
        expect(html).not.toMatch(/<script|\son\w+=/i)
      }
      for (const text of Object.values(component.texts))
        expect(variants.some((html) => html.includes(text))).toBe(true)
    }
  })
})
