/**
 * The harness. Stages are separate and resumable, because each one is a batch:
 *
 *   plain      what a model draws with no direction (the pole the singularity score measures from)
 *   baseline   Kalka's agent as it is today: design guide and anti-slop catalogue, one write
 *   review     the baseline's own screenshot check (step 7 of the guide)
 *   direction  the agent reasons from the brief to three genomes; the resolver refuses bad ones
 *   build      one draft per genome, through the gate
 *   embed      CLIP embeddings of every first screen
 *   judge      a VLM ranking of the three drafts (one weak signal)
 *   pick       scores the drafts and keeps the best
 *   refine     one refinement pass from the screenshot, kept only if it scores higher
 *
 * Usage: bun src/run.ts <stage|all> [--briefs a,b] [--sample n] [--parallel n]
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

import * as v from 'valibot'

import { describeActions, gate } from './gate'
import { conflicts, genomeDistance, GenomeSchema, InventSchema, registerInvented, resolve, type Surface, type System } from './genome'
import { ask, fenced, ledgerTotal, pool, RUNS_DIR } from './llm'
import { craft, lint, slopScore, styleVector, type Craft, type Finding } from './measure'
import { buildPage } from './page'
import {
  BASELINE_SYSTEM,
  baselinePrompt,
  baselineReviewPrompt,
  BUILD_SYSTEM,
  buildPrompt,
  describeFindings,
  DIRECTION_SYSTEM,
  directionPrompt,
  JUDGE_SYSTEM,
  judgePrompt,
  PLAIN_SYSTEM,
  plainPrompt,
  refinePrompt,
  type Brief
} from './prompts'
import { closeBrowser, renderPage } from './render'
import { loadEmbeddings, loadPopulation, singularity, type Singularity } from './singularity'

const ROOT = join(import.meta.dir, '..')
const BriefsSchema = v.array(
  v.object({
    id: v.string(),
    kind: v.string(),
    surface: v.picklist(['web', 'dashboard', 'mobile']),
    title: v.string(),
    prompt: v.string()
  })
)
export function loadBriefs(): Brief[] {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), BriefsSchema), readFileSync(join(ROOT, 'briefs.json'), 'utf8'))
  if (!parsed.success) throw new Error('briefs.json is invalid')
  return parsed.output
}

const VIEWPORT: Record<Surface, { width: number; height: number }> = {
  web: { width: 1440, height: 900 },
  dashboard: { width: 1440, height: 900 },
  mobile: { width: 1360, height: 940 }
}

export type Metrics = {
  craft: Craft
  findings: Finding[]
  slop: number
  vector: number[]
  textLength: number
  height: number
  gate?: { snapped: number; refused: number }
}
const MetricsSchema = v.custom<Metrics>((value) => typeof value === 'object' && value !== null && 'craft' in value)
export function readMetrics(dir: string): Metrics | null {
  const file = join(dir, 'metrics.json')
  if (!existsSync(file)) return null
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), MetricsSchema), readFileSync(file, 'utf8'))
  return parsed.success ? parsed.output : null
}

async function measureDir(dir: string, surface: Surface, extra: Partial<Metrics> = {}): Promise<Metrics> {
  const m = await renderPage(join(dir, 'page.html'), {
    ...VIEWPORT[surface],
    full: join(dir, 'full.jpg'),
    fold: join(dir, 'fold.jpg')
  })
  const findings = lint(m, surface)
  const metrics: Metrics = {
    craft: craft(m),
    findings,
    slop: slopScore(findings),
    vector: styleVector(m),
    textLength: m.text.length,
    height: m.height,
    ...extra
  }
  writeFileSync(join(dir, 'metrics.json'), JSON.stringify(metrics, null, 1))
  return metrics
}

function asDocument(html: string, title: string): string {
  if (/<html[\s>]/i.test(html)) return html
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>${html}</body></html>`
}

async function writeRaw(dir: string, reply: string, brief: Brief) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'page.html'), asDocument(fenced(reply, 'html'), brief.title))
  await measureDir(dir, brief.surface)
}

async function writeGenome(dir: string, reply: string, brief: Brief, system: System) {
  mkdirSync(dir, { recursive: true })
  const result = gate(fenced(reply, 'html'), system)
  writeFileSync(join(dir, 'sections.html'), result.html)
  writeFileSync(join(dir, 'gate.txt'), describeActions(result.actions, 200))
  writeFileSync(join(dir, 'genome.json'), JSON.stringify(system.genome, null, 1))
  writeFileSync(join(dir, 'page.html'), await buildPage(system, result.html, brief.title))
  return measureDir(dir, brief.surface, { gate: { snapped: result.snapped, refused: result.refused } })
}

const Direction = v.object({
  reading: v.string(),
  references: v.array(v.object({ name: v.string(), take: v.string() })),
  candidates: v.array(
    v.object({
      ...GenomeSchema.entries,
      name: v.string(),
      why: v.record(v.string(), v.string()),
      invent: v.optional(InventSchema),
      inventPrefix: v.optional(v.string())
    })
  )
})
type Direction = v.InferOutput<typeof Direction>

/** Registers what a candidate invented and points its axes at the new options. */
function adoptInvented(direction: Direction, prefix: string, surface: Surface): string[] {
  const issues: string[] = []
  direction.candidates.forEach((candidate, index) => {
    if (!candidate.invent || Object.keys(candidate.invent).length === 0) return
    candidate.inventPrefix ??= `${prefix}-${index + 1}`
    const registered = registerInvented(candidate.inventPrefix, candidate.invent, surface)
    Object.assign(candidate, registered.ids)
    for (const issue of registered.issues) issues.push(`candidate ${index + 1} (${candidate.name}): ${issue}`)
  })
  return issues
}

