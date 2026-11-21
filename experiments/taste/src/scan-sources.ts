/**
 * Reads the licensed source repositories (cloned outside the repository) and records what was
 * taken from them: not markup, but how often each layout primitive appears, which is what the
 * structure grammars and atoms were abstracted from. Writes sources/analysis.json.
 *
 * Usage: bun src/scan-sources.ts <folder with one clone per source>
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

const Sources = v.object({
  used: v.array(v.object({ id: v.string(), clone: v.string(), paths: v.array(v.string()) }))
})
const root = process.argv[2]
if (!root) throw new Error('Pass the folder that holds the clones')
const manifest = v.parse(
  v.pipe(v.string(), v.parseJson(), Sources),
  readFileSync(join(import.meta.dir, '..', 'sources', 'sources.json'), 'utf8')
)

const PRIMITIVES: Record<string, RegExp> = {
  'equal columns (grid-cols-2/3/4)': /\bgrid-cols-[234]\b/g,
  'twelve-column grid': /\bgrid-cols-12\b/g,
  'uneven spans (col-span-5/7/8/9)': /\bcol-span-(5|7|8|9)\b/g,
  'fractional split (w-1/2, w-2/3…)': /\bw-\d\/\d\b/g,
  'ruled rows (divide-y)': /\bdivide-y\b/g,
  'tables': /<table\b/g,
  'sticky rails and bars': /\bsticky\b/g,
  'rounded-full pills': /\brounded-full\b/g,
  'soft shadows': /\bshadow(-sm|-md|-lg|-xl|-2xl)?\b/g,
  'gradients': /\bbg-(gradient|linear)-/g,
  'centred text': /\btext-center\b/g
}

function* files(dir: string): Generator<string> {
  if (!statSync(dir).isDirectory()) {
    yield dir
    return
  }
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* files(path)
    else if (/\.(html|astro|tsx|jsx|js|vue|svelte|md|njk|css)$/.test(entry)) yield path
  }
}

const analysis = manifest.used.map((source) => {
  const counts = Object.fromEntries(Object.keys(PRIMITIVES).map((name) => [name, 0]))
  let read = 0
  for (const path of source.paths)
    for (const file of files(join(root, source.clone, path))) {
      const text = readFileSync(file, 'utf8')
      read++
      for (const [name, pattern] of Object.entries(PRIMITIVES)) counts[name] += text.match(pattern)?.length ?? 0
    }
  return { id: source.id, files: read, primitives: counts }
})
writeFileSync(join(import.meta.dir, '..', 'sources', 'analysis.json'), `${JSON.stringify(analysis, null, 2)}\n`)
for (const entry of analysis) console.log(entry.id, entry.files, 'files')
