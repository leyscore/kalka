import { beforeAll, describe, expect, setDefaultTimeout, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { FIXTURES } from '#core-tests/helpers/paths'

import { parseFigFile } from '#core/io/formats/fig'
import { readKalkaFolder, writeKalkaFolder } from '#core/io/formats/kalka'
import { initCodec } from '#core/kiwi'

import { graphDifferences } from './compare'

setDefaultTimeout(120_000)

/** The small `.fig` fixtures; the large ones take minutes and gigabytes to convert. */
const FIGS = ['gold-preview', 'circle-text', 'slots', 'variable-override-precedence']

beforeAll(async () => {
  await initCodec()
})

describe('Kalka folder from .fig fixtures', () => {
  for (const name of FIGS) {
    test(name, async () => {
      const bytes = readFileSync(join(FIXTURES, `${name}.fig`))
      const graph = await parseFigFile(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        { populate: 'all' }
      )
      const files = await writeKalkaFolder(graph)
      const read = readKalkaFolder(new Map(files.map((file) => [file.path, file.content])))
      expect(graphDifferences(graph, read)).toEqual([])
      // Saving what was opened writes the folder that was opened.
      expect(await writeKalkaFolder(read)).toEqual(files)
    })
  }
})
