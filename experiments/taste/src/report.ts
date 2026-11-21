/**
 * Builds what the evaluation hands over: one side-by-side image per brief (current agent on the
 * left, the genome pipeline on the right), the metric tables as Markdown, and the diversity
 * measures across briefs and across repeated runs of the same brief.
 *
 * Usage: bun src/report.ts <output folder>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from '@playwright/test'
import * as v from 'valibot'

import { GENOME_AXES, genomeDistance, GenomeSchema, type Genome } from './genome'
import { RUNS_DIR, ledgerTotal } from './llm'
import type { Brief } from './prompts'
import { loadBriefs, readMetrics, readPick, score, scoring, type Metrics, type Scored } from './run'
import { embeddingSpread, spread } from './singularity'

const out = process.argv[2]
if (!out) throw new Error('Pass the output folder')
mkdirSync(out, { recursive: true })

const briefs = loadBriefs()
const context = scoring()
const scale = context.population.map((member) => member.vector)
const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN)
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : '–')

function readJSON<T extends v.GenericSchema>(file: string, schema: T): v.InferOutput<T> | null {
  if (!existsSync(file)) return null
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), schema), readFileSync(file, 'utf8'))
  return parsed.success ? parsed.output : null
}
const external = readJSON(join(RUNS_DIR, 'external.json'), v.record(v.string(), v.number())) ?? {}

type Row = { dir: string; metrics: Metrics; scored: Scored; external: number | null }
function row(brief: Brief, dir: string): Row | null {
  const metrics = readMetrics(dir)
  if (!metrics) return null
  return { dir, metrics, scored: score(brief, dir, metrics, context, null), external: external[join(dir, 'fold.jpg')] ?? null }
}
function finalDir(brief: Brief, sample = 0): string | null {
  const home = sample ? join(RUNS_DIR, brief.id, `r${sample}`) : join(RUNS_DIR, brief.id)
  const final = readJSON(join(home, 'final.json'), v.object({ final: v.string() }))
  if (final) return join(home, final.final)
  const pick = readPick(home)
  return pick ? join(home, pick.picked) : null
}
const genomeOf = (dir: string): Genome | null => readJSON(join(dir, 'genome.json'), GenomeSchema)

type Line = {
  brief: Brief
  plain: Row | null
  baseline: Row | null
  reviewed: Row | null
  variants: Row[]
  picked: Row | null
  final: Row | null
  genome: Genome | null
  finalName: string
}
const lines: Line[] = briefs.map((brief) => {
  const home = join(RUNS_DIR, brief.id)
  const final = finalDir(brief)
  const pick = readPick(home)
  return {
    brief,
    plain: row(brief, join(home, 'plain-sonnet')),
    baseline: row(brief, join(home, 'baseline')),
    reviewed: row(brief, join(home, 'baseline-reviewed')),
    variants: [1, 2, 3].flatMap((index) => row(brief, join(home, `v${index}`)) ?? []),
    picked: pick ? row(brief, join(home, pick.picked)) : null,
    final: final ? row(brief, final) : null,
    genome: final ? genomeOf(final) : null,
    finalName: final ? (final.split('/').pop() ?? '') : ''
  }
})

const md: string[] = []
const cells = (r: Row | null) =>
  r
    ? [fixed(r.metrics.craft.craft, 0), String(r.metrics.slop), fixed(r.scored.singularity.score, 0), fixed(r.scored.total, 0)]
    : ['–', '–', '–', '–']

md.push('### Per brief (craft /100, weighted slop signs, singularity /100, overall score)\n')
md.push('| Brief | Current agent: craft | slop | sing. | score | Pipeline: craft | slop | sing. | score | Genome kept |')
md.push('|---|---|---|---|---|---|---|---|---|---|')
for (const line of lines) {
  const genome = line.genome ? `${line.genome.structure}, ${line.genome.pairing}, ${line.genome.palette}, ${line.genome.shape} (${line.finalName})` : '–'
  md.push(`| ${line.brief.id} | ${cells(line.reviewed).join(' | ')} | ${cells(line.final).join(' | ')} | ${genome} |`)
}

type Pick = (line: Line) => Row[]
const conditions: [string, Pick][] = [
  ['No direction (plain)', (line) => (line.plain ? [line.plain] : [])],
  ['Current agent, first write', (line) => (line.baseline ? [line.baseline] : [])],
  ['Current agent, after its own review', (line) => (line.reviewed ? [line.reviewed] : [])],
  ['Genome, mean of the 3 drafts (no selection)', (line) => line.variants],
  ['Genome, draft kept', (line) => (line.picked ? [line.picked] : [])],
  ['Genome, after refinement (final)', (line) => (line.final ? [line.final] : [])]
]
md.push('\n### Means per condition\n')
md.push('| Condition | n | Craft | Rhythm | Type scale | Contrast | Alignment | Text sizes | Distinct spacings | Weighted slop | Pages with no sign | Singularity (DOM) | Singularity (image) | External P(slop) | Score |')
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const [name, select] of conditions) {
  const rows = lines.flatMap(select)
  const of = (read: (r: Row) => number | null) => mean(rows.flatMap((r) => { const value = read(r); return value === null ? [] : [value] }))
  md.push(
    `| ${name} | ${rows.length} | ${fixed(of((r) => r.metrics.craft.craft))} | ${fixed(of((r) => r.metrics.craft.rhythm), 2)} | ${fixed(of((r) => r.metrics.craft.typeScale), 2)} | ${fixed(of((r) => r.metrics.craft.contrast), 2)} | ${fixed(of((r) => r.metrics.craft.alignment), 2)} | ${fixed(of((r) => r.metrics.craft.typeSizes))} | ${fixed(of((r) => r.metrics.craft.spacingDistinct))} | ${fixed(of((r) => r.metrics.slop), 2)} | ${rows.filter((r) => r.metrics.slop === 0).length}/${rows.length} | ${fixed(of((r) => r.scored.singularity.dom))} | ${fixed(of((r) => r.scored.singularity.clip))} | ${fixed(of((r) => r.external), 3)} | ${fixed(of((r) => r.scored.total))} |`
  )
}

md.push('\n### Slop signs found, per condition (pages affected)\n')
const rules = new Map<string, number[]>()
conditions.forEach(([, select], index) => {
  for (const line of lines)
    for (const r of select(line))
      for (const finding of r.metrics.findings) {
        const counts = rules.get(finding.rule) ?? conditions.map(() => 0)
        counts[index]++
        rules.set(finding.rule, counts)
      }
})
md.push(`| Sign | ${conditions.map(([name]) => name).join(' | ')} |`)
md.push(`|---|${conditions.map(() => '---').join('|')}|`)
for (const [rule, counts] of [...rules.entries()].sort((a, b) => b[1].reduce((x, y) => x + y, 0) - a[1].reduce((x, y) => x + y, 0)))
  md.push(`| ${rule} | ${counts.join(' | ')} |`)

md.push('\n### Diversity across the 20 briefs\n')
md.push('Mean distance between two pages of the same condition (web pages only). Higher means the pages look less alike.\n')
md.push('| Condition | n | DOM distance (capped standard deviations) | Image distance (CLIP cosine) | Mean craft | Mean slop |')
md.push('|---|---|---|---|---|---|')
const web = lines.filter((line) => line.brief.surface === 'web')
for (const [name, select] of [conditions[0], conditions[2], conditions[5]]) {
  const rows = web.flatMap((line) => select(line).slice(0, 1))
  const embedded = rows.flatMap((r) => { const e = context.embeddings[join(r.dir, 'fold.jpg')]; return e ? [e] : [] })
  md.push(`| ${name} | ${rows.length} | ${fixed(spread(rows.map((r) => r.metrics.vector), scale), 2)} | ${fixed(embeddingSpread(embedded), 3)} | ${fixed(mean(rows.map((r) => r.metrics.craft.craft)))} | ${fixed(mean(rows.map((r) => r.metrics.slop)), 2)} |`)
}
const genomes = lines.flatMap((line) => (line.genome ? [line.genome] : []))
const pairwise: number[] = []
for (let a = 0; a < genomes.length; a++) for (let b = a + 1; b < genomes.length; b++) pairwise.push(genomeDistance(genomes[a], genomes[b]))
md.push(`\nGenomes kept: ${genomes.length}; two of them differ on ${fixed(mean(pairwise))} axes of 10 on average (minimum ${pairwise.length ? Math.min(...pairwise) : '–'}).\n`)
md.push('| Axis | Options used by the finals | Most frequent |')
md.push('|---|---|---|')
for (const axis of GENOME_AXES) {
  const counts = new Map<string, number>()
  for (const genome of genomes) counts.set(genome[axis], (counts.get(genome[axis]) ?? 0) + 1)
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  md.push(`| ${axis} | ${counts.size} | ${top ? `${top[0]} (${top[1]})` : '–'} |`)
}
const candidates = briefs.flatMap((brief) => [1, 2, 3].flatMap((index) => genomeOf(join(RUNS_DIR, brief.id, `v${index}`)) ?? []))
md.push(`\nAcross the ${candidates.length} drafts (3 per brief):\n`)
md.push('| Axis | Options used | Counts |')
md.push('|---|---|---|')
for (const axis of GENOME_AXES) {
  const counts = new Map<string, number>()
  for (const genome of candidates) counts.set(genome[axis], (counts.get(genome[axis]) ?? 0) + 1)
  md.push(`| ${axis} | ${counts.size} | ${[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => `${id} ${count}`).join(', ')} |`)
}

md.push('\n### Diversity across repeated runs of the same brief\n')
md.push('Three independent runs (no memory of the previous one). Mean distance between the three pages of one brief.\n')
md.push('| Brief | Current agent: DOM distance | image distance | Pipeline: DOM distance | image distance | Genome axes that change (of 10) | Pipeline craft (3 runs) | Pipeline slop (3 runs) |')
md.push('|---|---|---|---|---|---|---|---|')
const repeatTotals: number[][] = []
for (const brief of briefs) {
  const baselineRows = [0, 1, 2].flatMap((sample) => row(brief, join(sample ? join(RUNS_DIR, brief.id, `r${sample}`) : join(RUNS_DIR, brief.id), 'baseline')) ?? [])
  const pipelineRows = [0, 1, 2].flatMap((sample) => {
    const home = sample ? join(RUNS_DIR, brief.id, `r${sample}`) : join(RUNS_DIR, brief.id)
    const pick = readPick(home)
    return pick ? (row(brief, join(home, pick.picked)) ?? []) : []
  })
  if (baselineRows.length < 3 || pipelineRows.length < 3) continue
  const embed = (rows: Row[]) => rows.flatMap((r) => { const e = context.embeddings[join(r.dir, 'fold.jpg')]; return e ? [e] : [] })
  const picked = pipelineRows.flatMap((r) => genomeOf(r.dir) ?? [])
  const distances: number[] = []
  for (let a = 0; a < picked.length; a++) for (let b = a + 1; b < picked.length; b++) distances.push(genomeDistance(picked[a], picked[b]))
  const values = [
    spread(baselineRows.map((r) => r.metrics.vector), scale),
    embeddingSpread(embed(baselineRows)),
    spread(pipelineRows.map((r) => r.metrics.vector), scale),
    embeddingSpread(embed(pipelineRows)),
    mean(distances)
  ]
  repeatTotals.push(values)
  md.push(`| ${brief.id} | ${fixed(values[0], 2)} | ${fixed(values[1], 3)} | ${fixed(values[2], 2)} | ${fixed(values[3], 3)} | ${fixed(values[4])} | ${pipelineRows.map((r) => fixed(r.metrics.craft.craft, 0)).join(' / ')} | ${pipelineRows.map((r) => r.metrics.slop).join(' / ')} |`)
}
if (repeatTotals.length)
  md.push(`| **mean** | ${fixed(mean(repeatTotals.map((r) => r[0])), 2)} | ${fixed(mean(repeatTotals.map((r) => r[1])), 3)} | ${fixed(mean(repeatTotals.map((r) => r[2])), 2)} | ${fixed(mean(repeatTotals.map((r) => r[3])), 3)} | ${fixed(mean(repeatTotals.map((r) => r[4])))} | | |`)

const duels = briefs.flatMap((brief) => readJSON(join(RUNS_DIR, brief.id, 'duel.json'), v.object({ pipeline: v.object({ score: v.number() }), baseline: v.object({ score: v.number() }) })) ?? [])
if (duels.length)
  md.push(`\nBlind pairwise VLM judge (weak, circular signal): pipeline preferred ${duels.filter((duel) => duel.pipeline.score > duel.baseline.score).length} times, current agent ${duels.filter((duel) => duel.pipeline.score < duel.baseline.score).length} times, tie ${duels.filter((duel) => duel.pipeline.score === duel.baseline.score).length} times of ${duels.length}; mean score ${fixed(mean(duels.map((duel) => duel.pipeline.score)))} against ${fixed(mean(duels.map((duel) => duel.baseline.score)))}.\n`)

// The same drafts, picked with a penalty for options earlier briefs already kept.
{
  const used = { structure: new Map<string, number>(), palette: new Map<string, number>(), pairing: new Map<string, number>() }
  const kept: Row[] = []
  for (const line of lines) {
    const options = line.variants.flatMap((variant) => {
      const genome = genomeOf(variant.dir)
      return genome ? [{ variant, genome }] : []
    })
    if (!options.length) continue
    const adjusted = (option: (typeof options)[number]) =>
      option.variant.scored.total - 3 * (used.structure.get(option.genome.structure) ?? 0) - 1.5 * (used.palette.get(option.genome.palette) ?? 0) - 1.5 * (used.pairing.get(option.genome.pairing) ?? 0)
    const best = options.reduce((a, b) => (adjusted(b) > adjusted(a) ? b : a))
    for (const axis of ['structure', 'palette', 'pairing'] as const) used[axis].set(best.genome[axis], (used[axis].get(best.genome[axis]) ?? 0) + 1)
    kept.push(best.variant)
  }
  const webKept = kept.filter((r) => web.some((line) => r.dir.includes(`/${line.brief.id}/`)))
  const plainPick = web.flatMap((line) => (line.picked ? [line.picked] : []))
  const embedOf = (rows: Row[]) => rows.flatMap((r) => { const e = context.embeddings[join(r.dir, 'fold.jpg')]; return e ? [e] : [] })
  md.push('\n### Ablation: picking with a diversity term\n')
  md.push('Same 60 drafts; the pick subtracts 3 points per earlier use of the structure and 1.5 per earlier use of the palette and of the pairing. No new generation.\n')
  md.push('| Pick | Distinct structures (20 briefs) | Most used structure | Web DOM distance | Web image distance | Mean craft | Mean slop |')
  md.push('|---|---|---|---|---|---|---|')
  const topOf = (rows: Row[]) => {
    const counts = new Map<string, number>()
    for (const r of rows) { const g = genomeOf(r.dir); if (g) counts.set(g.structure, (counts.get(g.structure) ?? 0) + 1) }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    return [String(counts.size), top ? `${top[0]} (${top[1]})` : '–']
  }
  const allPick = lines.flatMap((line) => (line.picked ? [line.picked] : []))
  md.push(`| Score only | ${topOf(allPick).join(' | ')} | ${fixed(spread(plainPick.map((r) => r.metrics.vector), scale), 2)} | ${fixed(embeddingSpread(embedOf(plainPick)), 3)} | ${fixed(mean(allPick.map((r) => r.metrics.craft.craft)))} | ${fixed(mean(allPick.map((r) => r.metrics.slop)), 2)} |`)
  md.push(`| With diversity term | ${topOf(kept).join(' | ')} | ${fixed(spread(webKept.map((r) => r.metrics.vector), scale), 2)} | ${fixed(embeddingSpread(embedOf(webKept)), 3)} | ${fixed(mean(kept.map((r) => r.metrics.craft.craft)))} | ${fixed(mean(kept.map((r) => r.metrics.slop)), 2)} |`)
}

// Menu only against free within the system (options may be invented), on the briefs that ran both.
{
  const Free = v.object({ candidates: v.array(v.object({ name: v.string(), invent: v.optional(v.record(v.string(), v.unknown())) })) })
  const both = briefs.flatMap((brief) => {
    const dir = join(RUNS_DIR, brief.id, 'free')
    const direction = readJSON(join(dir, 'direction.json'), Free)
    const pick = readPick(dir)
    if (!direction || !pick) return []
    const drafts = [1, 2, 3].flatMap((index) => {
      const r = row(brief, join(dir, `v${index}`))
      return r ? [{ r, invented: Object.keys(direction.candidates[index - 1]?.invent ?? {}) }] : []
    })
    const line = lines.find((candidate) => candidate.brief.id === brief.id)
    const picked = row(brief, join(dir, pick.picked))
    return line && picked ? [{ brief, line, drafts, picked, pickedName: pick.picked }] : []
  })
  if (both.length) {
    md.push('\n### Menu only against free within the system\n')
    md.push(`${both.length} briefs ran both arms. In the free arm the agent may add an option on any axis; the resolver holds it to the same checks.\n`)
    md.push('| Arm | Drafts | Craft | Weighted slop | Drafts with no sign | Singularity (DOM) | Singularity (image) | Score | Kept: craft | Kept: slop | Kept: score | Kept: DOM distance between briefs | Kept: image distance |')
    md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    const embedOf = (rows: Row[]) => rows.flatMap((r) => { const e = context.embeddings[join(r.dir, 'fold.jpg')]; return e ? [e] : [] })
    const arm = (name: string, drafts: Row[], kept: Row[]) => {
      const clips = drafts.flatMap((r) => (r.scored.singularity.clip === null ? [] : [r.scored.singularity.clip]))
      md.push(`| ${name} | ${drafts.length} | ${fixed(mean(drafts.map((r) => r.metrics.craft.craft)))} | ${fixed(mean(drafts.map((r) => r.metrics.slop)), 2)} | ${drafts.filter((r) => r.metrics.slop === 0).length}/${drafts.length} | ${fixed(mean(drafts.map((r) => r.scored.singularity.dom)))} | ${fixed(mean(clips))} | ${fixed(mean(drafts.map((r) => r.scored.total)))} | ${fixed(mean(kept.map((r) => r.metrics.craft.craft)))} | ${fixed(mean(kept.map((r) => r.metrics.slop)), 2)} | ${fixed(mean(kept.map((r) => r.scored.total)))} | ${fixed(spread(kept.map((r) => r.metrics.vector), scale), 2)} | ${fixed(embeddingSpread(embedOf(kept)), 3)} |`)
    }
    arm('Menu only', both.flatMap((entry) => entry.line.variants), both.flatMap((entry) => (entry.line.picked ? [entry.line.picked] : [])))
    arm('Free within the system', both.flatMap((entry) => entry.drafts.map((draft) => draft.r)), both.map((entry) => entry.picked))
    const all = both.flatMap((entry) => entry.drafts)
    const withInvention = all.filter((draft) => draft.invented.length)
    const without = all.filter((draft) => !draft.invented.length)
    const axes = new Map<string, number>()
    for (const draft of withInvention) for (const axis of draft.invented) axes.set(axis, (axes.get(axis) ?? 0) + 1)
    md.push(`\nFree arm: ${withInvention.length} of ${all.length} drafts use at least one invented option (${[...axes.entries()].sort((a, b) => b[1] - a[1]).map(([axis, count]) => `${axis} ${count}`).join(', ')}). Mean slop ${fixed(mean(withInvention.map((draft) => draft.r.metrics.slop)), 2)} with invention against ${fixed(mean(without.map((draft) => draft.r.metrics.slop)), 2)} without; craft ${fixed(mean(withInvention.map((draft) => draft.r.metrics.craft.craft)))} against ${fixed(mean(without.map((draft) => draft.r.metrics.craft.craft)))}.\n`)
    md.push('| Brief | Draft | Invented | Craft | Slop | Signs | Kept |')
    md.push('|---|---|---|---|---|---|---|')
    for (const entry of both)
      entry.drafts.forEach((draft, index) => {
        if (draft.invented.length)
          md.push(`| ${entry.brief.id} | v${index + 1} | ${draft.invented.join(', ')} | ${fixed(draft.r.metrics.craft.craft, 0)} | ${draft.r.metrics.slop} | ${draft.r.metrics.findings.map((finding) => finding.rule).join(', ') || '–'} | ${entry.pickedName === `v${index + 1}` ? 'yes' : ''} |`)
      })
  }
}

// Brand mode.
{
  const Results = v.object({ picked: v.string(), results: v.record(v.string(), v.object({ craft: v.object({ craft: v.number() }), slop: v.number(), fidelity: v.object({ colour: v.number(), face: v.number(), size: v.number(), radius: v.number(), tokens: v.number(), components: v.number(), componentCount: v.number() }), gate: v.optional(v.object({ snapped: v.number(), refused: v.number() })) })) })
  const percent = (value: number) => `${Math.round(value * 100)}%`
  const rows: string[] = []
  for (const id of ['brand-orbitly-pricing', 'brand-orbitly-settings', 'brand-toolbox-pricing']) {
    const data = readJSON(join(RUNS_DIR, 'brand', id, 'results.json'), Results)
    if (!data) continue
    for (const [name, label] of [['source', 'the product itself'], ['baseline', 'current agent'], [data.picked, `pipeline, brand mode (${data.picked})`]] as const) {
      const r = data.results[name]
      if (r) rows.push(`| ${id} | ${label} | ${fixed(r.craft.craft, 0)} | ${r.slop} | ${percent(r.fidelity.tokens)} | ${percent(r.fidelity.colour)} | ${percent(r.fidelity.face)} | ${percent(r.fidelity.size)} | ${percent(r.fidelity.radius)} | ${percent(r.fidelity.components)} of ${r.fidelity.componentCount} | ${r.gate ? `${r.gate.snapped} / ${r.gate.refused}` : '–'} |`)
    }
  }
  if (rows.length) {
    md.push('\n### Brand mode\n')
    md.push('| Brief | Page | Craft | Slop | Token adherence | colour | face | size | radius | Parts reused | Gate: snapped / refused |')
    md.push('|---|---|---|---|---|---|---|---|---|---|---|')
    md.push(...rows)
  }
}

const wins = lines.filter((line) => line.final && line.reviewed && line.final.scored.total > line.reviewed.scored.total).length
const total = ledgerTotal()
md.push(`\nOverall score: the pipeline is above current agent on ${wins} briefs of ${lines.filter((line) => line.final && line.reviewed).length}. Model calls: ${total.calls}; cost reported by the CLI: ${total.cost.toFixed(2)} USD.\n`)
writeFileSync(join(out, 'tables.md'), md.join('\n'))

/** One image per brief: current agent on the left, the pipeline on the right, first screens. */
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 2000, height: 700 }, deviceScaleFactor: 1 })
const compose = join(RUNS_DIR, 'compose.html')
const image = (file: string) => (existsSync(file) ? `<img src="${pathToFileURL(file).href}">` : '<div class="none">not produced</div>')
for (const line of lines) {
  if (!line.reviewed || !line.final) continue
  for (const kind of ['fold', 'full'] as const) {
    const html = `<style>body{margin:0;font:15px/1.4 system-ui;background:#1b1b1b;color:#eee}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px}h2{font-size:15px;font-weight:600;margin:0 0 8px}img{width:100%;display:block;background:#fff}p{margin:6px 0 0;color:#aaa;font-size:13px}</style><main>
<div><h2>${line.brief.id} — current agent (guide + anti-slop, after its review)</h2>${image(join(line.reviewed.dir, `${kind}.jpg`))}<p>craft ${fixed(line.reviewed.metrics.craft.craft, 0)}, slop ${line.reviewed.metrics.slop}, singularity ${fixed(line.reviewed.scored.singularity.score, 0)}</p></div>
<div><h2>${line.brief.id} — genome pipeline (${line.genome ? `${line.genome.structure}, ${line.genome.pairing}, ${line.genome.palette}, ${line.genome.shape}` : ''})</h2>${image(join(line.final.dir, `${kind}.jpg`))}<p>craft ${fixed(line.final.metrics.craft.craft, 0)}, slop ${line.final.metrics.slop}, singularity ${fixed(line.final.scored.singularity.score, 0)}</p></div></main>`
    writeFileSync(compose, html)
    await page.goto(pathToFileURL(compose).href, { waitUntil: 'load' })
    await page.screenshot({ path: join(out, `${line.brief.id}-${kind}.jpg`), type: 'jpeg', quality: kind === 'fold' ? 84 : 72, fullPage: true })
  }
}
await browser.close()
console.log(`wrote ${join(out, 'tables.md')} and the side-by-side images`)
