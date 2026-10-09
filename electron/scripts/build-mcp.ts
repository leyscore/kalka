/**
 * Bundles the MCP server into the desktop app, so Kalka can start it without a separate install.
 * Electron runs it as Node (`ELECTRON_RUN_AS_NODE`), from `dist/mcp`.
 */
import { rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outdir = join(root, 'electron', 'dist', 'mcp')

await rm(outdir, { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: [join(root, 'packages/mcp/src/index.ts'), join(root, 'packages/mcp/src/stdio.ts')],
  outdir,
  target: 'node',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [
    {
      // css-tree reads its syntax data with `require` at run time; its prebuilt file inlines it.
      name: 'css-tree-dist',
      setup(build) {
        build.onResolve({ filter: /^css-tree$/ }, (args) => ({
          path: Bun.resolveSync('css-tree/dist/csstree.esm.js', dirname(args.importer))
        }))
      }
    }
  ]
})

if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}
console.log(`MCP server bundled into ${outdir}`)
