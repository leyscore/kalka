import { describe, expect, test } from 'bun:test'

import { diffLayers } from '@kalka/scene-graph/diff'

import {
  readKalkaArchive,
  readKalkaFolder,
  writeKalkaArchive,
  writeKalkaFolder
} from '#core/io/formats/kalka'

import { sampleDocument } from './sample'

// Compare changes matches layers by ID across saved versions: reading one back must not read as
// a change.
describe('layer diff of saved Kalka documents', () => {
  test('an archive read back has no layer changes', async () => {
    const graph = sampleDocument()
    const read = await readKalkaArchive(await writeKalkaArchive(graph))
    expect(diffLayers(graph, read)).toEqual([])
  })

  test('a folder read back has no layer changes', async () => {
    const graph = sampleDocument()
    const files = await writeKalkaFolder(graph)
    const read = readKalkaFolder(new Map(files.map((file) => [file.path, file.content])))
    expect(diffLayers(graph, read)).toEqual([])
  })
})
