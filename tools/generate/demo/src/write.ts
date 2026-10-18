import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { useBrowserLayout } from '@kalka/cli/layout'

import { buildDemoDocument } from './build'

/**
 * Bun entry that `ensureDemoDocument` runs: build the demo and write it to the given path, laid
 * out by Chromium in the desktop app's render host, as the canvas lays it out. Without the host
 * the CLI says so and the layers keep the geometry they were built with.
 */
const [output] = process.argv.slice(2)
if (!output) throw new Error('Usage: bun write.ts <output.fig>')
useBrowserLayout()
const bytes = await buildDemoDocument()
await mkdir(dirname(output), { recursive: true })
await writeFile(`${output}.tmp`, bytes)
await rename(`${output}.tmp`, output)
