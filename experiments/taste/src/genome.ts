/**
 * The design genome: one choice on each independent axis (structure, type, colour, rhythm,
 * shape, imagery, motion) plus one signature detail written for the subject. A genome resolves
 * to a `System`: the exact values a page may use. The Tailwind theme, the gate and the prompts
 * are all derived from that object, so a value outside the genome cannot reach the page.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { converter, wcagContrast } from 'culori'
import * as v from 'valibot'

export const COLOR_ROLES = [
  'ground',
  'surface',
  'ink',
  'muted',
  'line',
  'accent',
  'on-accent',
  'tint',
  'support',
  'on-support'
] as const
export type ColorRole = (typeof COLOR_ROLES)[number]
export const TYPE_ROLES = ['display', 'h1', 'h2', 'h3', 'lead', 'body', 'small', 'label'] as const
export type TypeRole = (typeof TYPE_ROLES)[number]
export type Surface = 'web' | 'dashboard' | 'mobile'

const toOklch = converter('oklch')

const GENOME_DIR = join(import.meta.dir, '..', 'genome')

function readJSON<T extends v.GenericSchema>(file: string, schema: T): v.InferOutput<T> {
  const parsed = v.safeParse(
    v.pipe(v.string(), v.parseJson(), schema),
    readFileSync(join(GENOME_DIR, file), 'utf8')
  )
  if (!parsed.success) throw new Error(`${file}: ${parsed.issues[0].message}`)
  return parsed.output
}

const face = v.object({
  family: v.string(),
  google: v.string(),
  fallback: v.picklist(['sans-serif', 'serif']),
  licence: v.string(),
  source: v.string()
})
const option = { id: v.string(), use: v.string() }

const TypeAxis = v.object({
  question: v.string(),
  pairing: v.array(
    v.object({
      ...option,
      display: face,
      text: face,
      genre: v.string(),
      displayWeights: v.array(v.number())
    })
  ),
  ratio: v.array(v.object({ ...option, value: v.number() })),
  treatment: v.array(
    v.object({
      ...option,
      displayBoost: v.number(),
      weight: v.picklist(['min', 'mid', 'max']),
      tracking: v.number(),
      leading: v.number(),
      caps: v.boolean()
    })
  )
})
const ColourAxis = v.object({
  question: v.string(),
  strategies: v.record(v.string(), v.string()),
  palette: v.array(
    v.object({
      id: v.string(),
      strategy: v.string(),
      world: v.string(),
      fits: v.array(v.string()),
      colors: v.record(v.picklist(COLOR_ROLES), v.string())
    })
  )
})
const RhythmAxis = v.object({
  question: v.string(),
  options: v.array(
    v.object({
      ...option,
      grid: v.picklist([4, 8]),
      steps: v.array(v.number()),
      section: v.array(v.number())
    })
  )
})
const ShapeAxis = v.object({
  question: v.string(),
  options: v.array(
    v.object({
      ...option,
      radius: v.object({ sm: v.number(), md: v.number(), lg: v.number() }),
      separation: v.picklist(['rules', 'surfaces', 'borders']),
      shadow: v.record(v.string(), v.string())
    })
  )
})
const ImageryAxis = v.object({
  question: v.string(),
  options: v.array(
    v.object({ ...option, images: v.boolean(), grayscale: v.optional(v.boolean()), rule: v.string() })
  )
})
const MotionAxis = v.object({
  question: v.string(),
  options: v.array(v.object({ ...option, classes: v.array(v.string()) }))
})
const SignatureAxis = v.object({
  question: v.string(),
  rule: v.string(),
  kinds: v.array(v.object(option))
})
const StructureAxis = v.object({
  question: v.string(),
  note: v.string(),
  options: v.array(
    v.object({
      ...option,
      surface: v.picklist(['web', 'dashboard', 'mobile']),
      rules: v.array(v.string()),
      recipe: v.string(),
      avoid: v.array(v.string()),
      sources: v.array(v.string())
    })
  )
})
const Compat = v.object({
  forbid: v.array(v.tuple([v.string(), v.string(), v.string()])),
  surface: v.record(v.string(), v.array(v.string())),
  surfaceRules: v.record(v.string(), v.record(v.string(), v.array(v.string())))
})
const Atoms = v.object({
  note: v.string(),
  atoms: v.array(
    v.object({ id: v.string(), recipe: v.string(), rule: v.string(), sources: v.array(v.string()) })
  )
})

export const AXES = {
  structure: readJSON('axes/structure.json', StructureAxis),
  type: readJSON('axes/type.json', TypeAxis),
  colour: readJSON('axes/colour.json', ColourAxis),
  rhythm: readJSON('axes/rhythm.json', RhythmAxis),
  shape: readJSON('axes/shape.json', ShapeAxis),
  imagery: readJSON('axes/imagery.json', ImageryAxis),
  motion: readJSON('axes/motion.json', MotionAxis),
  signature: readJSON('axes/signature.json', SignatureAxis)
}
export const COMPAT = readJSON('compat.json', Compat)
export const ATOMS = readJSON('atoms.json', Atoms)

/** One choice per axis. `signature.detail` is the only free text, written from the brief. */
export const GenomeSchema = v.object({
  structure: v.string(),
  pairing: v.string(),
  ratio: v.string(),
  treatment: v.string(),
  palette: v.string(),
  rhythm: v.string(),
  shape: v.string(),
  imagery: v.string(),
  motion: v.string(),
  signature: v.object({ kind: v.string(), detail: v.string() })
})
export type Genome = v.InferOutput<typeof GenomeSchema>
export const GENOME_AXES = [
  'structure',
  'pairing',
  'ratio',
  'treatment',
  'palette',
  'rhythm',
  'shape',
  'imagery',
  'motion'
] as const
export type GenomeAxis = (typeof GENOME_AXES)[number]

