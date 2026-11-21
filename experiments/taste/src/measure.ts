/**
 * Everything computed from what the browser laid out: the four craft metrics (spacing rhythm,
 * type scale, contrast, alignment), the anti-slop lint, and the style vector the singularity
 * score compares with the average generated page. No model is involved anywhere in this file.
 */
import { converter, parse, wcagContrast } from 'culori'

import type { Box, Measurement } from './render'

const oklch = converter('oklch')

type Lch = { l: number; c: number; h: number }
function lch(color: string): Lch | null {
  const parsed = parse(color)
  if (!parsed || (parsed.alpha !== undefined && parsed.alpha < 0.5)) return null
  const value = oklch(parsed)
  return { l: value.l, c: value.c, h: value.h ?? 0 }
}

const textBoxes = (m: Measurement) => m.boxes.filter((box) => box.ownText >= 2)
const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0)
const clamp = (value: number) => Math.max(0, Math.min(1, value))

function weightedCounts<T>(items: T[], key: (item: T) => number, weight: (item: T) => number) {
  const counts = new Map<number, number>()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + weight(item))
  return counts
}

export type Craft = {
  /** Share of paddings, vertical margins and gaps on a 4 px grid. */
  spacingGrid: number
  spacingDistinct: number
  rhythm: number
  typeSizes: number
  typeMinStep: number
  displayRatio: number
  typeScale: number
  contrastFailRate: number
  contrastMin: number
  contrast: number
  alignShare: number
  nearMisses: number
  alignment: number
  overflow: boolean
  clipped: number
  craft: number
}

export function craft(m: Measurement): Craft {
  const spacing: number[] = []
  for (const box of m.boxes) {
    for (const value of box.padding) if (value > 0) spacing.push(value)
    for (const value of [box.margin[0], box.margin[2]]) if (value > 0) spacing.push(value)
    for (const value of box.gap) if (value > 0) spacing.push(value)
  }
  const onGrid = spacing.filter((value) => Math.abs(value / 4 - Math.round(value / 4)) < 0.02).length
  const spacingGrid = share(onGrid, spacing.length)
  const spacingDistinct = new Set(spacing.map((value) => Math.round(value))).size
  const rhythm = clamp(0.6 * spacingGrid + 0.4 * clamp(1 - (spacingDistinct - 9) / 16))

  const texts = textBoxes(m)
  const sizeCounts = weightedCounts(texts, (box) => Math.round(box.fontSize), (box) => box.ownText)
  const totalChars = [...sizeCounts.values()].reduce((sum, value) => sum + value, 0)
  // A size that carries almost no text is a one-off, not a level of the scale.
  const sizes = [...sizeCounts.entries()]
    .filter(([, chars]) => chars / totalChars >= 0.004 || chars >= 12)
    .map(([size]) => size)
    .sort((a, b) => a - b)
  let typeMinStep = 9
  for (let index = 1; index < sizes.length; index++)
    typeMinStep = Math.min(typeMinStep, sizes[index] / sizes[index - 1])
  if (sizes.length < 2) typeMinStep = 1
  let body = 16
  let bodyChars = 0
  for (const [size, chars] of sizeCounts) if (chars > bodyChars) [body, bodyChars] = [size, chars]
  const displayRatio = sizes.length ? sizes[sizes.length - 1] / body : 1
  const typeScale = clamp(
    0.45 * clamp(1 - (sizes.length - 7) / 6) +
      0.3 * clamp((typeMinStep - 1.02) / 0.1) +
      0.25 * clamp((displayRatio - 1.5) / 2)
  )

  let judged = 0
  let failed = 0
  let contrastMin = 21
  for (const box of texts) {
    if (!box.effectiveBg) continue
    const ratio = wcagContrast(box.color, box.effectiveBg)
    const large = box.fontSize >= 24 || (box.fontSize >= 18.5 && box.fontWeight >= 700)
    judged++
    if (ratio < (large ? 3 : 4.5)) failed++
    contrastMin = Math.min(contrastMin, ratio)
  }
  const contrastFailRate = share(failed, judged)
  const contrast = clamp(1 - contrastFailRate * 5)

  const lefts = new Map<number, number>()
  for (const box of texts) {
    if (box.textAlign === 'center' || box.textAlign === 'right' || box.textAlign === 'end') continue
    if (box.display === 'inline') continue
    lefts.set(box.x, (lefts.get(box.x) ?? 0) + 1)
  }
  const edges = [...lefts.entries()].sort((a, b) => b[1] - a[1])
  const total = edges.reduce((sum, [, count]) => sum + count, 0)
  const alignShare = share(edges.slice(0, 6).reduce((sum, [, count]) => sum + count, 0), total)
  let nearMisses = 0
  const strong = edges.filter(([, count]) => count >= 2).map(([x]) => x).sort((a, b) => a - b)
  for (let index = 1; index < strong.length; index++) {
    const delta = strong[index] - strong[index - 1]
    if (delta >= 1 && delta <= 3) nearMisses++
  }
  const alignment = clamp(0.75 * clamp(alignShare / 0.75) + 0.25 * clamp(1 - nearMisses / 4))

  const overflow = m.scrollWidth > m.viewport.width + 2
  const clipped = m.boxes.filter((box) => box.clipped).length
  const penalty = (overflow ? 0.15 : 0) + Math.min(0.15, clipped * 0.03)
  return {
    spacingGrid,
    spacingDistinct,
    rhythm,
    typeSizes: sizes.length,
    typeMinStep,
    displayRatio,
    typeScale,
    contrastFailRate,
    contrastMin: judged ? contrastMin : 0,
    contrast,
    alignShare,
    nearMisses,
    alignment,
    overflow,
    clipped,
    craft: 100 * clamp((rhythm + typeScale + contrast + alignment) / 4 - penalty)
  }
}

