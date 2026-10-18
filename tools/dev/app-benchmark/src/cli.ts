/**
 * Desktop performance benchmark: starts the Electron app with Playwright, measures startup,
 * memory, document opening, artboard cost and gesture smoothness, and writes `report.json` and
 * `report.md`. `packages/docs/development/app-benchmark.md` explains every metric.
 */
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { cpus, totalmem, release } from 'node:os'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools/workspace'

import {
  ARTBOARD_STEPS,
  countLayers,
  ensureGeneratedDocument,
  GENERATED_DOCUMENTS,
  measureHeadlessImport
} from './documents'
import { resolveTarget } from './launch'
import { profileNamed } from './profiles'
import { renderMarkdown, type BenchReport, type ProfileReport } from './report'
import { measureArtboardSteps } from './scenarios/artboards'
import { disposeProfile, primeProfile, type BenchContext } from './scenarios/context'
import { measureDocument, type OpenDocument } from './scenarios/document'
import { GESTURES } from './scenarios/gestures'
import { measureStartup } from './scenarios/startup'

const SCENARIOS = ['startup', 'documents', 'artboards'] as const
type Scenario = (typeof SCENARIOS)[number]

const { values } = parseArgs({
  options: {
    profile: { type: 'string', multiple: true },
    only: { type: 'string' },
    runs: { type: 'string', default: '3' },
    app: { type: 'string' },
    output: { type: 'string' },
    settle: { type: 'string', default: '3000' },
    steps: { type: 'string' },
    documents: { type: 'string' },
    doc: { type: 'string' },
    help: { type: 'boolean', default: false }
  }
})

if (values.help) {
  console.log(`Usage: bun run bench [options]
  --profile NAME     modern, old-4x or old-6x; repeat for several (default: all three)
  --only LIST        comma-separated scenarios: ${SCENARIOS.join(', ')} (default: all)
  --runs N           startup launches per profile (default 3)
  --app PATH         packaged app binary (default: electron/ on the workspace build)
  --output DIR       where report.json and report.md go (default: artifacts/app-benchmark)
  --documents DIR    where generated documents are cached (default: <output>/documents)
  --settle MS        idle time before each memory sample (default 3000)
  --doc LIST         only these documents (names as the report prints them, by prefix)
  --steps LIST       artboard counts for the iframe-cost scenario (default ${ARTBOARD_STEPS.join(',')})`)
  process.exit(0)
}

const root = await resolveWorkspaceRoot(process.cwd())
const output = resolve(values.output ?? join(root, 'artifacts', 'app-benchmark'))
const documentsDir = resolve(values.documents ?? join(output, 'documents'))
const profiles = (values.profile?.length ? values.profile : ['modern', 'old-4x', 'old-6x']).map(
  profileNamed
)
const only = new Set<Scenario>(
  values.only
    ? values.only.split(',').map((name) => {
        if (!SCENARIOS.some((scenario) => scenario === name))
          throw new Error(`Unknown scenario ${name}`)
        return name as Scenario
      })
    : SCENARIOS
)
const runs = Math.max(1, Number(values.runs))
const settleMs = Math.max(0, Number(values.settle))
const steps = values.steps ? values.steps.split(',').map(Number) : ARTBOARD_STEPS
const target = resolveTarget(root, values.app ?? null)
const log = (message: string) => console.log(`[bench] ${message}`)

/** A fixture is usable only once Git LFS replaced its pointer with the file. */
function lfsFixture(path: string): string | null {
  if (!existsSync(path)) return null
  return readFileSync(path).subarray(0, 40).toString().startsWith('version https://git-lfs')
    ? null
    : path
}

await mkdir(output, { recursive: true })
log('generating documents')
const generated = Object.fromEntries(
  await Promise.all(
    Object.values(GENERATED_DOCUMENTS).map(async (spec) => [
      spec.name,
      await ensureGeneratedDocument(documentsDir, spec)
    ])
  )
)
const goldPreview = lfsFixture(join(root, 'tests', 'fixtures', 'gold-preview.fig'))
const documents: (OpenDocument & { gestures: boolean })[] = [
  {
    name: 'demo (Kalka folder)',
    path: join(root, 'assets', 'demo', 'kalka-design'),
    artboards: 1,
    gestures: false
  },
  ...(goldPreview
    ? [{ name: 'gold-preview.fig', path: goldPreview, artboards: 1, gestures: false }]
    : []),
  ...Object.values(GENERATED_DOCUMENTS).map((spec) => ({
    name: spec.name,
    path: generated[spec.name],
    artboards: spec.artboards,
    gestures: spec.leaves > 0
  }))
]

const wantedDocuments = values.doc?.split(',') ?? null
const selectedDocuments = documents.filter(
  (doc) => !wantedDocuments || wantedDocuments.some((name) => doc.name.startsWith(name))
)

const headlessImport = Object.fromEntries(
  await Promise.all(
    selectedDocuments
      .filter((doc) => doc.path.endsWith('.fig'))
      .map(async (doc) => [doc.name, await measureHeadlessImport(doc.path)])
  )
)

const report: BenchReport = {
  environment: {
    recordedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    osRelease: release(),
    cpu: cpus()[0]?.model ?? 'unknown',
    cores: cpus().length,
    memoryGiB: Math.round(totalmem() / 1024 ** 3),
    app: target.executablePath ?? 'electron/ (workspace build)',
    runs,
    settleMs
  },
  documents: Object.fromEntries(
    Object.values(GENERATED_DOCUMENTS).map((spec) => [spec.name, countLayers(spec)])
  ),
  headlessImport,
  profiles: []
}

const save = async () => {
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
  await writeFile(join(output, 'report.md'), renderMarkdown(report))
}

for (const profile of profiles) {
  log(`profile ${profile.name}: priming a profile directory`)
  const primedProfile = await primeProfile(target, profile)
  const context: BenchContext = {
    target,
    profile,
    dist: join(root, 'dist'),
    primedProfile,
    settleMs,
    log
  }
  const result: ProfileReport = { profile, errors: [] }
  report.profiles.push(result)
  const attempt = async (name: string, body: () => Promise<void>) => {
    try {
      await body()
    } catch (error) {
      result.errors.push(
        `${name}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`
      )
      log(`${name} failed: ${String(error)}`)
    }
    await save()
  }
  try {
    if (only.has('startup'))
      await attempt('startup', async () => {
        result.startup = await measureStartup(
          context,
          runs,
          goldPreview ? { name: 'gold-preview.fig', path: goldPreview, artboards: 1 } : undefined
        )
      })
    if (only.has('documents'))
      for (const doc of selectedDocuments)
        await attempt(`document ${doc.name}`, async () => {
          result.documents = [
            ...(result.documents ?? []),
            await measureDocument(context, doc, doc.gestures ? GESTURES : [])
          ]
        })
    if (only.has('artboards'))
      await attempt('artboards', async () => {
        result.artboards = await measureArtboardSteps(context, documentsDir, steps)
      })
  } finally {
    await disposeProfile(primedProfile)
  }
}

await save()
log(`wrote ${join(output, 'report.md')}`)
