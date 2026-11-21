/**
 * Brand-mode harness: an existing product (a licensed open-source template standing in for the
 * customer's site or app, rendered locally and never committed) and a request for a new page in
 * its style. Today's agent gets the same facts as text and a screenshot; the pipeline seeds its
 * system from the product, locks those axes, chooses the free ones, and builds through the gate.
 * Both are measured for quality and for brand fidelity.
 *
 * Usage: bun src/brand-run.ts <folder with the source clones> [--parallel n]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

import { brandConflicts, brandMenu, brandVocabulary, fidelity, resolveBrand, seedFromCSS, seedFromPage, type BrandSeed, type Fidelity } from './brand'
import { describeActions, gate } from './gate'
import type { Surface } from './genome'
import { ask, fenced, ledgerTotal, pool, RUNS_DIR } from './llm'
import { craft, lint, slopScore, type Craft, type Finding } from './measure'
import { buildPage, candidates } from './page'
import { BASELINE_SYSTEM, BUILD_SYSTEM, DIRECTION_SYSTEM } from './prompts'
import { closeBrowser, renderPage, type Measurement } from './render'

const clones = process.argv[2]
if (!clones) throw new Error('Pass the folder that holds the source clones')
const parallel = Number(process.argv[process.argv.indexOf('--parallel') + 1] || 3)
const OUT = join(RUNS_DIR, 'brand')

type BrandBrief = { id: string; surface: Surface; product: string; source: string; kind: 'tailwind' | 'static'; prompt: string }
const BRIEFS: BrandBrief[] = [
  {
    id: 'brand-orbitly-pricing',
    surface: 'web',
    product: 'Orbitly',
    source: 'markmead_hyperui/public/examples/templates/saas-landing-page/1.html',
    kind: 'tailwind',
    prompt:
      'Orbitly is our team workspace (tasks, docs and conversations in one place); the page you can see is our live marketing site. Add a pricing page in exactly the same style. Plans: Free (up to 5 members, 3 projects), Team 9 $ per member per month (unlimited projects, 40+ integrations, guest access), Business 19 $ per member per month (SSO, audit log, support reply under 2 hours, 99.98% uptime SLA). Yearly billing saves 20%. Every paid plan starts with a 14-day trial. Questions to answer: can we change plan later (yes, prorated), do guests count as members (no).'
  },
  {
    id: 'brand-orbitly-settings',
    surface: 'dashboard',
    product: 'Orbitly Support',
    source: 'markmead_hyperui/public/examples/templates/support-inbox/1.html',
    kind: 'tailwind',
    prompt:
      'This is the support inbox of our product, Orbitly. Add the Settings screen of the same app, in exactly the same style, with the same side navigation. Sections: Workspace (name "Orbitly Support", support address help@orbitly.example, time zone Europe/Paris), Business hours (Monday to Friday 09:00 to 18:00), Auto-assignment (round robin on, maximum 8 open tickets per agent), Tags (Billing, Bug, Onboarding, each with a ticket count and a remove action, and a field to add one), and a danger zone to delete the workspace.'
  },
  {
    id: 'brand-toolbox-pricing',
    surface: 'web',
    product: 'Landing',
    source: 'tailwindtoolbox_Landing-Page/index.html',
    kind: 'static',
    prompt:
      'The page you can see is our current site (the copy is still placeholder, the look is final). Add a pricing page in exactly the same style for our product, a newsletter tool: Hobby 0 $ (up to 500 subscribers), Writer 12 $ per month (5,000 subscribers, custom domain), Publication 39 $ per month (25,000 subscribers, 3 seats, paid subscriptions with a 5% fee). All plans include unlimited sends.'
  }
]

type Result = { craft: Craft; findings: Finding[]; slop: number; fidelity: Fidelity; gate?: { snapped: number; refused: number } }

const DEFAULT_THEME = '@import "tailwindcss";'
async function sourcePage(brief: BrandBrief, dir: string): Promise<string> {
  const raw = readFileSync(join(clones, brief.source), 'utf8')
  if (brief.kind === 'static') return raw
  const { compile } = await import('tailwindcss')
  const { createRequire } = await import('node:module')
  const { dirname } = await import('node:path')
  const root = dirname(createRequire(import.meta.url).resolve('tailwindcss/package.json'))
  const compiler = await compile(DEFAULT_THEME, {
    base: root,
    loadStylesheet: async (id, base) => {
      const path = id === 'tailwindcss' ? join(root, 'index.css') : join(base, id)
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
    }
  })
  const html = raw
    .replace(/<link[^>]*component\.css[^>]*>/, '')
    .replace(/<script[^>]*component\.js[^>]*><\/script>/, '')
    .replace('class="dark ', 'class="')
  writeFileSync(join(dir, 'source.css'), compiler.build(candidates(html)))
  return html.replace('</head>', `<style>${compiler.build(candidates(html))}</style></head>`)
}

async function measured(dir: string, surface: Surface): Promise<Measurement> {
  return renderPage(join(dir, 'page.html'), {
    width: 1440,
    height: 900,
    full: join(dir, 'full.jpg'),
    fold: join(dir, 'fold.jpg')
  })
}

function summary(seed: BrandSeed): string {
  return [
    `Variables (list_variables): ${Object.entries(seed.colors).map(([role, value]) => `${role} ${value}`).join(', ')}.`,
    `Type: ${seed.fonts.display}${seed.fonts.text === seed.fonts.display ? '' : ` and ${seed.fonts.text}`}; sizes ${seed.type.map((style) => `${style.role} ${style.size}px/${style.weight}`).join(', ')}.`,
    `Radius: ${seed.radius.sm}, ${seed.radius.md}, ${seed.radius.lg} px. Spacing steps: ${seed.spacing.map((value) => value * 4).join(', ')} px.${'brand' in seed.shadow ? ` Shadow: ${seed.shadow.brand}.` : ''}`,
    `Components (get_components), as utility classes over those variables: ${seed.components.map((component) => `${component.id} = ${component.recipe}`).join('; ')}.`
  ].join('\n')
}

const Free = v.object({
  candidates: v.array(
    v.object({
      name: v.string(),
      structure: v.string(),
      rhythm: v.string(),
      imagery: v.string(),
      motion: v.string(),
      signature: v.object({ kind: v.string(), detail: v.string() }),
      why: v.string()
    })
  )
})

async function run(brief: BrandBrief): Promise<void> {
  const home = join(OUT, brief.id)
  const sourceDir = join(home, 'source')
  mkdirSync(sourceDir, { recursive: true })
  writeFileSync(join(sourceDir, 'page.html'), await sourcePage(brief, sourceDir))
  const reference = await measured(sourceDir, brief.surface)
  const fontHead = [...readFileSync(join(sourceDir, 'page.html'), 'utf8').matchAll(/<link[^>]*fonts\.googleapis[^>]*>/g)].map((match) => match[0]).join('\n')
  const seed = seedFromPage(reference, brief.product, 'a rendered page of the product', fontHead)
  writeFileSync(join(home, 'seed.json'), JSON.stringify(seed, null, 1))
  const results: Record<string, Result> = {}
  const record = (name: string, m: Measurement, gated?: { snapped: number; refused: number }) => {
    const findings = lint(m, brief.surface)
    results[name] = { craft: craft(m), findings, slop: slopScore(findings), fidelity: fidelity(seed, reference, m), gate: gated }
  }
  record('source', reference)
  const frame = brief.surface === 'web' ? 'The frame is one desktop page, 1440 px wide.' : 'The frame is one desktop application screen, 1440 px wide and about 900 px high.'

  // Today's agent: the same facts, as its tools would return them, and the screenshot.
  const baselineDir = join(home, 'baseline')
  mkdirSync(baselineDir, { recursive: true })
  const baseline = await ask({
    label: `brand-baseline:${brief.id}`,
    system: BASELINE_SYSTEM,
    prompt: `${brief.prompt}\n\n${frame} The document already has a system, so follow it (step 1 of the process). You inspected the document:\n${summary(seed)}\nYou also called get_screenshot on the existing page: read the image files fold.jpg and full.jpg in the current folder. No stock photo provider is connected: for a photograph write <img data-photo="what it shows" alt="…"> with no src.`,
    images: [join(sourceDir, 'fold.jpg'), join(sourceDir, 'full.jpg')]
  })
  const baselineHtml = fenced(baseline, 'html')
  writeFileSync(join(baselineDir, 'page.html'), /<html[\s>]/i.test(baselineHtml) ? baselineHtml : `<!doctype html><html><body>${baselineHtml}</body></html>`)
  record('baseline', await measured(baselineDir, brief.surface))

  // The pipeline: only the free axes are chosen, inside what the matrix leaves open.
  let refusals = ''
  let free: v.InferOutput<typeof Free> | null = null
  for (let attempt = 0; attempt < 3 && !free; attempt++) {
    const reply = await ask({
      label: `brand-direction:${brief.id}`,
      system: DIRECTION_SYSTEM,
      prompt: `Brief: ${brief.prompt}\n${frame}\n\nBrand mode. The product already has its design system; you do not choose colours, type or shape. You choose only the free axes, and only options that are available next to this brand.\n\n${brandMenu(seed, brief.surface)}\n\nReturn {"candidates": [{"name": "…", "structure": "…", "rhythm": "…", "imagery": "…", "motion": "…", "signature": {"kind": "…", "detail": "…"}, "why": "one sentence about this product and this page"}]} with exactly two candidates that differ in structure.${refusals ? `\n\nYour previous answer was refused:\n${refusals}` : ''}`,
      sample: attempt
    })
    const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Free), fenced(reply, 'json'))
    const issues = parsed.success
      ? parsed.output.candidates.flatMap((candidate, index) => brandConflicts(seed, candidate, brief.surface).map((issue) => `candidate ${index + 1}: ${issue}`))
      : ['not valid JSON for the schema']
    if (parsed.success && issues.length === 0 && parsed.output.candidates.length === 2) free = parsed.output
    else refusals = issues.join('\n') || 'expected exactly two candidates'
  }
  if (!free) throw new Error(`${brief.id}: free axes refused three times\n${refusals}`)
  writeFileSync(join(home, 'free.json'), JSON.stringify(free, null, 1))
  await Promise.all(
    free.candidates.map(async (candidate, index) => {
      const dir = join(home, `v${index + 1}`)
      mkdirSync(dir, { recursive: true })
      const system = resolveBrand(seed, candidate, brief.surface)
      const reply = await ask({
        label: `brand-build:${brief.id}:v${index + 1}`,
        system: BUILD_SYSTEM,
        prompt: `Brief: ${brief.prompt}\n${frame}\n\nYou called get_screenshot on the existing page: read fold.jpg and full.jpg in the current folder, and match what you see (header, navigation, density, how sections are separated).\n\nWhy these free choices: ${candidate.name}. ${candidate.why}\n\n${brief.surface === 'web' ? 'Top level: <header>, <main> with its <section>s, <footer>, each full width with its content in a container like the existing page.' : 'Top level: one element that is the whole application screen (min-h-screen), with the same shell as the existing screen.'}\n\nTHE SYSTEM — everything that exists:\n\n${brandVocabulary(system, seed)}`,
        images: [join(sourceDir, 'fold.jpg'), join(sourceDir, 'full.jpg')]
      })
      const gated = gate(fenced(reply, 'html'), system)
      writeFileSync(join(dir, 'gate.txt'), describeActions(gated.actions, 200))
      writeFileSync(join(dir, 'page.html'), await buildPage(system, gated.html, brief.product))
      record(`v${index + 1}`, await measured(dir, brief.surface), { snapped: gated.snapped, refused: gated.refused })
    })
  )
  // Brand mode keeps the draft that is cleanest and closest to the product; singularity is not wanted here.
  const total = (result: Result) => 0.35 * result.craft.craft + 0.25 * Math.max(0, 100 - 12 * result.slop) + 40 * (0.5 * result.fidelity.tokens + 0.5 * result.fidelity.components)
  const picked = total(results.v1) >= total(results.v2) ? 'v1' : 'v2'
  writeFileSync(join(home, 'results.json'), JSON.stringify({ picked, results }, null, 1))
  const line = (name: string) => {
    const r = results[name]
    return `${name}: craft ${r.craft.craft.toFixed(0)}, slop ${r.slop}, tokens ${(r.fidelity.tokens * 100).toFixed(0)}% (colour ${(r.fidelity.colour * 100).toFixed(0)}, face ${(r.fidelity.face * 100).toFixed(0)}, size ${(r.fidelity.size * 100).toFixed(0)}, radius ${(r.fidelity.radius * 100).toFixed(0)}), parts ${(r.fidelity.components * 100).toFixed(0)}% of ${r.fidelity.componentCount}`
  }
  console.log(`${brief.id} (picked ${picked})\n  ${['source', 'baseline', 'v1', 'v2'].map(line).join('\n  ')}`)
}

mkdirSync(OUT, { recursive: true })
try {
  // Declared tokens override what a page shows: the path for Kalka variables and code tokens.
  const tokens = join(clones, 'TailAdmin_tailadmin-free-tailwind-dashboard-template/src/css/style.css')
  if (existsSync(tokens)) {
    const blank = seedFromPage({ width: 0, height: 0, viewport: { width: 1440, height: 900 }, scrollWidth: 0, boxes: [], text: '', fontsFailed: [], images: 0 }, 'TailAdmin', 'its Tailwind @theme', '')
    const { applied } = seedFromCSS(blank, readFileSync(tokens, 'utf8'))
    writeFileSync(join(OUT, 'css-seed.txt'), applied.join('\n'))
    console.log(`seedFromCSS on a Tailwind v4 @theme: ${applied.length} tokens mapped (${applied.slice(0, 6).join('; ')})`)
  }
  await pool(BRIEFS.map((brief) => () => run(brief)), parallel)
} finally {
  await closeBrowser()
  console.log(`$${ledgerTotal().cost.toFixed(2)} so far`)
}
