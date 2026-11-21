import { describe, expect, test } from 'bun:test'

import {
  PROJECT_FONTS_MANIFEST,
  projectFontFiles,
  projectFontSlug,
  readProjectFontFiles,
  SceneGraph,
  type ProjectFont
} from '@kalka/scene-graph'

const encoder = new TextEncoder()

function sampleFont(overrides: Partial<ProjectFont> = {}): ProjectFont {
  return {
    family: 'Inter Tight',
    source: 'fontsource',
    catalogueId: 'inter-tight',
    license: 'OFL-1.1',
    licenseText: 'SIL Open Font License, Version 1.1',
    faces: [
      {
        file: 'latin-wght-normal.woff2',
        weight: '100 900',
        style: 'normal',
        unicodeRange: 'U+0000-00FF',
        data: new Uint8Array([1, 2, 3])
      },
      {
        file: 'cyrillic-wght-normal.woff2',
        weight: '100 900',
        style: 'normal',
        unicodeRange: 'U+0400-045F',
        data: new Uint8Array([4, 5])
      }
    ],
    ...overrides
  }
}

function asMap(files: { path: string; content: Uint8Array }[]) {
  return new Map(files.map((file) => [file.path, file.content]))
}

describe('project fonts as files', () => {
  test('a family is kept in a folder of its own with its licence, and reads back', () => {
    const font = sampleFont()
    const files = projectFontFiles(new Map([[font.family, font]]))
    expect(files.map((file) => file.path)).toEqual([
      'fonts/fonts.css',
      'fonts/fonts.json',
      'fonts/inter-tight/cyrillic-wght-normal.woff2',
      'fonts/inter-tight/latin-wght-normal.woff2',
      'fonts/inter-tight/LICENSE.txt'
    ])
    expect(readProjectFontFiles(asMap(files)).get(font.family)).toEqual(font)
  })

  test('the stylesheet names every file for a page that uses the folder as it is', () => {
    const font = sampleFont()
    const css = new TextDecoder().decode(
      projectFontFiles(new Map([[font.family, font]])).find((file) =>
        file.path.endsWith('fonts.css')
      )?.content
    )
    expect(css).toContain('url("inter-tight/latin-wght-normal.woff2") format("woff2")')
    expect(css).toContain('unicode-range: U+0400-045F;')
    expect(css).toContain('font-weight: 100 900;')
  })

  test('a document without fonts writes no fonts folder', () => {
    expect(projectFontFiles(new Map())).toEqual([])
  })

  test('a manifest entry pointing outside its folder is skipped', () => {
    const manifest = {
      version: 1,
      families: [
        {
          family: 'Evil',
          source: 'file',
          license: null,
          faces: [{ file: '../../project.json', weight: '400', style: 'normal' }]
        }
      ]
    }
    const files = new Map([
      [PROJECT_FONTS_MANIFEST, encoder.encode(JSON.stringify(manifest))],
      ['project.json', encoder.encode('{}')]
    ])
    expect(readProjectFontFiles(files).size).toBe(0)
  })

  test('a damaged manifest opens as no fonts rather than failing', () => {
    expect(readProjectFontFiles(new Map([[PROJECT_FONTS_MANIFEST, encoder.encode('{')]])).size).toBe(
      0
    )
  })

  test('a family keeps the files that are there when others went missing', () => {
    const font = sampleFont()
    const files = asMap(projectFontFiles(new Map([[font.family, font]])))
    files.delete('fonts/inter-tight/cyrillic-wght-normal.woff2')
    expect(readProjectFontFiles(files).get(font.family)?.faces.map((face) => face.file)).toEqual([
      'latin-wght-normal.woff2'
    ])
  })

  test('folder names keep families apart and scripts readable', () => {
    expect(projectFontSlug('Noto Sans JP')).toBe('noto-sans-jp')
    expect(projectFontSlug('Été Grotesk')).toBe('ete-grotesk')
    expect(projectFontSlug('日本語')).toBe('日本語')
  })
})

describe('SceneGraph fonts', () => {
  test('adding and removing a family tells listeners', () => {
    const graph = new SceneGraph()
    const changes: string[] = []
    graph.emitter.on('fonts:changed', (family) => changes.push(family))
    graph.setProjectFont(sampleFont())
    expect(graph.fonts.has('Inter Tight')).toBe(true)
    expect(graph.removeProjectFont('Inter Tight')).toBe(true)
    expect(graph.removeProjectFont('Inter Tight')).toBe(false)
    expect(changes).toEqual(['Inter Tight', 'Inter Tight'])
  })
})