function pick<T extends { id: string }>(items: T[], id: string, axis: string): T {
  const found = items.find((item) => item.id === id)
  if (!found)
    throw new Error(`${axis}: "${id}" is not an option. Options: ${items.map((item) => item.id).join(', ')}`)
  return found
}

function parts(genome: Genome) {
  return {
    structure: pick(AXES.structure.options, genome.structure, 'structure'),
    pairing: pick(AXES.type.pairing, genome.pairing, 'pairing'),
    ratio: pick(AXES.type.ratio, genome.ratio, 'ratio'),
    treatment: pick(AXES.type.treatment, genome.treatment, 'treatment'),
    palette: pick(AXES.colour.palette, genome.palette, 'palette'),
    rhythm: pick(AXES.rhythm.options, genome.rhythm, 'rhythm'),
    shape: pick(AXES.shape.options, genome.shape, 'shape'),
    imagery: pick(AXES.imagery.options, genome.imagery, 'imagery'),
    motion: pick(AXES.motion.options, genome.motion, 'motion'),
    signature: pick(AXES.signature.kinds, genome.signature.kind, 'signature')
  }
}

/** The facts the compatibility matrix is written against, such as `type.genre:condensed`. */
function facts(genome: Genome): Set<string> {
  const chosen = parts(genome)
  // An invented option carries the facts of what it is, so the matrix still binds it.
  const aliases: string[] = []
  if (chosen.treatment.caps) aliases.push('type.treatment:caps-poster')
  else if (chosen.treatment.weight === 'min') aliases.push('type.treatment:light-large')
  else if (chosen.treatment.weight === 'max') aliases.push('type.treatment:heavy-tight')
  const nearestRatio = AXES.type.ratio
    .filter((ratio) => !ratio.id.startsWith('x-'))
    .reduce((best, ratio) => (Math.abs(ratio.value - chosen.ratio.value) < Math.abs(best.value - chosen.ratio.value) ? ratio : best))
  aliases.push(`type.ratio:${nearestRatio.id}`)
  if (chosen.shape.separation === 'rules') aliases.push('shape:square-ruled')
  if (Object.keys(chosen.shape.shadow).length) aliases.push('shape:hard-shadow')
  if (chosen.shape.radius.sm >= 10) aliases.push('shape:pill')
  if (!chosen.imagery.images) aliases.push('imagery:type-only')
  if (chosen.rhythm.steps[chosen.rhythm.steps.length - 1] <= 16) aliases.push('rhythm:compact-4')
  return new Set([
    ...aliases,
    `structure:${genome.structure}`,
    `type.pairing:${genome.pairing}`,
    `type.genre:${chosen.pairing.genre}`,
    `type.ratio:${genome.ratio}`,
    `type.treatment:${genome.treatment}`,
    `colour.palette:${genome.palette}`,
    `colour.strategy:${chosen.palette.strategy}`,
    `rhythm:${genome.rhythm}`,
    `shape:${genome.shape}`,
    `imagery:${genome.imagery}`,
    `motion:${genome.motion}`
  ])
}

/** Why a genome is refused; empty when every pair of choices is compatible. */
export function conflicts(genome: Genome, surface: Surface): string[] {
  const found: string[] = []
  let known: Set<string>
  try {
    known = facts(genome)
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)]
  }
  found.push(...factConflicts(known, genome.structure, surface))
  if (!genome.signature.detail.trim()) found.push('signature.detail is empty')
  return found
}