function directionIssues(direction: Direction, surface: Surface): string[] {
  const issues: string[] = []
  if (direction.candidates.length !== 3) issues.push(`expected three candidates, got ${direction.candidates.length}`)
  direction.candidates.forEach((candidate, index) => {
    for (const issue of conflicts(candidate, surface)) issues.push(`candidate ${index + 1} (${candidate.name}): ${issue}`)
  })
  for (let a = 0; a < direction.candidates.length; a++)
    for (let b = a + 1; b < direction.candidates.length; b++) {
      const [first, second] = [direction.candidates[a], direction.candidates[b]]
      if (issues.length === 0 && genomeDistance(first, second) < 5)
        issues.push(`candidates ${a + 1} and ${b + 1} differ on only ${genomeDistance(first, second)} axes`)
      for (const axis of ['structure', 'palette', 'pairing'] as const)
        if (first[axis] === second[axis]) issues.push(`candidates ${a + 1} and ${b + 1} share the same ${axis} (${first[axis]})`)
    }
  return issues
}

function readDirection(dir: string, surface: Surface): Direction | null {
  const file = join(dir, 'direction.json')
  if (!existsSync(file)) return null
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Direction), readFileSync(file, 'utf8'))
  if (!parsed.success) return null
  adoptInvented(parsed.output, 'saved', surface)
  return parsed.output
}

type Options = { briefs: Brief[]; sample: number; parallel: number; free: boolean }
/** Sample 0 is the main run; `r1`, `r2` are repeats; `free` is the arm where options may be invented. */
let freeArm = false
const home = (brief: Brief, sample: number) => {
  if (freeArm) return join(RUNS_DIR, brief.id, 'free')
  return sample ? join(RUNS_DIR, brief.id, `r${sample}`) : join(RUNS_DIR, brief.id)
}

