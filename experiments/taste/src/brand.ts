/**
 * Brand mode: when a product already has its colours, type and parts, they are not chosen
 * again. A seed is read from what exists and locks those axes; only the free axes (structure,
 * imagery, motion, signature, and rhythm when the brand has no clear scale) are chosen, and
 * only inside what the compatibility matrix allows next to the brand.
 *
 * Two readers cover every source Kalka has today:
 * - `seedFromPage` reads a rendered page: a live product, a page captured with the Snapshot
 *   extension, or the HTML export of a Kalka document or `.fig` import;
 * - `seedFromCSS` reads custom properties: `kalka tokens` output (Kalka variables), a Tailwind
 *   v4 `@theme`, or a design system's stylesheet. It overrides what the page reader guessed.
 */
import { converter, formatHex, parse, wcagContrast } from 'culori'

import {
  AXES,
  COLOR_ROLES,
  COMPAT,
  factConflicts,
  onRhythm,
  TYPE_ROLES,
  type ColorRole,
  type Surface,
  type System,
  type TypeRole,
  type TypeStyle
} from './genome'
import type { Box, Measurement } from './render'

const oklch = converter('oklch')
const hex = (color: string) => formatHex(parse(color) ?? '#000000') ?? '#000000'
function lchOf(color: string): { l: number; c: number; h: number } {
  const value = oklch(parse(color) ?? parse('#000000'))
  return { l: value?.l ?? 0, c: value?.c ?? 0, h: value?.h ?? 0 }
}
const chroma = (color: string) => lchOf(color).c
const light = (color: string) => lchOf(color).l

export type Component = { id: string; recipe: string; count: number }
export type BrandSeed = {
  name: string
  source: string
  colors: Record<ColorRole, string>
  fonts: { display: string; text: string }
  fontHead: string
  type: TypeStyle[]
  radius: { sm: number; md: number; lg: number }
  shadow: Record<string, string>
  /** Spacing steps (×4 px) the product really uses; empty when it shows no scale. */
  spacing: number[]
  components: Component[]
  /** What the reader could not establish and therefore guessed. */
  guessed: string[]
}

function top<T>(counts: Map<T, number>): T[] {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key)
}
function tally<T>(items: T[], key: (item: T) => string, weight: (item: T) => number): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + weight(item))
  return counts
}
const opaque = (color: string) => {
  const parsed = parse(color)
  return parsed !== undefined && (parsed.alpha === undefined || parsed.alpha > 0.9)
}

function nearestRole(seed: BrandSeed, color: string): ColorRole {
  const target = lchOf(color)
  const distance = (role: ColorRole) => {
    const other = lchOf(seed.colors[role])
    const hue = (((target.h - other.h) * Math.PI) / 180) * Math.min(target.c, other.c)
    return Math.hypot(target.l - other.l, target.c - other.c, hue)
  }
  return COLOR_ROLES.reduce((best, role) => (distance(role) < distance(best) ? role : best))
}

