/**
 * Bundles the MCP server into the desktop app, so Kalka can start it without a separate install.
 * Electron runs it as Node (`ELECTRON_RUN_AS_NODE`), from `dist/mcp`. The stdio bridge is also
 * packed as `dist/mcp/kalka.mcpb`, which Claude Desktop installs as an extension.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as v from 'valibot'

import { packMCPBundle } from './mcp-bundle'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outdir = join(root, 'electron', 'dist', 'mcp')

await rm(outdir, { recursive: true, force: true })

const cssTreeDist: Bun.BunPlugin = {
  // css-tree reads its syntax data with `require` at run time; its prebuilt file inlines it.
  name: 'css-tree-dist',
  setup(build) {
    build.onResolve({ filter: /^css-tree$/ }, (args) => ({
      path: Bun.resolveSync('css-tree/dist/csstree.esm.js', dirname(args.importer))
    }))
  }
}

function fail(logs: Bun.BuildOutput['logs']): never {
  for (const log of logs) console.error(log)
  process.exit(1)
}

const result = await Bun.build({
  entrypoints: [join(root, 'packages/mcp/src/index.ts'), join(root, 'packages/mcp/src/stdio.ts')],
  outdir,
  target: 'node',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [cssTreeDist]
})
if (!result.success) fail(result.logs)

// The extension runs outside the app, so its bridge is one file with nothing to resolve.
const bridge = await Bun.build({
  entrypoints: [join(root, 'packages/mcp/src/stdio.ts')],
  target: 'node',
  format: 'esm',
  minify: true,
  plugins: [cssTreeDist]
})
if (!bridge.success) fail(bridge.logs)
const app = v.parse(
  v.pipe(v.string(), v.parseJson(), v.object({ version: v.string(), description: v.string() })),
  await readFile(join(root, 'electron', 'package.json'), 'utf8')
)
const bundle = packMCPBundle({
  ...app,
  server: new Uint8Array(await bridge.outputs[0].arrayBuffer()),
  icon: new Uint8Array(await readFile(join(root, 'electron', 'build', 'icon.png')))
})
await writeFile(join(outdir, 'kalka.mcpb'), bundle)
console.log(`MCP server bundled into ${outdir}`)