const stages: Record<string, (options: Options) => Promise<void>> = {
  async plain({ briefs, parallel }) {
    const tasks = briefs.flatMap((brief) => {
      const copies = brief.surface === 'web' ? 1 : 2
      return (['sonnet', 'haiku'] as const).flatMap((model) =>
        Array.from({ length: copies }, (_, copy) => async () => {
          const dir = join(RUNS_DIR, brief.id, `plain-${model}${copy ? `-${copy}` : ''}`)
          if (readMetrics(dir)) return
          const reply = await ask({ label: `plain:${brief.id}`, system: PLAIN_SYSTEM, prompt: plainPrompt(brief), model, sample: copy })
          await writeRaw(dir, reply, brief)
          console.log('plain', brief.id, model, copy)
        })
      )
    })
    await pool(tasks, parallel)
  },

  async baseline({ briefs, sample, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = join(home(brief, sample), 'baseline')
        if (readMetrics(dir)) return
        const reply = await ask({ label: `baseline:${brief.id}`, system: BASELINE_SYSTEM, prompt: baselinePrompt(brief), sample })
        await writeRaw(dir, reply, brief)
        console.log('baseline', brief.id, sample)
      }),
      parallel
    )
  },

  async review({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const from = join(home(brief, 0), 'baseline')
        const dir = join(home(brief, 0), 'baseline-reviewed')
        if (readMetrics(dir) || !readMetrics(from)) return
        const html = readFileSync(join(from, 'page.html'), 'utf8')
        const reply = await ask({
          label: `review:${brief.id}`,
          system: BASELINE_SYSTEM,
          prompt: baselineReviewPrompt(brief, html, ['fold.jpg', 'full.jpg']),
          images: [join(from, 'fold.jpg'), join(from, 'full.jpg')]
        })
        await writeRaw(dir, reply, brief)
        console.log('review', brief.id)
      }),
      parallel
    )
  },

  async direction({ briefs, sample, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = home(brief, sample)
        mkdirSync(dir, { recursive: true })
        if (readDirection(dir, brief.surface)) return
        let refusals: string | undefined
        const log: string[] = []
        for (let attempt = 0; attempt < 3; attempt++) {
          const reply = await ask({ label: `direction:${brief.id}`, system: DIRECTION_SYSTEM, prompt: directionPrompt(brief, refusals, freeArm), sample: sample * 10 + attempt })
          const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Direction), fenced(reply, 'json'))
          const invented = parsed.success ? adoptInvented(parsed.output, `${brief.id}${sample ? `-r${sample}` : ''}`, brief.surface) : []
          const issues = parsed.success ? [...invented, ...directionIssues(parsed.output, brief.surface)] : [`not valid JSON for the schema: ${parsed.issues[0].message}`]
          if (parsed.success && issues.length === 0) {
            writeFileSync(join(dir, 'direction.json'), JSON.stringify(parsed.output, null, 1))
            writeFileSync(join(dir, 'direction-refusals.txt'), log.join('\n---\n'))
            console.log('direction', brief.id, sample, `attempt ${attempt + 1}`)
            return
          }
          refusals = issues.map((issue) => `- ${issue}`).join('\n')
          log.push(refusals)
        }
        throw new Error(`direction for ${brief.id} refused three times:\n${refusals}`)
      }),
      parallel
    )
  },

  async build({ briefs, sample, parallel }) {
    const tasks = briefs.flatMap((brief) => {
      const direction = readDirection(home(brief, sample), brief.surface)
      if (!direction) return []
      return direction.candidates.map((candidate, index) => async () => {
        const dir = join(home(brief, sample), `v${index + 1}`)
        if (readMetrics(dir)) return
        const system = resolve(candidate, brief.surface)
        const references = direction.references.map((reference) => `${reference.name} (${reference.take})`).join('; ')
        const why = Object.entries(candidate.why).map(([axis, reason]) => `${axis}: ${reason}`).join(' ')
        const reply = await ask({
          label: `build:${brief.id}:v${index + 1}`,
          system: BUILD_SYSTEM,
          prompt: buildPrompt(brief, system, direction.reading, references, `${candidate.name}. ${why}`),
          sample
        })
        const metrics = await writeGenome(dir, reply, brief, system)
        console.log('build', brief.id, sample, `v${index + 1}`, candidate.structure, candidate.palette, `craft ${metrics.craft.craft.toFixed(0)} slop ${metrics.slop} gate ${metrics.gate?.snapped}/${metrics.gate?.refused}`)
      })
    })
    await pool(tasks, parallel)
  },

  async embed() {
    const list = join(RUNS_DIR, 'folds.txt')
    const found = spawnSync('find', [RUNS_DIR, '-name', 'fold.jpg'], { encoding: 'utf8' }).stdout.trim()
    writeFileSync(list, found)
    const python = process.env.TASTE_PYTHON ?? 'python3'
    const result = spawnSync(python, [join(import.meta.dir, 'embed.py'), list, join(RUNS_DIR, 'embeddings.json')], { encoding: 'utf8' })
    console.log(result.stdout.trim() || result.stderr.slice(-600))
  },

  async judge({ briefs, sample, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = home(brief, sample)
        if (existsSync(join(dir, 'judge.json')) || !readMetrics(join(dir, 'v3'))) return
        // The judge sees neutral file names in a folder of their own.
        const stage = join(dir, 'judge')
        mkdirSync(stage, { recursive: true })
        const names = ['a.jpg', 'b.jpg', 'c.jpg']
        names.forEach((name, index) => writeFileSync(join(stage, name), readFileSync(join(dir, `v${index + 1}`, 'fold.jpg'))))
        const reply = await ask({
          label: `judge:${brief.id}`,
          system: JUDGE_SYSTEM,
          prompt: judgePrompt(brief, names),
          images: names.map((name) => join(stage, name)),
          model: 'haiku',
          sample
        })
        const parsed = v.safeParse(
          v.pipe(v.string(), v.parseJson(), v.object({ drafts: v.array(v.object({ file: v.string(), score: v.number(), weakness: v.string() })) })),
          fenced(reply, 'json')
        )
        writeFileSync(join(dir, 'judge.json'), JSON.stringify(parsed.success ? parsed.output.drafts : [], null, 1))
        console.log('judge', brief.id, parsed.success ? parsed.output.drafts.map((draft) => draft.score).join('/') : 'unparsed')
      }),
      parallel
    )
  },

  async pick({ briefs, sample }) {
    const context = scoring()
    for (const brief of briefs) {
      const dir = home(brief, sample)
      const judged = readJudge(dir)
      const scored = [1, 2, 3].flatMap((index) => {
        const draft = join(dir, `v${index}`)
        const metrics = readMetrics(draft)
        if (!metrics) return []
        return [{ name: `v${index}`, ...score(brief, draft, metrics, context, judged[index - 1]) }]
      })
      if (!scored.length) continue
      const best = scored.reduce((a, b) => (b.total > a.total ? b : a))
      writeFileSync(join(dir, 'pick.json'), JSON.stringify({ picked: best.name, scored }, null, 1))
      console.log('pick', brief.id, sample, scored.map((draft) => `${draft.name}=${draft.total.toFixed(1)}`).join(' '), '→', best.name)
    }
  },

  async refine({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = home(brief, 0)
        readDirection(dir, brief.surface)
        const pick = readPick(dir)
        const out = join(dir, 'refined')
        if (!pick || readMetrics(out)) return
        const from = join(dir, pick.picked)
        const metrics = readMetrics(from)
        const genome = v.safeParse(v.pipe(v.string(), v.parseJson(), GenomeSchema), readFileSync(join(from, 'genome.json'), 'utf8'))
        if (!metrics || !genome.success) return
        const system = resolve(genome.output, brief.surface)
        const report = [
          describeFindings(metrics.findings),
          metrics.craft.clipped ? `- ${metrics.craft.clipped} elements are clipped or overflow their box` : '',
          metrics.craft.overflow ? '- the page scrolls horizontally' : '',
          metrics.craft.contrastFailRate > 0 ? `- ${(metrics.craft.contrastFailRate * 100).toFixed(0)}% of text fails contrast (lowest ${metrics.craft.contrastMin.toFixed(1)}:1)` : '',
          metrics.craft.typeSizes > 8 ? `- ${metrics.craft.typeSizes} distinct type sizes are in use` : '',
          readFileSync(join(from, 'gate.txt'), 'utf8').split('\n').slice(0, 14).join('\n')
        ].filter(Boolean).join('\n')
        const reply = await ask({
          label: `refine:${brief.id}`,
          system: BUILD_SYSTEM,
          prompt: refinePrompt(brief, system, readFileSync(join(from, 'sections.html'), 'utf8'), ['fold.jpg', 'full.jpg'], report),
          images: [join(from, 'fold.jpg'), join(from, 'full.jpg')]
        })
        await writeGenome(out, reply, brief, system)
        console.log('refine', brief.id)
      }),
      parallel
    )
  },

  /**
   * A blind pairwise look by a VLM at today's agent against the pipeline, order drawn from the
   * brief's name. Reported as a weak signal only: a model judging models is circular.
   */
  async duel({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = home(brief, 0)
        const final = v.safeParse(v.pipe(v.string(), v.parseJson(), v.object({ final: v.string() })), existsSync(join(dir, 'final.json')) ? readFileSync(join(dir, 'final.json'), 'utf8') : '')
        if (!final.success || existsSync(join(dir, 'duel.json')) || !readMetrics(join(dir, 'baseline-reviewed'))) return
        const stage = join(dir, 'duel')
        mkdirSync(stage, { recursive: true })
        const pipelineFirst = [...brief.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2 === 0
        const order = pipelineFirst ? [final.output.final, 'baseline-reviewed'] : ['baseline-reviewed', final.output.final]
        const names = ['a.jpg', 'b.jpg']
        names.forEach((name, index) => writeFileSync(join(stage, name), readFileSync(join(dir, order[index], 'fold.jpg'))))
        const reply = await ask({ label: `duel:${brief.id}`, system: JUDGE_SYSTEM, prompt: judgePrompt(brief, names), images: names.map((name) => join(stage, name)) })
        const parsed = v.safeParse(
          v.pipe(v.string(), v.parseJson(), v.object({ drafts: v.array(v.object({ score: v.number(), weakness: v.string() })) })),
          fenced(reply, 'json')
        )
        if (!parsed.success || parsed.output.drafts.length !== 2) return
        const [first, second] = parsed.output.drafts
        const result = { pipeline: pipelineFirst ? first : second, baseline: pipelineFirst ? second : first }
        writeFileSync(join(dir, 'duel.json'), JSON.stringify(result, null, 1))
        console.log('duel', brief.id, `pipeline ${result.pipeline.score} baseline ${result.baseline.score}`)
      }),
      parallel
    )
  },

  /** Keeps the refinement only when it scores at least as well as the draft it started from. */
  async final({ briefs }) {
    const context = scoring()
    for (const brief of briefs) {
      const dir = home(brief, 0)
      const pick = readPick(dir)
      if (!pick) continue
      const candidates = [pick.picked, 'refined'].flatMap((name) => {
        const metrics = readMetrics(join(dir, name))
        return metrics ? [{ name, ...score(brief, join(dir, name), metrics, context, null) }] : []
      })
      const best = candidates.reduce((a, b) => (b.total >= a.total ? b : a))
      writeFileSync(join(dir, 'final.json'), JSON.stringify({ final: best.name, candidates }, null, 1))
      console.log('final', brief.id, candidates.map((draft) => `${draft.name}=${draft.total.toFixed(1)}`).join(' '), '→', best.name)
    }
  }
}