/** The matrix applied to a set of facts, wherever they come from: a genome or a brand's own system. */
export function factConflicts(known: Set<string>, structure: string, surface: Surface): string[] {
  const found: string[] = []
  if (!COMPAT.surface[surface].includes(structure))
    found.push(
      `structure "${structure}" is not for ${surface}; choose one of ${COMPAT.surface[surface].join(', ')}`
    )
  for (const [key, allowed] of Object.entries(COMPAT.surfaceRules[surface] ?? {})) {
    const chosen = [...known].find((fact) => fact.startsWith(`${key}:`))
    if (chosen && !allowed.includes(chosen.slice(key.length + 1)))
      found.push(`${chosen} is not for ${surface}; choose one of ${allowed.join(', ')}`)
  }
  for (const [a, b, reason] of COMPAT.forbid)
    if (known.has(a) && known.has(b)) found.push(`${a} with ${b}: ${reason}`)
  return found
}

/** How many axes differ between two genomes (the signature kind counts as one). */
export function genomeDistance(a: Genome, b: Genome): number {
  const axes = GENOME_AXES.filter((axis) => a[axis] !== b[axis]).length
  return axes + (a.signature.kind === b.signature.kind ? 0 : 1)
}

/** Every compatible combination for a surface, counted exactly (signature kinds included). */
export function countGenomes(surface: Surface): number {
  let count = 0
  const signature = { kind: AXES.signature.kinds[0].id, detail: 'x' }
  for (const structure of COMPAT.surface[surface])
    for (const pairing of AXES.type.pairing)
      for (const ratio of AXES.type.ratio)
        for (const treatment of AXES.type.treatment)
          for (const palette of AXES.colour.palette)
            for (const rhythm of AXES.rhythm.options)
              for (const shape of AXES.shape.options)
                for (const imagery of AXES.imagery.options) {
                  const genome: Genome = {
                    structure,
                    pairing: pairing.id,
                    ratio: ratio.id,
                    treatment: treatment.id,
                    palette: palette.id,
                    rhythm: rhythm.id,
                    shape: shape.id,
                    imagery: imagery.id,
                    motion: 'still',
                    signature
                  }
                  if (conflicts(genome, surface).length === 0) count++
                }
  const motions = AXES.motion.options.filter(
    (motion) => surface !== 'dashboard' || motion.id !== 'measured'
  ).length
  return count * motions * AXES.signature.kinds.length
}

export type TypeStyle = {
  role: TypeRole
  size: number
  leading: number
  tracking: number
  weight: number
  family: 'display' | 'text'
  caps: boolean
}

/** The resolved values of a genome: what the theme defines and the gate enforces. */
export type System = {
  genome: Genome
  surface: Surface
  grid: 4 | 8
  spacing: number[]
  sectionSteps: number[]
  colors: Record<ColorRole, string>
  fonts: { display: v.InferOutput<typeof face>; text: v.InferOutput<typeof face> }
  type: TypeStyle[]
  weights: number[]
  radius: Record<string, number>
  shadow: Record<string, string>
  separation: 'rules' | 'surfaces' | 'borders'
  images: boolean
  grayscale: boolean
  motion: string[]
  accentIsText: boolean
  /** Set when the system was seeded from an existing product instead of chosen axis by axis. */
  brand?: { name: string; fontHead: string }
}

const even = (value: number) => Math.round(value / 2) * 2

function typeScale(genome: Genome, surface: Surface): TypeStyle[] {
  const { pairing, ratio, treatment } = parts(genome)
  const r = ratio.value
  const body = surface === 'web' ? 17 : 15
  const sizes: Record<TypeRole, number> = {
    label: 12,
    small: surface === 'web' ? 14 : 13,
    body,
    lead: Math.round(body * Math.sqrt(r)),
    h3: even(body * r ** 1.5),
    h2: even(body * r ** 3),
    h1: even(body * r ** 4.5),
    display: 0
  }
  const cap = surface === 'web' ? 136 : 44
  sizes.h1 = Math.min(sizes.h1, surface === 'web' ? 88 : 32)
  sizes.display = Math.min(even(sizes.h1 * treatment.displayBoost), cap)
  const weights = pairing.displayWeights
  const byName = { min: weights[0], mid: weights[Math.floor(weights.length / 2)], max: weights[weights.length - 1] }
  const displayWeight = byName[treatment.weight]
  const headingWeight = treatment.weight === 'min' ? weights[0] : byName.mid
  const small = surface === 'web' ? 1 : 0.5
  return TYPE_ROLES.map((role) => {
    const isDisplay = role === 'display' || role === 'h1'
    const isHeading = role === 'h2' || role === 'h3'
    let leading = 1.55
    if (role === 'display') leading = treatment.leading
    else if (role === 'h1') leading = treatment.leading + 0.06
    else if (role === 'h2') leading = 1.15
    else if (role === 'h3') leading = 1.3
    else if (role === 'lead') leading = 1.45
    else if (role === 'label') leading = 1.3
    let weight = 400
    if (role === 'display') weight = displayWeight
    else if (role === 'h1' || isHeading) weight = headingWeight
    else if (role === 'label') weight = 500
    let tracking = 0
    if (isDisplay) tracking = treatment.tracking * small
    else if (role === 'h2') tracking = (treatment.tracking / 2) * small
    else if (role === 'label' && treatment.caps) tracking = 0.06
    return {
      role,
      size: sizes[role],
      leading: Number(leading.toFixed(2)),
      tracking: Number(tracking.toFixed(3)),
      weight,
      family: isDisplay || isHeading ? 'display' : 'text',
      caps: treatment.caps && (isDisplay || role === 'label')
    }
  })
}

