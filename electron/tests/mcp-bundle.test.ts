import { describe, expect, test } from 'bun:test'

import { strFromU8, strToU8, unzipSync } from 'fflate'
import * as v from 'valibot'

import { packMCPBundle } from '../scripts/mcp-bundle'

const Manifest = v.object({
  manifest_version: v.string(),
  name: v.string(),
  version: v.string(),
  server: v.object({
    type: v.literal('node'),
    entry_point: v.string(),
    mcp_config: v.object({ command: v.string(), args: v.array(v.string()) })
  })
})

describe('packMCPBundle', () => {
  test('packs a manifest whose entry point and command name the packed server', () => {
    const server = strToU8('console.log("bridge")\n')
    const files = unzipSync(
      packMCPBundle({ version: '1.2.3', description: 'd', server, icon: new Uint8Array([1, 2]) })
    )
    const manifest = v.parse(
      v.pipe(v.string(), v.parseJson(), Manifest),
      strFromU8(files['manifest.json'])
    )
    expect(manifest.version).toBe('1.2.3')
    expect(files[manifest.server.entry_point]).toEqual(server)
    expect(manifest.server.mcp_config.args).toEqual([
      `\${__dirname}/${manifest.server.entry_point}`
    ])
  })
})