export type Palette = { ground: Lch; accent: Lch | null; darkGround: boolean; chromatic: number }

/** The page's ground (largest fill) and its strongest chromatic colour by painted area. */
export function palette(m: Measurement): Palette {
  const area = new Map<string, number>()
  for (const box of m.boxes) {
    const color = lch(box.bg)
    if (color) area.set(box.bg, (area.get(box.bg) ?? 0) + box.w * box.h)
  }
  const ranked = [...area.entries()].sort((a, b) => b[1] - a[1])
  const ground = (ranked[0] ? lch(ranked[0][0]) : null) ?? { l: 1, c: 0, h: 0 }
  const chroma = new Map<string, number>()
  for (const box of m.boxes) {
    const fill = lch(box.bg)
    if (fill && fill.c > 0.07) chroma.set(box.bg, (chroma.get(box.bg) ?? 0) + box.w * box.h)
    if (box.ownText) {
      const ink = lch(box.color)
      if (ink && ink.c > 0.07) chroma.set(box.color, (chroma.get(box.color) ?? 0) + box.ownText * box.fontSize * 8)
    }
  }
  const ranking = [...chroma.entries()].sort((a, b) => b[1] - a[1])
  const top = ranking.find(([color]) => {
    const value = lch(color)
    return value !== null && Math.abs(value.l - ground.l) + value.c > 0.2
  })
  return {
    ground,
    accent: top ? lch(top[0]) : null,
    darkGround: ground.l < 0.3,
    chromatic: ranking.length
  }
}

const REFLEX_FACES = [
  'inter',
  'roboto',
  'arial',
  'helvetica',
  'open sans',
  'lato',
  'poppins',
  'montserrat',
  'space grotesk',
  'geist',
  'instrument serif',
  'fraunces',
  'syne',
  'plus jakarta sans',
  'dm sans',
  'dm serif display',
  'playfair display',
  'manrope',
  'system-ui',
  '-apple-system',
  'ui-sans-serif',
  'sans-serif',
  'segoe ui'
]
const GENERIC_CTA =
  /^(get started( (for )?free| now| today)?|learn more|start (your )?free trial|sign up( (for )?free)?|try (it )?(for )?free|book a demo|request a demo|contact (us|sales)|start now|join now|explore( more)?|discover more|read more|see more|view all)\W*$/i
const MONO = /mono|courier|consolas|menlo|code/i

export type Finding = { rule: string; weight: number; count: number; note: string }

function ancestors(m: Measurement, box: Box): Box[] {
  const chain: Box[] = []
  let parent = box.parent
  while (parent >= 0 && chain.length < 40) {
    chain.push(m.boxes[parent])
    parent = m.boxes[parent].parent
  }
  return chain
}

function isCard(box: Box, ground: Lch): boolean {
  if (box.w < 120 || box.h < 80) return false
  const fill = lch(box.bg)
  const filled = fill !== null && Math.abs(fill.l - ground.l) + fill.c > 0.015
  const bordered = box.borderWidths.filter((width) => width >= 1).length === 4
  return (filled || bordered || box.shadow !== '') && box.childCount > 0
}

function gradientHues(image: string): number[] {
  const hues: number[] = []
  for (const match of image.matchAll(/rgba?\([^)]+\)|#[0-9a-f]{3,8}|oklch\([^)]+\)|hsla?\([^)]+\)/gi)) {
    const color = lch(match[0])
    if (color && color.c > 0.08) hues.push(color.h)
  }
  return hues
}