export function resolve(genome: Genome, surface: Surface): System {
  const issues = conflicts(genome, surface)
  if (issues.length) throw new Error(`Genome refused:\n- ${issues.join('\n- ')}`)
  const chosen = parts(genome)
  const type = typeScale(genome, surface)
  const colors = chosen.palette.colors as Record<ColorRole, string>
  const shadow = Object.fromEntries(
    Object.entries(chosen.shape.shadow).map(([name, value]) => [name, value.replace('INK', colors.ink)])
  )
  return {
    genome,
    surface,
    grid: chosen.rhythm.grid,
    spacing: chosen.rhythm.steps,
    sectionSteps: chosen.rhythm.section,
    colors,
    fonts: { display: chosen.pairing.display, text: chosen.pairing.text },
    type,
    weights: [...new Set([400, 500, 600, ...type.map((style) => style.weight)])].sort((a, b) => a - b),
    radius: { none: 0, ...chosen.shape.radius, full: 9999 },
    shadow,
    separation: chosen.shape.separation,
    images: chosen.imagery.images,
    grayscale: chosen.imagery.grayscale === true,
    motion: chosen.motion.classes,
    accentIsText: wcagContrast(colors.accent, colors.ground) >= 4.5
  }
}

/** Checks every palette and the scale it will carry, before anything is drawn. */
export function validateAxes(): string[] {
  const issues: string[] = []
  for (const palette of AXES.colour.palette) {
    const need = (fg: ColorRole, bg: ColorRole, min: number) => {
      const colors = palette.colors as Record<ColorRole, string>
      const ratio = wcagContrast(colors[fg], colors[bg])
      if (ratio < min) issues.push(`${palette.id}: ${fg} on ${bg} is ${ratio.toFixed(2)}, needs ${min}`)
    }
    need('ink', 'ground', 7)
    need('ink', 'surface', 7)
    need('ink', 'tint', 7)
    need('muted', 'ground', 4.5)
    need('muted', 'surface', 4.5)
    need('on-accent', 'accent', 4.5)
    need('on-support', 'support', 4.5)
    if (!(palette.strategy in AXES.colour.strategies)) issues.push(`${palette.id}: unknown strategy`)
  }
  const known = new Set<string>()
  for (const structure of AXES.structure.options) known.add(`structure:${structure.id}`)
  for (const pairing of AXES.type.pairing) known.add(`type.genre:${pairing.genre}`)
  for (const ratio of AXES.type.ratio) known.add(`type.ratio:${ratio.id}`)
  for (const treatment of AXES.type.treatment) known.add(`type.treatment:${treatment.id}`)
  for (const strategy of Object.keys(AXES.colour.strategies)) known.add(`colour.strategy:${strategy}`)
  for (const rhythm of AXES.rhythm.options) known.add(`rhythm:${rhythm.id}`)
  for (const shape of AXES.shape.options) known.add(`shape:${shape.id}`)
  for (const imagery of AXES.imagery.options) known.add(`imagery:${imagery.id}`)
  for (const motion of AXES.motion.options) known.add(`motion:${motion.id}`)
  for (const [a, b] of COMPAT.forbid)
    for (const fact of [a, b]) if (!known.has(fact)) issues.push(`compat names unknown option ${fact}`)
  return issues
}

function fontStack(font: System['fonts']['display']): string {
  const fallback =
    font.fallback === 'serif' ? 'ui-serif, Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif'
  return `"${font.family}", ${fallback}`
}