function readJudge(dir: string): (number | null)[] {
  const file = join(dir, 'judge.json')
  if (!existsSync(file)) return [null, null, null]
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), v.array(v.object({ score: v.number() }))), readFileSync(file, 'utf8'))
  return parsed.success && parsed.output.length === 3 ? parsed.output.map((draft) => draft.score) : [null, null, null]
}

export function readPick(dir: string): { picked: string } | null {
  const file = join(dir, 'pick.json')
  if (!existsSync(file)) return null
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), v.object({ picked: v.string() })), readFileSync(file, 'utf8'))
  return parsed.success ? parsed.output : null
}

export function scoring() {
  return { population: loadPopulation(loadBriefs()), embeddings: loadEmbeddings() }
}

export type Scored = { total: number; craft: number; clean: number; singularity: Singularity; judge: number | null; hard: string[] }

/**
 * One number per draft. Hard failures are subtracted, not averaged, so a page cannot buy its way
 * out of an overflow with a high singularity; and singularity is capped, because a broken or
 * empty page is also far from the average.
 */
export function score(brief: Brief, dir: string, metrics: Metrics, context: ReturnType<typeof scoring>, judge: number | null): Scored {
  const hard: string[] = []
  if (metrics.craft.overflow) hard.push('horizontal overflow')
  if (metrics.craft.contrastFailRate > 0.1) hard.push('contrast')
  if (metrics.findings.some((finding) => finding.rule === 'clean-but-empty')) hard.push('empty')
  if (metrics.findings.some((finding) => finding.rule === 'font-never-loads')) hard.push('font')
  const clean = Math.max(0, 100 - 12 * metrics.slop)
  const sing = singularity(
    { brief: brief.id, surface: brief.surface, vector: metrics.vector, embedding: context.embeddings[join(dir, 'fold.jpg')] ?? null },
    context.population
  )
  const capped = Math.min(sing.score, 70)
  const base = 0.4 * metrics.craft.craft + 0.33 * clean + 0.27 * (capped / 0.7)
  const total = (judge === null ? base : 0.9 * base + 0.1 * judge) - 20 * hard.length - Math.min(8, (metrics.gate?.refused ?? 0) * 0.4)
  return { total, craft: metrics.craft.craft, clean, singularity: sing, judge, hard }
}

if (import.meta.main) {
  const [stage, ...rest] = process.argv.slice(2)
  const flag = (name: string) => {
    const index = rest.indexOf(`--${name}`)
    return index >= 0 ? rest[index + 1] : undefined
  }
  const wanted = flag('briefs')?.split(',')
  const options: Options = {
    briefs: loadBriefs().filter((brief) => !wanted || wanted.includes(brief.id)),
    sample: Number(flag('sample') ?? 0),
    parallel: Number(flag('parallel') ?? 3),
    free: rest.includes('--free')
  }
  freeArm = options.free
  mkdirSync(RUNS_DIR, { recursive: true })
  const order = stage === 'all' ? ['plain', 'baseline', 'direction', 'build', 'review', 'embed', 'judge', 'pick', 'refine', 'embed', 'final'] : [stage]
  try {
    for (const name of order) {
      if (!(name in stages)) throw new Error(`Unknown stage ${name}. Stages: ${Object.keys(stages).join(', ')}`)
      await stages[name](options)
    }
  } finally {
    await closeBrowser()
    const total = ledgerTotal()
    console.log(`${basename(RUNS_DIR)}: ${total.calls} calls, $${total.cost.toFixed(2)} so far`)
  }
}