function roleClass(seed: BrandSeed, size: number): string {
  const style = seed.type.reduce((best, candidate) => (Math.abs(candidate.size - size) < Math.abs(best.size - size) ? candidate : best))
  return `text-${style.role}`
}
function radiusClass(seed: BrandSeed, radius: number): string {
  if (radius >= 500) return 'rounded-full'
  const tokens: [string, number][] = [['none', 0], ...Object.entries(seed.radius)]
  return `rounded-${tokens.reduce((best, token) => (Math.abs(token[1] - radius) < Math.abs(best[1] - radius) ? token : best))[0]}`
}
const step = (px: number) => Math.max(0, Math.round(px / 4))
const weightName: Record<number, string> = { 400: 'normal', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black' }

/** The product's own parts, written as recipes in its tokens so the agent reuses them. */
function components(seed: BrandSeed, m: Measurement): Component[] {
  const found: Component[] = []
  const describe = (box: Box, filled: boolean) =>
    [
      'inline-flex items-center justify-center',
      `px-${step(box.padding[1])} py-${step(box.padding[0])}`,
      roleClass(seed, box.fontSize),
      `font-${weightName[Math.round(box.fontWeight / 100) * 100] ?? 'medium'}`,
      radiusClass(seed, box.radius),
      filled ? `bg-${nearestRole(seed, box.bg)} text-${nearestRole(seed, box.color)}` : `text-${nearestRole(seed, box.color)}`,
      box.borderWidths[0] >= 1 ? `border border-${nearestRole(seed, box.borderColor)}` : '',
      box.shadow && 'brand' in seed.shadow ? 'shadow-brand' : ''
    ]
      .filter(Boolean)
      .join(' ')
  const controls = m.boxes.filter((box) => /^(a|button)$/.test(box.tag) && box.h >= 28 && box.h <= 64 && box.padding[1] >= 8)
  const filled = controls.filter((box) => opaque(box.bg) && chroma(box.bg) + Math.abs(light(box.bg) - light(seed.colors.ground)) > 0.2)
  const outlined = controls.filter((box) => !filled.includes(box) && box.borderWidths[0] >= 1)
  const group = (id: string, boxes: Box[], isFilled: boolean) => {
    const recipes = tally(boxes, (box) => describe(box, isFilled), () => 1)
    const best = top(recipes)[0]
    if (best) found.push({ id, recipe: best, count: recipes.get(best) ?? 0 })
  }
  group('button-primary', filled, true)
  group('button-secondary', outlined, false)
  const inputs = m.boxes.filter((box) => /^(input|select|textarea)$/.test(box.tag) && box.h >= 28)
  const inputRecipes = tally(
    inputs,
    (box) => `w-full px-${step(box.padding[1])} py-${step(box.padding[0])} ${roleClass(seed, box.fontSize)} ${radiusClass(seed, box.radius)} bg-${nearestRole(seed, opaque(box.bg) ? box.bg : seed.colors.ground)} border border-${nearestRole(seed, box.borderColor)}`,
    () => 1
  )
  if (top(inputRecipes)[0]) found.push({ id: 'field', recipe: top(inputRecipes)[0], count: inputs.length })
  const cards = m.boxes.filter((box) => box.w >= 200 && box.h >= 100 && box.w < m.width * 0.8 && box.radius > 0 && (box.shadow !== '' || box.borderWidths.every((width) => width >= 1)))
  const cardRecipes = tally(
    cards,
    (box) => `${radiusClass(seed, box.radius)} p-${step(box.padding[0])} bg-${nearestRole(seed, opaque(box.bg) ? box.bg : seed.colors.ground)}${box.borderWidths[0] >= 1 ? ` border border-${nearestRole(seed, box.borderColor)}` : ''}${box.shadow && 'brand' in seed.shadow ? ' shadow-brand' : ''}`,
    () => 1
  )
  if (top(cardRecipes)[0]) found.push({ id: 'card', recipe: top(cardRecipes)[0], count: cards.length })
  return found
}

/** Reads a product's system off one of its rendered pages. */
export function seedFromPage(m: Measurement, name: string, source: string, fontHead: string): BrandSeed {
  const guessed: string[] = []
  const texts = m.boxes.filter((box) => box.ownText >= 2)
  const fills = tally(m.boxes.filter((box) => opaque(box.bg)), (box) => hex(box.bg), (box) => box.w * box.h)
  const ground = top(fills)[0] ?? '#ffffff'
  const neutralFills = top(fills).filter((color) => chroma(color) < 0.04 && color !== ground)
  const inks = tally(texts, (box) => hex(box.color), (box) => box.ownText)
  const neutralInks = top(inks).filter((color) => chroma(color) < 0.06 && wcagContrast(color, ground) >= 3)
  const ink = neutralInks.reduce((best, color) => (wcagContrast(color, ground) > wcagContrast(best, ground) ? color : best), neutralInks[0] ?? '#111111')
  const muted = neutralInks.find((color) => color !== ink && wcagContrast(color, ground) < wcagContrast(ink, ground) - 2) ?? ink
  const chromatic = tally(
    m.boxes.filter((box) => opaque(box.bg) && chroma(box.bg) > 0.08 && light(box.bg) < 0.85 && light(box.bg) > 0.25),
    (box) => hex(box.bg),
    (box) => Math.min(box.w * box.h, 40_000)
  )
  for (const box of texts) if (chroma(box.color) > 0.08) chromatic.set(hex(box.color), (chromatic.get(hex(box.color)) ?? 0) + box.ownText * 40)
  const accents = top(chromatic)
  if (!accents.length) guessed.push('accent (no chromatic colour found; ink used)')
  const accent = accents[0] ?? ink
  const hueOf = (color: string) => lchOf(color).h
  const second = accents.find((color) => Math.abs(hueOf(color) - hueOf(accent)) > 40)
  if (!second) guessed.push('support (the product shows one chromatic colour; ink used)')
  const support = second ?? ink
  const onColor = (fill: string) => {
    const on = tally(texts.filter((box) => box.effectiveBg && hex(box.effectiveBg) === fill), (box) => hex(box.color), (box) => box.ownText)
    return top(on)[0] ?? (wcagContrast('#ffffff', fill) >= 4.5 ? '#ffffff' : ink)
  }
  const tints = top(tally(m.boxes.filter((box) => opaque(box.bg) && chroma(box.bg) > 0.015 && light(box.bg) > 0.9), (box) => hex(box.bg), (box) => box.w * box.h))
  const borders = top(tally(m.boxes.filter((box) => box.borderWidths.some((width) => width >= 1) && opaque(box.borderColor)), (box) => hex(box.borderColor), () => 1)).filter((color) => chroma(color) < 0.05)
  if (!neutralFills.length) guessed.push('surface')
  if (!tints.length) guessed.push('tint')
  const colors: Record<ColorRole, string> = {
    ground,
    surface: neutralFills.find((color) => Math.abs(light(color) - light(ground)) < 0.12) ?? ground,
    ink,
    muted,
    line: borders[0] ?? muted,
    accent,
    'on-accent': onColor(accent),
    tint: tints[0] ?? neutralFills[0] ?? ground,
    support,
    'on-support': onColor(support)
  }

  const sizeChars = tally(texts, (box) => String(Math.round(box.fontSize)), (box) => box.ownText)
  const sizes = [...sizeChars.keys()].map(Number).sort((a, b) => b - a)
  const body = Number(top(sizeChars)[0] ?? 16)
  const above = sizes.filter((size) => size > body).sort((a, b) => a - b)
  const below = sizes.filter((size) => size < body)
  const at = (list: number[], fraction: number, fallback: number) => (list.length ? list[Math.min(list.length - 1, Math.floor(fraction * list.length))] : fallback)
  const roleSizes: Record<TypeRole, number> = {
    display: sizes[0] ?? body * 3,
    h1: at(above, 0.8, body * 2.25),
    h2: at(above, 0.55, body * 1.75),
    h3: at(above, 0.3, body * 1.25),
    lead: above[0] ?? body,
    body,
    small: below[0] ?? body,
    label: below[below.length - 1] ?? body
  }
  const families = tally(texts, (box) => box.fontFamily, (box) => box.ownText)
  const headings = texts.filter((box) => box.fontSize >= roleSizes.h3)
  const displayFamily = top(tally(headings, (box) => box.fontFamily, (box) => box.ownText))[0] ?? top(families)[0] ?? 'sans-serif'
  const weightAt = (size: number) => Number(top(tally(texts.filter((box) => Math.round(box.fontSize) === size), (box) => String(box.fontWeight), (box) => box.ownText))[0] ?? 400)
  const leadingAt = (size: number) => {
    const boxes = texts.filter((box) => Math.round(box.fontSize) === size && box.lineHeight > 0)
    return boxes.length ? Number((boxes[0].lineHeight / boxes[0].fontSize).toFixed(2)) : 1.4
  }
  const trackingAt = (size: number) => Number((texts.find((box) => Math.round(box.fontSize) === size)?.letterSpacing ?? 0).toFixed(3))
  const type: TypeStyle[] = TYPE_ROLES.map((role) => ({
    role,
    size: roleSizes[role],
    leading: leadingAt(roleSizes[role]),
    tracking: Math.max(trackingAt(roleSizes[role]), -0.04),
    weight: weightAt(roleSizes[role]),
    family: roleSizes[role] >= roleSizes.h3 ? 'display' : 'text',
    caps: false
  }))

  const blocks = m.boxes.filter((box) => box.radius > 0 && box.radius < 100 && box.w >= 24)
  const radii = [...tally(blocks, (box) => String(Math.round(box.radius)), () => 1).entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([value]) => Number(value)).sort((a, b) => a - b)
  if (!radii.length) radii.push(0)
  const radius = { sm: radii[0], md: radii[Math.min(1, radii.length - 1)], lg: radii[radii.length - 1] }
  const shadows = top(tally(m.boxes.filter((box) => box.shadow !== ''), (box) => box.shadow, () => 1))
  const spacingCounts = tally(
    m.boxes.flatMap((box) => [...box.padding, ...box.gap, box.margin[0], box.margin[2]]).filter((value) => value > 0 && value % 4 === 0 && value <= 160),
    (value) => String(value / 4),
    () => 1
  )
  const spacing = top(spacingCounts).slice(0, 10).map(Number).sort((a, b) => a - b)

  const seed: BrandSeed = {
    name,
    source,
    colors,
    fonts: { display: displayFamily, text: top(families)[0] ?? displayFamily },
    fontHead,
    type,
    radius,
    shadow: shadows[0] ? { brand: shadows[0] } : {},
    spacing: spacing.length >= 5 ? spacing : [],
    components: [],
    guessed
  }
  seed.components = components(seed, m)
  return seed
}

const ROLE_NAMES: [RegExp, ColorRole][] = [
  [/^(background|bg|ground|base-100|page)$/, 'ground'],
  [/^(foreground|fg|text|ink|base-content|body)$/, 'ink'],
  [/^(card|surface|base-200|panel|muted)$/, 'surface'],
  [/^(muted-foreground|text-muted|secondary-text|subtle)$/, 'muted'],
  [/^(border|line|input|base-300|outline)$/, 'line'],
  [/^(primary|brand|accent|brand-500|primary-500|primary-600|brand-600)$/, 'accent'],
  [/^(primary-foreground|primary-content|on-primary|on-accent)$/, 'on-accent'],
  [/^(brand-50|primary-50|brand-100|primary-100|tint)$/, 'tint'],
  [/^(secondary|destructive|warning|error|error-500|danger)$/, 'support'],
  [/^(secondary-foreground|destructive-foreground|on-secondary)$/, 'on-support']
]

/**
 * Overrides a seed with what custom properties declare: the output of `kalka tokens`, a Tailwind
 * v4 `@theme`, or a design system's `:root`. Declared tokens win over what a page shows.
 */
export function seedFromCSS(seed: BrandSeed, css: string): { seed: BrandSeed; applied: string[] } {
  const next: BrandSeed = structuredClone(seed)
  const applied: string[] = []
  for (const match of css.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;}]+)[;}]/g)) {
    const [name, value] = [match[1].toLowerCase(), match[2].trim()]
    const colorName = name.replace(/^(color|colour|clr)-/, '')
    const parsed = /^(#|rgb|hsl|oklch|oklab)/.test(value) ? parse(value) : undefined
    if (parsed) {
      const role = ROLE_NAMES.find(([pattern]) => pattern.test(colorName))?.[1]
      if (role) {
        next.colors[role] = hex(value)
        applied.push(`${role} ← --${name}`)
      }
      continue
    }
    const family = /^font-(sans|body|text|display|heading|serif|[a-z]+)$/.exec(name)
    if (family && /[a-zA-Z]/.test(value) && !/^\d/.test(value)) {
      const first = value.split(',')[0].replaceAll(/["']/g, '').trim()
      if (family[1] === 'display' || family[1] === 'heading') next.fonts.display = first
      else {
        next.fonts.text = first
        if (!/display|heading/.test(css)) next.fonts.display = first
      }
      applied.push(`font ${family[1]} ← --${name}`)
      continue
    }
    const radius = /^radius(?:-(sm|md|lg))?$/.exec(name)
    const px = /^([\d.]+)(px|rem)$/.exec(value)
    if (radius && px) {
      const size = Number(px[1]) * (px[2] === 'rem' ? 16 : 1)
      if (radius[1] === 'sm' || radius[1] === 'md' || radius[1] === 'lg') next.radius[radius[1]] = size
      else next.radius = { sm: Math.max(0, size - 4), md: Math.max(0, size - 2), lg: size }
      applied.push(`radius ${radius[1] ?? 'base'} ← --${name}`)
    }
  }
  next.guessed = next.guessed.filter((guess) => !applied.some((line) => line.startsWith(guess.split(' ')[0])))
  return { seed: next, applied }
}

/** The facts the compatibility matrix needs, derived from the brand instead of chosen. */
function brandFacts(seed: BrandSeed): Set<string> {
  const ground = lchOf(seed.colors.ground)
  let strategy = 'paper-signal'
  if (ground.l < 0.35) strategy = 'dark-field'
  else if (ground.c > 0.09) strategy = 'saturated-ground'
  else if (ground.c > 0.012) strategy = 'tinted-ground'
  else if (chroma(seed.colors.accent) < 0.05) strategy = 'monochrome-mark'
  const display = seed.type.find((style) => style.role === 'display')
  const body = seed.type.find((style) => style.role === 'body')
  const ratio = display && body ? display.size / body.size : 3
  let shape = 'crisp-border'
  if (seed.radius.lg === 0) shape = 'square-surface'
  else if (seed.radius.sm >= 10) shape = 'pill'
  else if (seed.radius.lg >= 12) shape = 'soft-surface'
  const family = seed.fonts.display.toLowerCase()
  let genre = 'grotesque'
  if (/condensed|narrow|compressed/.test(family)) genre = 'condensed'
  else if (/serif|garamond|times|georgia|playfair|merriweather|lora/.test(family) && !/sans/.test(family)) genre = 'book-serif'
  return new Set([
    `colour.strategy:${strategy}`,
    `shape:${shape}`,
    `type.genre:${genre}`,
    `type.treatment:${(display?.weight ?? 400) >= 700 ? 'heavy-tight' : 'plain'}`,
    `type.ratio:${ratio > 5 ? '1.414' : ratio > 3.6 ? '1.333' : ratio > 2.6 ? '1.25' : '1.2'}`
  ])
}

/** The only choices left in brand mode. */
export type FreeAxes = {
  structure: string
  rhythm: string
  imagery: string
  motion: string
  signature: { kind: string; detail: string }
}

export function brandConflicts(seed: BrandSeed, free: FreeAxes, surface: Surface): string[] {
  const issues: string[] = []
  const check = (axis: string, id: string, options: { id: string }[]) => {
    if (!options.some((option) => option.id === id)) issues.push(`${axis}: "${id}" is not an option. Options: ${options.map((option) => option.id).join(', ')}`)
  }
  check('structure', free.structure, AXES.structure.options)
  check('imagery', free.imagery, AXES.imagery.options)
  check('motion', free.motion, AXES.motion.options)
  check('signature.kind', free.signature.kind, AXES.signature.kinds)
  if (seed.spacing.length) {
    if (free.rhythm !== 'brand') issues.push('rhythm is locked by the brand; answer "brand"')
  } else check('rhythm', free.rhythm, AXES.rhythm.options)
  if (issues.length) return issues
  const known = brandFacts(seed)
  known.add(`structure:${free.structure}`).add(`imagery:${free.imagery}`).add(`motion:${free.motion}`)
  if (free.rhythm !== 'brand') known.add(`rhythm:${free.rhythm}`)
  // The surface rules on type ratio bind a chosen ratio, not one the brand already has.
  const conflicts = factConflicts(known, free.structure, surface).filter((issue) => !issue.startsWith('type.ratio') || !issue.includes('is not for'))
  if (!free.signature.detail.trim()) conflicts.push('signature.detail is empty')
  return conflicts
}

export function resolveBrand(seed: BrandSeed, free: FreeAxes, surface: Surface): System {
  const issues = brandConflicts(seed, free, surface)
  if (issues.length) throw new Error(`Refused next to the brand:\n- ${issues.join('\n- ')}`)
  const rhythm = AXES.rhythm.options.find((option) => option.id === free.rhythm)
  const spacing = seed.spacing.length ? seed.spacing : (rhythm?.steps ?? [1, 2, 3, 4, 6, 8, 12, 16, 24])
  const imagery = AXES.imagery.options.find((option) => option.id === free.imagery)
  const face = (family: string) => ({ family, google: '', fallback: 'sans-serif' as const, licence: 'the brand\'s own', source: seed.source })
  const facts = brandFacts(seed)
  return {
    genome: { structure: free.structure, pairing: 'brand', ratio: 'brand', treatment: 'brand', palette: 'brand', rhythm: free.rhythm, shape: 'brand', imagery: free.imagery, motion: free.motion, signature: free.signature },
    surface,
    grid: 4,
    spacing,
    sectionSteps: [spacing[Math.max(0, spacing.length - 2)], spacing[spacing.length - 1]],
    colors: seed.colors,
    fonts: { display: face(seed.fonts.display), text: face(seed.fonts.text) },
    type: seed.type,
    weights: [...new Set([400, 500, 600, 700, ...seed.type.map((style) => style.weight)])].sort((a, b) => a - b),
    radius: { none: 0, ...seed.radius, full: 9999 },
    shadow: seed.shadow,
    separation: facts.has('shape:square-surface') || facts.has('shape:soft-surface') || facts.has('shape:pill') ? 'surfaces' : 'borders',
    images: imagery?.images ?? true,
    grayscale: imagery?.grayscale === true,
    motion: AXES.motion.options.find((option) => option.id === free.motion)?.classes ?? [],
    accentIsText: wcagContrast(seed.colors.accent, seed.colors.ground) >= 4.5,
    brand: { name: seed.name, fontHead: seed.fontHead }
  }
}

/** The menu in brand mode: what is locked, and the free axes with what the matrix leaves open. */
export function brandMenu(seed: BrandSeed, surface: Surface): string {
  const facts = brandFacts(seed)
  const blocked = (fact: string) => COMPAT.forbid.find(([a, b]) => (a === fact && facts.has(b)) || (b === fact && facts.has(a)))
  const open = <T extends { id: string; use: string }>(axis: string, options: T[]) =>
    options.map((option) => {
      const refusal = blocked(`${axis}:${option.id}`)
      return refusal ? `  ${option.id} — NOT AVAILABLE next to this brand: ${refusal[2]}` : `  ${option.id} — ${option.use}`
    })
  return [
    `LOCKED by ${seed.name} (read from ${seed.source}); not yours to choose:`,
    `  colours: ${COLOR_ROLES.map((role) => `${role} ${seed.colors[role]}`).join(', ')}`,
    `  type: ${seed.fonts.display}${seed.fonts.text === seed.fonts.display ? '' : ` with ${seed.fonts.text}`}; sizes ${seed.type.map((style) => `${style.role} ${style.size}`).join(', ')}`,
    `  shape: radius ${seed.radius.sm}/${seed.radius.md}/${seed.radius.lg} px${'brand' in seed.shadow ? ', one shadow' : ', no shadow'}`,
    seed.spacing.length ? `  rhythm: steps ${seed.spacing.map((value) => value * 4).join(', ')} px (answer rhythm "brand")` : '  rhythm: not established by the product; you choose it',
    `  parts: ${seed.components.map((component) => component.id).join(', ') || 'none found'}`,
    '',
    `FREE — structure: ${AXES.structure.question}`,
    ...open('structure', AXES.structure.options.filter((option) => option.surface === surface)),
    ...(seed.spacing.length ? [] : [`FREE — rhythm: ${AXES.rhythm.question}`, ...open('rhythm', AXES.rhythm.options)]),
    `FREE — imagery: ${AXES.imagery.question}`,
    ...open('imagery', AXES.imagery.options),
    `FREE — motion: ${AXES.motion.question}`,
    ...open('motion', AXES.motion.options),
    `FREE — signature.kind: ${AXES.signature.question}`,
    ...AXES.signature.kinds.map((kind) => `  ${kind.id} — ${kind.use}`)
  ].join('\n')
}

export function brandVocabulary(system: System, seed: BrandSeed): string {
  const structure = AXES.structure.options.find((option) => option.id === system.genome.structure)
  const imagery = AXES.imagery.options.find((option) => option.id === system.genome.imagery)
  return [
    `This is ${seed.name}'s existing design system. The page must look like one more page of the same product.`,
    '',
    `STRUCTURE — ${structure?.id}: ${structure?.use}`,
    ...(structure?.rules.map((rule) => `  - ${rule}`) ?? []),
    `  Recipe: ${onRhythm(structure?.recipe ?? '', system.spacing)}`,
    '',
    'COLOUR (the brand\'s; use as bg-*, text-*, border-*, with /opacity):',
    ...COLOR_ROLES.map((role) => `  ${role}: ${system.colors[role]}`),
    system.accentIsText ? '' : '  accent is a FILL only; it does not pass as text on the ground.',
    '',
    'TYPE (the brand\'s scale; one class sets size, line height, weight and face):',
    ...system.type.map((style) => `  text-${style.role}: ${style.size}px, weight ${style.weight}`),
    `  Faces: ${seed.fonts.display}${seed.fonts.text === seed.fonts.display ? '' : `, ${seed.fonts.text}`}. Weights: ${system.weights.join(', ')}.`,
    '',
    `RHYTHM: steps for p-*, m-*, gap-*: ${system.spacing.map((value) => `${value} (${value * 4}px)`).join(', ')}.`,
    `SHAPE: ${Object.entries(system.radius).map(([name, value]) => `rounded-${name} (${value === 9999 ? 'pill' : `${value}px`})`).join(', ')}.${'brand' in system.shadow ? ' Shadow: shadow-brand, where the product uses it (cards).' : ' No shadow.'}`,
    '',
    'PARTS — the product\'s own components. Use these recipes exactly for every button, field and card; do not design new ones:',
    ...seed.components.map((component) => `  ${component.id}: ${component.recipe}`),
    '',
    `IMAGERY — ${imagery?.id}: ${imagery?.rule}`,
    system.images ? '  Write an image as <img data-photo="what it shows" alt="…" class="…"> with no src.' : '',
    `SIGNATURE — ${system.genome.signature.kind}: ${system.genome.signature.detail}`,
    '',
    'REFUSED by the tools: any colour, size, radius or shadow that is not above, gradients, blur, bracketed arbitrary values for those, style attributes, <style>, default Tailwind palette names and text sizes, emoji.',
    'FREE: flex, grid, col-span-*, bracketed grid templates, max-w-*, w-*, h-*, aspect-*, items-*, justify-*, border widths, divide-*, underline, tabular-nums, text alignment.'
  ]
    .filter((line) => line !== '')
    .join('\n')
}

export type Fidelity = {
  /** Share of painted and written colour that is one of the brand's colours. */
  colour: number
  /** Share of text set in the brand's faces. */
  face: number
  /** Share of text set at a size of the brand's scale. */
  size: number
  /** Share of rounded boxes using a brand radius. */
  radius: number
  tokens: number
  /** Share of buttons, fields and cards that match a brand part (fill, radius, padding, size). */
  components: number
  componentCount: number
}

/** How much of a page is made of the brand: measured on the rendered result, whoever drew it. */
export function fidelity(seed: BrandSeed, reference: Measurement, m: Measurement): Fidelity {
  const palette = Object.values(seed.colors).map(lchOf)
  const inPalette = (color: string) => {
    const value = lchOf(color)
    return palette.some((other) => {
      const hue = (((value.h - other.h) * Math.PI) / 180) * Math.min(value.c, other.c)
      return Math.hypot(value.l - other.l, value.c - other.c, hue) < 0.035
    })
  }
  const ratio = (hits: number, total: number) => (total ? hits / total : 1)
  const texts = m.boxes.filter((box) => box.ownText >= 2)
  let weightAll = 0
  let weightIn = 0
  for (const box of m.boxes) {
    if (opaque(box.bg)) {
      const weight = Math.sqrt(box.w * box.h)
      weightAll += weight
      if (inPalette(box.bg)) weightIn += weight
    }
    if (box.ownText >= 2) {
      const weight = box.ownText * 2
      weightAll += weight
      if (inPalette(box.color)) weightIn += weight
    }
  }
  const chars = texts.reduce((sum, box) => sum + box.ownText, 0)
  const faces = new Set([seed.fonts.display, seed.fonts.text])
  const sizes = new Set(seed.type.map((style) => Math.round(style.size)))
  const radii = new Set([0, ...Object.values(seed.radius).map(Math.round)])
  const rounded = m.boxes.filter((box) => box.radius > 0 && box.radius < 100 && box.w >= 24)
  const signature = (box: Box) => `${opaque(box.bg) ? hex(box.bg) : 'none'}|${Math.round(box.radius)}|${Math.round(box.padding[0])}|${Math.round(box.padding[1])}|${Math.round(box.fontSize)}|${box.fontWeight}`
  const isControl = (box: Box) => (/^(a|button)$/.test(box.tag) && box.h >= 28 && box.h <= 64 && box.padding[1] >= 8) || /^(input|select|textarea)$/.test(box.tag)
  const known = new Set(reference.boxes.filter(isControl).map(signature))
  const controls = m.boxes.filter(isControl)
  const colour = ratio(weightIn, weightAll)
  const face = ratio(texts.filter((box) => faces.has(box.fontFamily)).reduce((sum, box) => sum + box.ownText, 0), chars)
  const size = ratio(texts.filter((box) => sizes.has(Math.round(box.fontSize))).reduce((sum, box) => sum + box.ownText, 0), chars)
  const radius = ratio(rounded.filter((box) => radii.has(Math.round(box.radius))).length, rounded.length)
  return {
    colour,
    face,
    size,
    radius,
    tokens: (colour + face + size + radius) / 4,
    components: ratio(controls.filter((box) => known.has(signature(box))).length, controls.length),
    componentCount: controls.length
  }
}