/** The Tailwind v4 theme: every default palette, size, radius and shadow is removed first. */
export function themeCSS(system: System): string {
  const lines: string[] = [
    '--color-*: initial;',
    '--color-transparent: transparent;',
    '--color-current: currentColor;'
  ]
  for (const role of COLOR_ROLES) lines.push(`--color-${role}: ${system.colors[role]};`)
  lines.push('--font-*: initial;')
  lines.push(`--font-display: ${fontStack(system.fonts.display)};`)
  lines.push(`--font-text: ${fontStack(system.fonts.text)};`)
  lines.push('--text-*: initial;')
  for (const style of system.type) {
    lines.push(`--text-${style.role}: ${style.size / 16}rem;`)
    lines.push(`--text-${style.role}--line-height: ${style.leading};`)
    lines.push(`--text-${style.role}--letter-spacing: ${style.tracking}em;`)
    lines.push(`--text-${style.role}--font-weight: ${style.weight};`)
  }
  lines.push('--radius-*: initial;')
  for (const [name, value] of Object.entries(system.radius)) lines.push(`--radius-${name}: ${value}px;`)
  lines.push('--shadow-*: initial;', '--drop-shadow-*: initial;', '--inset-shadow-*: initial;')
  for (const [name, value] of Object.entries(system.shadow)) lines.push(`--shadow-${name}: ${value};`)
  lines.push('--tracking-*: initial;', '--blur-*: initial;', '--animate-*: initial;')
  const display = system.type.filter((style) => style.family === 'display').map((style) => `.text-${style.role}`)
  const caps = system.type.filter((style) => style.caps).map((style) => `.text-${style.role}`)
  return [
    '@import "tailwindcss";',
    `@theme {\n  ${lines.join('\n  ')}\n}`,
    '@layer base {',
    '  html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }',
    '  body { font-family: var(--font-text); font-size: var(--text-body); line-height: var(--text-body--line-height); background: var(--color-ground); color: var(--color-ink); font-variant-numeric: tabular-nums; }',
    '  h1, h2, h3, h4 { font-family: var(--font-display); text-wrap: balance; }',
    '  p { text-wrap: pretty; }',
    `  img { background: color-mix(in oklab, var(--color-ink) 12%, var(--color-ground));${system.grayscale ? ' filter: grayscale(1);' : ''} }`,
    '}',
    `@layer components { ${display.join(', ')} { font-family: var(--font-display); } }`,
    caps.length ? `@layer components { ${caps.join(', ')} { text-transform: uppercase; } }` : ''
  ].join('\n')
}