/** The signs of the anti-slop catalogue that can be measured, each counted where it appears. */
export function lint(m: Measurement, surface: 'web' | 'dashboard' | 'mobile'): Finding[] {
  const findings: Finding[] = []
  const add = (rule: string, weight: number, count: number, note: string) => {
    if (count > 0) findings.push({ rule, weight, count, note })
  }
  const texts = textBoxes(m)
  const colours = palette(m)
  const headings = texts.filter((box) => /^h[1-4]$/.test(box.tag))
  const largest = texts.reduce<Box | null>((best, box) => (!best || box.fontSize > best.fontSize ? box : best), null)

  if (largest) {
    const face = largest.fontFamily.toLowerCase()
    add('reflex-face', 2, REFLEX_FACES.includes(face) ? 1 : 0, `display face is ${largest.fontFamily}`)
  }
  add('font-never-loads', 2, m.fontsFailed.length, m.fontsFailed.join(', '))

  const gradients = m.boxes.filter((box) => box.bgImage.includes('gradient'))
  const purple = gradients.filter((box) => gradientHues(box.bgImage).some((hue) => hue >= 250 && hue <= 330))
  add('purple-gradient', 3, purple.length, 'gradient stops between 250° and 330°')
  add('gradient-text', 3, m.boxes.filter((box) => box.bgClipText).length, 'gradient inside letters')
  add('gradients-everywhere', 1, gradients.length >= 3 ? gradients.length : 0, `${gradients.length} gradient fills`)
  add('glass', 2, m.boxes.filter((box) => box.backdrop).length, 'backdrop blur')

  const soft = m.boxes.filter((box) => {
    const blur = /(-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px/.exec(box.shadow)
    return blur !== null && Number(blur[3]) >= 6
  })
  const radii = new Set(m.boxes.filter((box) => box.radius > 0 && box.radius < 500).map((box) => Math.round(box.radius)))
  add('soft-shadow-everywhere', 2, soft.length >= 5 ? soft.length : 0, `${soft.length} soft shadows`)
  add('one-radius-one-shadow', 1, radii.size === 1 && soft.length >= 3 ? 1 : 0, 'a single radius with soft shadows')
  const glow = m.boxes.filter((box) => {
    if (!box.shadow || !/^(a|button)$/.test(box.tag)) return false
    const color = lch(/rgba?\([^)]+\)/.exec(box.shadow)?.[0] ?? '')
    return color !== null && color.c > 0.08
  })
  add('button-glow', 2, glow.length, 'coloured shadow under a button')

  const eyebrows = texts.filter(
    (box) => box.textTransform === 'uppercase' && box.fontSize <= 14 && box.letterSpacing >= 0.04 && box.text.length <= 40
  )
  add('tracked-caps-eyebrows', 2, eyebrows.length >= 3 ? eyebrows.length : 0, 'small spaced capitals above headings')
  const mono = texts.filter((box) => MONO.test(box.fontFamily) && box.fontSize <= 14 && !/^(code|pre|kbd)$/.test(box.tag))
  add('mono-labels', 2, mono.length >= 3 ? mono.length : 0, 'monospace labels as a technical signal')

  const cardGroups = m.boxes.filter((parent, index) => {
    if (parent.childCount < 3 || parent.childCount > 6) return false
    const children = m.boxes.filter((box) => box.parent === index)
    if (children.length !== parent.childCount) return false
    const signatures = new Set(children.map((child) => `${child.tag}:${child.childSignature}`))
    if (signatures.size !== 1) return false
    const widths = new Set(children.map((child) => Math.round(child.w / 8)))
    if (widths.size !== 1) return false
    const sameRow = new Set(children.map((child) => child.y)).size < children.length
    return sameRow && children.every((child) => isCard(child, colours.ground) && child.h < 420 && child.childCount <= 5)
  })
  add('identical-card-row', 3, cardGroups.length, 'a row of identical cards')

  const chars = texts.reduce((sum, box) => sum + box.ownText, 0)
  const centred = texts.filter((box) => box.textAlign === 'center').reduce((sum, box) => sum + box.ownText, 0)
  add('everything-centred', 2, surface === 'web' && share(centred, chars) > 0.5 ? 1 : 0, `${Math.round(share(centred, chars) * 100)}% of text centred`)

  const stripes = m.boxes.filter((box) => {
    const [top, right, bottom, left] = box.borderWidths
    const accent = lch(box.borderColor)
    return left >= 3 && top <= 1 && right <= 1 && bottom <= 1 && accent !== null && accent.c > 0.06 && box.h < 400
  })
  add('side-stripe', 2, stripes.length, 'thick coloured stripe on one side')

  const emoji = m.text.match(/\p{Extended_Pictographic}/gu)?.filter((glyph) => !'©®™'.includes(glyph)) ?? []
  add('emoji-icons', 2, emoji.length, emoji.slice(0, 6).join(' '))
  add('middle-dots', 1, (m.text.match(/ [·•] /g) ?? []).length >= 2 ? (m.text.match(/ [·•] /g) ?? []).length : 0, 'meta joined with dots')
  const markers = texts.filter((box) => /^0[1-9]\.?$/.test(box.text))
  add('numbered-markers', 2, markers.length >= 3 ? markers.length : 0, '01 / 02 / 03 markers')
  const arrows = texts.filter((box) => /(→|->|›|»|↗)\s*$/.test(box.text))
  add('arrow-on-links', 1, arrows.length >= 3 ? arrows.length : 0, 'an arrow on every link')
  const generic = texts.filter((box) => /^(a|button|span)$/.test(box.tag) && GENERIC_CTA.test(box.text.replace(/(→|->|›|»|↗)\s*$/, '').trim()))
  add('generic-cta', 2, generic.length, generic.slice(0, 3).map((box) => `"${box.text}"`).join(', '))

  const tight = headings.filter((box) => box.letterSpacing < -0.041)
  add('squeezed-headline', 1, tight.length, 'tracking tighter than -0.04em')
  const heavy = headings.filter((box) => box.fontWeight >= 800)
  add('heaviest-everywhere', 1, headings.length >= 4 && heavy.length === headings.length ? 1 : 0, 'every heading at the heaviest weight')

  const accentWords = m.boxes.filter((box) => {
    if (!/^(em|i|span|strong|mark)$/.test(box.tag) || box.ownText < 2 || box.parent < 0) return false
    const parent = m.boxes[box.parent]
    if (!/^h[12]$/.test(parent.tag)) return false
    return box.fontStyle !== parent.fontStyle || box.color !== parent.color || box.fontFamily !== parent.fontFamily
  })
  add('accent-word-in-headline', 2, accentWords.length, 'one headline word in another colour, italic or face')

  const cards = m.boxes.filter((box) => isCard(box, colours.ground) && box.radius >= 6)
  const cardSet = new Set(cards)
  const nested = cards.filter((box) => ancestors(m, box).some((ancestor) => cardSet.has(ancestor) && ancestor.w < m.width * 0.9))
  add('nested-cards', 2, nested.length >= 2 ? nested.length : 0, 'cards inside cards')

  const h1 = m.boxes.find((box) => box.tag === 'h1')
  if (h1) {
    const pill = texts.filter(
      (box) => box.radius >= box.h / 2 - 1 && box.h <= 40 && box.h >= 18 && box.y < h1.y && box.y > h1.y - 90 && box.text.length <= 60
    )
    add('pill-above-headline', 2, pill.length, 'a pill badge over the hero headline')
  }
  add('missing-h1', 1, surface === 'web' && !h1 ? 1 : 0, 'no h1')

  const accent = colours.accent
  if (accent) {
    add('indigo-accent', 2, accent.h >= 262 && accent.h <= 305 && accent.c > 0.1 ? 1 : 0, `accent hue ${Math.round(accent.h)}°`)
    const serif = largest ? /serif|garamond|playfair|fraunces|georgia|times|newsreader|lora|cormorant/i.test(largest.fontFamily) && !/sans/i.test(largest.fontFamily) : false
    const cream = colours.ground.l > 0.92 && colours.ground.c > 0.008 && colours.ground.c < 0.06 && colours.ground.h > 50 && colours.ground.h < 110
    add('cream-serif-terracotta', 3, cream && serif && accent.h > 20 && accent.h < 60 ? 1 : 0, 'cream ground, serif display, rust accent')
    add('dark-neon', 3, colours.darkGround && accent.c > 0.19 && accent.l > 0.75 && colours.ground.c < 0.02 ? 1 : 0, 'neon accent on neutral dark grey')
  }
  add('placeholder-copy', 3, /lorem ipsum|dolor sit amet|your (text|company|name|logo|title) here|\[(company|name|placeholder)[^\]]*\]/i.test(m.text) ? 1 : 0, 'placeholder text left in')
  const minimum = { web: 500, dashboard: 250, mobile: 200 }[surface]
  add('clean-but-empty', 3, m.text.length < minimum ? 1 : 0, `${m.text.length} characters of text`)
  return findings
}

