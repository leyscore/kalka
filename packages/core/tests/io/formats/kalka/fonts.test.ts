import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  readKalkaArchive,
  readKalkaFolder,
  writeKalkaArchive,
  writeKalkaFolder
} from '#core/io/formats/kalka'
import { sampleProjectFont } from '#core-tests/helpers/project-fonts'

function documentWithFont(): SceneGraph {
  const graph = new SceneGraph()
  graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Hello', fontFamily: 'Inter Tight' })
  graph.setProjectFont(sampleProjectFont())
  return graph
}

describe('Kalka folder fonts', () => {
  test('a document saves its fonts and their licence in fonts/ and opens with them', async () => {
    const graph = documentWithFont()
    const files = await writeKalkaFolder(graph)
    const paths = files.map((file) => file.path)
    expect(paths).toContain('fonts/inter-tight/latin-wght-normal.woff2')
    expect(paths).toContain('fonts/inter-tight/LICENSE.txt')
    const read = readKalkaFolder(new Map(files.map((file) => [file.path, file.content])))
    expect(read.fonts.get('Inter Tight')).toEqual(sampleProjectFont())
  })

  test('its pages link the fonts stylesheet, so they draw with them in a browser', async () => {
    const files = await writeKalkaFolder(documentWithFont())
    const page = files.find((file) => file.path.startsWith('pages/'))
    expect(new TextDecoder().decode(page?.content)).toContain(
      '<link rel="stylesheet" href="../fonts/fonts.css">'
    )
  })

  test('a document without fonts gains no fonts folder', async () => {
    const files = await writeKalkaFolder(new SceneGraph())
    expect(files.some((file) => file.path.startsWith('fonts/'))).toBe(false)
  })

  test('a .kalka file carries the fonts too', async () => {
    const read = readKalkaArchive(await writeKalkaArchive(documentWithFont()))
    expect([...read.fonts.keys()]).toEqual(['Inter Tight'])
  })
})