export function fontLinks(system: System): string {
  if (system.brand) return system.brand.fontHead
  const families = [...new Set([system.fonts.display.google, system.fonts.text.google])]
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link href="https://fonts.googleapis.com/css2?${families.map((family) => `family=${family}`).join('&')}&display=swap" rel="stylesheet">`
  ].join('\n')
}

/** Rewrites the spacing steps of a recipe to the nearest step of the chosen rhythm (ties go up). */
export function onRhythm(recipe: string, steps: number[]): string {
  return recipe.replace(/\b(p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?)-(\d+)\b/g, (_match, prefix: string, value: string) => {
    const wanted = Number(value)
    const nearest = steps.reduce((best, step) =>
      Math.abs(step - wanted) < Math.abs(best - wanted) || (Math.abs(step - wanted) === Math.abs(best - wanted) && step > best) ? step : best
    )
    return `${prefix}-${nearest}`
  })
}

/** What the agent is told it may write once the genome is chosen: the whole vocabulary. */
export function vocabulary(system: System): string {
  const chosen = parts(system.genome)
  const shadows = Object.keys(system.shadow)
  const control = system.radius.sm >= 10 ? 'full' : 'sm'
  const atoms = ATOMS.atoms
    .filter((atom) => system.separation === 'surfaces' || atom.id !== 'panel')
    .filter((atom) => system.images || atom.id !== 'figure')
    .map(
      (atom) =>
        `  ${atom.id}: ${onRhythm(atom.recipe.replaceAll('{r}', control).replaceAll('{R}', 'lg'), system.spacing)}\n    ${atom.rule}`
    )
  return [
    `STRUCTURE — ${chosen.structure.id}: ${chosen.structure.use}`,
    ...chosen.structure.rules.map((rule) => `  - ${rule}`),
    `  Recipe: ${onRhythm(chosen.structure.recipe, system.spacing)}`,
    `  Never here: ${chosen.structure.avoid.join('; ')}.`,
    '',
    'COLOUR — use as bg-*, text-*, border-*, fill-*, divide-*; opacity such as /10 … /90 is allowed:',
    ...COLOR_ROLES.map((role) => `  ${role}: ${system.colors[role]}`),
    `  Strategy (${chosen.palette.strategy}): ${AXES.colour.strategies[chosen.palette.strategy]}.`,
    system.accentIsText
      ? '  accent may colour text and fills.'
      : '  accent is a FILL only (with text-on-accent on it); it never colours text on the ground.',
    '',
    'TYPE — one class sets size, line height, tracking, weight and face:',
    ...system.type.map(
      (style) =>
        `  text-${style.role}: ${style.size}px, weight ${style.weight}, ${style.family === 'display' ? system.fonts.display.family : system.fonts.text.family}${style.caps ? ', capitals' : ''}`
    ),
    `  font-display = ${system.fonts.display.family}; font-text = ${system.fonts.text.family}. Weights available: ${system.weights.join(', ')}.`,
    '',
    `RHYTHM — ${chosen.rhythm.id}: steps for p-*, m-*, gap-*, space-*: ${system.spacing.map((step) => `${step} (${step * 4}px)`).join(', ')}. Vertical padding of a section: py-${system.sectionSteps[0]} or py-${system.sectionSteps[1]}. Other steps are snapped to the nearest.`,
    '',
    `SHAPE — ${chosen.shape.id}: ${chosen.shape.use}. Radius: ${Object.entries(system.radius)
      .map(([name, value]) => `rounded-${name} (${value === 9999 ? 'pill' : `${value}px`})`)
      .join(', ')}.`,
    shadows.length
      ? `  Shadow: ${shadows.map((name) => `shadow-${name}`).join(', ')}, on the one key object only.`
      : '  No shadow exists in this genome.',
    {
      rules: '  Things separate by rules (border-t, divide-y in line or ink). No filled boxes, no bordered cards.',
      surfaces: '  Things separate by fills (bg-surface, bg-tint). No borders around panels.',
      borders: '  Things separate by one-pixel borders (border border-line or border-ink).'
    }[system.separation],
    '',
    `IMAGERY — ${chosen.imagery.id}: ${chosen.imagery.rule}`,
    system.images
      ? '  Write an image as <img data-photo="what the photograph shows, concretely" alt="…" class="…"> with no src; give it an aspect-* and object-cover.'
      : '',
    '',
    `MOTION — ${chosen.motion.id}: ${chosen.motion.use}.${system.motion.length ? ` Allowed on interactive elements: ${system.motion.join(' ')} with hover: colour changes.` : ' No transition classes.'}`,
    '',
    `SIGNATURE — ${chosen.signature.id}: ${system.genome.signature.detail}`,
    `  ${AXES.signature.rule}`,
    '',
    'ATOMS — recipes for the small parts (write the element yourself, with these classes):',
    ...atoms,
    '',
    'REFUSED by the tools, whatever the reason: gradients, blur and glass, bracketed arbitrary values for colour, type size, spacing or radius, style attributes, <style> and <script>, default Tailwind palette names (gray-500, indigo-600 …), default text sizes (text-xl …), tracking-* and animate-* classes, emoji.',
    'FREE: flex, grid, grid-cols-12, col-span-*, col-start-*, bracketed grid templates such as grid-cols-[220px_1fr], max-w-*, w-*, h-*, min-h-*, aspect-*, order-*, items-*, justify-*, self-*, overflow-*, object-*, border widths, divide-*, italic, underline, tabular-nums, text-left/right/center, uppercase, md: and lg: variants.'
  ]
    .filter((line) => line !== '')
    .join('\n')
}

/** The menu of options the agent reasons over, with the rules that bind them. */
export function menu(surface: Surface): string {
  const allowed = COMPAT.surfaceRules[surface] ?? {}
  const keep = (key: string, id: string) => !(key in allowed) || allowed[key].includes(id)
  const line = (id: string, use: string) => `  ${id} — ${use}`
  return [
    `structure — ${AXES.structure.question}`,
    ...AXES.structure.options.filter((item) => item.surface === surface).map((item) => line(item.id, item.use)),
    `pairing — ${AXES.type.question}`,
    ...AXES.type.pairing.map((item) => line(item.id, `[${item.genre}] ${item.display.family} + ${item.text.family}: ${item.use}`)),
    'ratio — the step between type sizes',
    ...AXES.type.ratio.filter((item) => keep('type.ratio', item.id)).map((item) => line(item.id, item.use)),
    'treatment — how the headline is set',
    ...AXES.type.treatment.map((item) => line(item.id, item.use)),
    `palette — ${AXES.colour.question}`,
    ...AXES.colour.palette.map((item) =>
      line(item.id, `[${item.strategy}] from ${item.world}; ground ${item.colors.ground}, ink ${item.colors.ink}, accent ${item.colors.accent}, support ${item.colors.support}`)
    ),
    `rhythm — ${AXES.rhythm.question}`,
    ...AXES.rhythm.options.filter((item) => keep('rhythm', item.id)).map((item) => line(item.id, item.use)),
    `shape — ${AXES.shape.question}`,
    ...AXES.shape.options.map((item) => line(item.id, item.use)),
    `imagery — ${AXES.imagery.question}`,
    ...AXES.imagery.options.filter((item) => keep('imagery', item.id)).map((item) => line(item.id, item.use)),
    `motion — ${AXES.motion.question}`,
    ...AXES.motion.options.map((item) => line(item.id, item.use)),
    `signature.kind — ${AXES.signature.question}`,
    ...AXES.signature.kinds.map((item) => line(item.id, item.use)),
    '',
    'Combinations the resolver refuses (choose around them):',
    ...COMPAT.forbid.map(([a, b, reason]) => `  ${a} + ${b}: ${reason}`)
  ].join('\n')
}

const hexColor = v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/))
/** Options an agent may add for one page when the menu has nothing that fits the subject. */
export const InventSchema = v.partial(
  v.object({
    palette: v.object({ strategy: v.string(), world: v.string(), colors: v.object(Object.fromEntries(COLOR_ROLES.map((role) => [role, hexColor]))) }),
    pairing: v.object({
      display: v.string(),
      text: v.string(),
      googleDisplay: v.string(),
      googleText: v.string(),
      serifDisplay: v.boolean(),
      genre: v.picklist(['grotesque', 'condensed', 'book-serif', 'display-serif', 'geometric']),
      displayWeights: v.pipe(v.array(v.number()), v.minLength(1))
    }),
    ratio: v.object({ value: v.number() }),
    treatment: v.object({ displayBoost: v.number(), weight: v.picklist(['min', 'mid', 'max']), tracking: v.number(), leading: v.number(), caps: v.boolean() }),
    structure: v.object({ use: v.string(), rules: v.array(v.string()), recipe: v.string(), avoid: v.array(v.string()) }),
    rhythm: v.object({ grid: v.picklist([4, 8]), steps: v.array(v.number()), section: v.array(v.number()) }),
    shape: v.object({ radius: v.object({ sm: v.number(), md: v.number(), lg: v.number() }), separation: v.picklist(['rules', 'surfaces', 'borders']), shadow: v.record(v.string(), v.string()) }),
    imagery: v.object({ images: v.boolean(), grayscale: v.optional(v.boolean()), rule: v.string() })
  })
)
export type Invent = v.InferOutput<typeof InventSchema>

const REFLEX_FACES = /^(inter|roboto|arial|helvetica|open sans|lato|poppins|montserrat|space grotesk|geist|instrument serif|fraunces|syne|plus jakarta sans|dm sans|playfair display|manrope)$/i
const AVERAGE_LAYOUT = /three (equal|identical)|3 (equal|identical)|cent(er|re)d hero|card grid|icon,? (a )?heading/i

/**
 * Adds invented options to the axes under ids of their own, after the checks every menu option
 * already passed: contrast for a palette, the anti-slop catalogue's known defaults for colours
 * and faces, sane ranges for type and spacing. Returns the ids to use, or why it was refused.
 * The genome is a floor, not a menu: what an agent invents must stand on the same floor.
 */
export function registerInvented(prefix: string, invent: Invent, surface: Surface): { ids: Partial<Record<GenomeAxis, string>>; issues: string[] } {
  const ids: Partial<Record<GenomeAxis, string>> = {}
  const issues: string[] = []
  const id = (axis: string) => `x-${prefix}-${axis}`
  const replace = <T extends { id: string }>(list: T[], item: T) => {
    const index = list.findIndex((existing) => existing.id === item.id)
    if (index === -1) list.push(item)
    else list[index] = item
  }
  if (invent.palette) {
    const colors = invent.palette.colors as Record<ColorRole, string>
    const before = issues.length
    const need = (fg: ColorRole, bg: ColorRole, min: number) => {
      const ratio = wcagContrast(colors[fg], colors[bg])
      if (ratio < min) issues.push(`invented palette: ${fg} on ${bg} is ${ratio.toFixed(2)}, needs ${min}`)
    }
    need('ink', 'ground', 7)
    need('ink', 'surface', 7)
    need('ink', 'tint', 7)
    need('muted', 'ground', 4.5)
    need('muted', 'surface', 4.5)
    need('on-accent', 'accent', 4.5)
    need('on-support', 'support', 4.5)
    if (!(invent.palette.strategy in AXES.colour.strategies))
      issues.push(`invented palette: strategy must be one of ${Object.keys(AXES.colour.strategies).join(', ')}`)
    const lch = (color: string) => {
      const value = toOklch(color)
      return { l: value?.l ?? 0, c: value?.c ?? 0, h: value?.h ?? 0 }
    }
    const [ground, accent] = [lch(colors.ground), lch(colors.accent)]
    if (accent.h >= 262 && accent.h <= 305 && accent.c > 0.1) issues.push('invented palette: an indigo or violet accent is the generated default; take the colour from the subject')
    if (ground.l > 0.92 && ground.c > 0.008 && ground.h > 50 && ground.h < 110 && accent.h > 20 && accent.h < 60) issues.push('invented palette: cream ground with a rust or terracotta accent is the newer generated default')
    if (ground.l < 0.3 && ground.c < 0.02 && accent.c > 0.19 && accent.l > 0.75) issues.push('invented palette: neon on neutral dark grey is a generated default; colour the dark ground or calm the accent')
    if (issues.length === before) {
      replace(AXES.colour.palette, { id: id('palette'), strategy: invent.palette.strategy, world: invent.palette.world, fits: [], colors })
      ids.palette = id('palette')
    }
  }
  if (invent.pairing) {
    const pairing = invent.pairing
    const before = issues.length
    for (const family of [pairing.display, pairing.text]) if (REFLEX_FACES.test(family.trim())) issues.push(`invented pairing: ${family} is a reflex face; choose one that belongs to the subject`)
    if (!/^[A-Za-z0-9+]+(:[a-z,@0-9.;]+)?$/.test(pairing.googleDisplay) || !/^[A-Za-z0-9+]+(:[a-z,@0-9.;]+)?$/.test(pairing.googleText))
      issues.push('invented pairing: googleDisplay and googleText must be Google Fonts css2 family specs such as "Libre+Franklin:wght@400;700"')
    if (issues.length === before) {
      const face = (family: string, google: string, serif: boolean) => ({ family, google, fallback: serif ? ('serif' as const) : ('sans-serif' as const), licence: 'as published on Google Fonts (to verify per family)', source: 'Google Fonts' })
      replace(AXES.type.pairing, { id: id('pairing'), use: 'invented for this page', display: face(pairing.display, pairing.googleDisplay, pairing.serifDisplay), text: face(pairing.text, pairing.googleText, false), genre: pairing.genre, displayWeights: [...pairing.displayWeights].sort((a, b) => a - b) })
      ids.pairing = id('pairing')
    }
  }
  if (invent.ratio) {
    if (invent.ratio.value < 1.15 || invent.ratio.value > 1.5) issues.push('invented ratio: must be between 1.15 and 1.5')
    else {
      replace(AXES.type.ratio, { id: id('ratio'), use: 'invented for this page', value: invent.ratio.value })
      ids.ratio = id('ratio')
    }
  }
  if (invent.treatment) {
    const t = invent.treatment
    if (t.tracking < -0.04 || t.tracking > 0.1) issues.push('invented treatment: tracking must be between -0.04em and 0.1em')
    else if (t.displayBoost < 1 || t.displayBoost > 2.2) issues.push('invented treatment: displayBoost must be between 1 and 2.2')
    else if (t.leading < 0.85 || t.leading > 1.25) issues.push('invented treatment: leading must be between 0.85 and 1.25')
    else {
      replace(AXES.type.treatment, { id: id('treatment'), use: 'invented for this page', ...t })
      ids.treatment = id('treatment')
    }
  }
  if (invent.structure) {
    const text = [...invent.structure.rules, invent.structure.recipe].join(' ')
    if (invent.structure.rules.length < 3) issues.push('invented structure: give at least three rules that say where things go')
    else if (AVERAGE_LAYOUT.test(text)) issues.push('invented structure: this describes the average page (equal cards, centred hero); write a composition that follows from the subject')
    else {
      replace(AXES.structure.options, { id: id('structure'), surface, use: invent.structure.use, rules: invent.structure.rules, recipe: invent.structure.recipe, avoid: invent.structure.avoid, sources: [] })
      if (!COMPAT.surface[surface].includes(id('structure'))) COMPAT.surface[surface].push(id('structure'))
      ids.structure = id('structure')
    }
  }
  if (invent.rhythm) {
    const unit = invent.rhythm.grid / 4
    const steps = [...invent.rhythm.steps].sort((a, b) => a - b)
    if (steps.length < 6 || steps.length > 10) issues.push('invented rhythm: six to ten steps')
    else if (steps.some((value) => value % unit !== 0 || value <= 0 || value > 48)) issues.push(`invented rhythm: every step must be a positive multiple of ${invent.rhythm.grid} px, at most 192 px`)
    else {
      replace(AXES.rhythm.options, { id: id('rhythm'), use: 'invented for this page', grid: invent.rhythm.grid, steps, section: invent.rhythm.section.length === 2 ? invent.rhythm.section : steps.slice(-2) })
      ids.rhythm = id('rhythm')
    }
  }
  if (invent.shape) {
    const shadows = Object.values(invent.shape.shadow)
    if (Math.max(...Object.values(invent.shape.radius)) > 40) issues.push('invented shape: radius above 40 px')
    else if (shadows.length > 1) issues.push('invented shape: one shadow at most')
    else if (shadows.some((shadow) => !/^-?\d+px -?\d+px 0(px)? /.test(shadow))) issues.push('invented shape: only a hard shadow (blur 0) may be invented; soft grey shadows are the default this system removes')
    else {
      replace(AXES.shape.options, { id: id('shape'), use: 'invented for this page', ...invent.shape })
      ids.shape = id('shape')
    }
  }
  if (invent.imagery) {
    replace(AXES.imagery.options, { id: id('imagery'), use: 'invented for this page', ...invent.imagery })
    ids.imagery = id('imagery')
  }
  return { ids, issues }
}