export function slopScore(findings: Finding[]): number {
  return findings.reduce((sum, finding) => sum + finding.weight, 0)
}

export const STYLE_FEATURES = [
  'displaySize',
  'displayRatio',
  'displayWeight',
  'displaySerif',
  'displayCaps',
  'typeSizes',
  'families',
  'centredShare',
  'groundL',
  'groundC',
  'accentC',
  'accentHueSin',
  'accentHueCos',
  'chromaticCount',
  'radiusMedian',
  'radiusDistinct',
  'shadowShare',
  'gradientShare',
  'borderShare',
  'cardShare',
  'identicalRows',
  'imageArea',
  'textDensity',
  'columnsFold',
  'leftEdges',
  'heroLeft',
  'spacingMedian',
  'tableCells',
  'uppercaseShare',
  'pageScreens'
] as const

/** A page as a vector of design decisions, so two pages can be told apart without a model. */
export function styleVector(m: Measurement): number[] {
  const texts = textBoxes(m)
  const colours = palette(m)
  const chars = texts.reduce((sum, box) => sum + box.ownText, 0) || 1
  const largest = texts.reduce<Box | null>((best, box) => (!best || box.fontSize > best.fontSize ? box : best), null)
  const sizeCounts = weightedCounts(texts, (box) => Math.round(box.fontSize), (box) => box.ownText)
  let body = 16
  let bodyChars = 0
  for (const [size, count] of sizeCounts) if (count > bodyChars) [body, bodyChars] = [size, count]
  const blocks = m.boxes.filter((box) => box.w >= 60 && box.h >= 30)
  const rounded = blocks.filter((box) => box.radius > 0).map((box) => Math.min(box.radius, 40)).sort((a, b) => a - b)
  const cards = blocks.filter((box) => isCard(box, colours.ground))
  const fold = texts.filter((box) => box.y < m.viewport.height && box.display !== 'inline')
  const foldLefts = new Set(fold.map((box) => Math.round(box.x / 40)))
  const spacing = m.boxes.flatMap((box) => [...box.padding, ...box.gap]).filter((value) => value > 0).sort((a, b) => a - b)
  const area = m.width * Math.min(m.height, 9000) || 1
  const imageArea = m.boxes.filter((box) => /^(img|video|picture|svg|canvas)$/.test(box.tag) && box.w > 80).reduce((sum, box) => sum + box.w * box.h, 0)
  const h1 = m.boxes.find((box) => box.tag === 'h1') ?? largest
  const family = largest?.fontFamily ?? ''
  const serif = /serif|garamond|gloock|newsreader|georgia|times|playfair|fraunces|lora|cormorant|young/i.test(family) && !/sans/i.test(family)
  const identical = lint(m, 'web').find((finding) => finding.rule === 'identical-card-row')?.count ?? 0
  const accentHue = ((colours.accent?.h ?? 0) * Math.PI) / 180
  return [
    largest?.fontSize ?? 16,
    (largest?.fontSize ?? 16) / body,
    largest?.fontWeight ?? 400,
    serif ? 1 : 0,
    largest?.textTransform === 'uppercase' ? 1 : 0,
    sizeCounts.size,
    new Set(texts.map((box) => box.fontFamily)).size,
    texts.filter((box) => box.textAlign === 'center').reduce((sum, box) => sum + box.ownText, 0) / chars,
    colours.ground.l,
    colours.ground.c,
    colours.accent?.c ?? 0,
    colours.accent ? Math.sin(accentHue) * colours.accent.c * 4 : 0,
    colours.accent ? Math.cos(accentHue) * colours.accent.c * 4 : 0,
    Math.min(colours.chromatic, 12),
    rounded.length ? rounded[Math.floor(rounded.length / 2)] : 0,
    new Set(rounded.map((value) => Math.round(value))).size,
    share(blocks.filter((box) => box.shadow !== '').length, blocks.length),
    share(blocks.filter((box) => box.bgImage.includes('gradient')).length, blocks.length),
    share(blocks.filter((box) => box.borderWidths.some((width) => width >= 1)).length, blocks.length),
    share(cards.length, blocks.length),
    identical,
    imageArea / area,
    (chars / area) * 10000,
    foldLefts.size,
    new Set(texts.filter((box) => box.display !== 'inline').map((box) => box.x)).size / Math.max(texts.length, 1),
    h1 ? h1.x / m.viewport.width : 0,
    spacing.length ? spacing[Math.floor(spacing.length / 2)] : 0,
    Math.min(m.boxes.filter((box) => box.tag === 'td' || box.tag === 'th').length, 120),
    texts.filter((box) => box.textTransform === 'uppercase').reduce((sum, box) => sum + box.ownText, 0) / chars,
    Math.min(m.height, 9000) / m.viewport.height
  ]
}
