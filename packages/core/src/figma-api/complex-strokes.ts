import * as v from 'valibot'

import type { SceneNode, StrokeBrush, StrokeWidthPoint } from '@kalka/scene-graph'

import {
  defaultStrokeBrush,
  matchStrokeWidthPreset,
  STROKE_BRUSHES,
  strokeWidthPreset
} from '#core/vector/stroke-outline'

/**
 * Figma Draw's variable-width strokes and brushes as the Plugin API reads and writes them:
 * `variableWidthStrokeProperties` and `complexStrokeProperties`. Kalka keeps a width profile as
 * points with a width each side of the path and draws its own brushes, so Figma's names map onto
 * Kalka's: a width point's `width` is both sides together, and Figma's brush names pick Kalka's
 * brushes, which read back as `CUSTOM`, as Figma reports brushes that are not its own.
 */

const FIGMA_WIDTH_PRESETS = [
  'UNIFORM',
  'WEDGE',
  'TAPER',
  'QUARTER_TAPER',
  'EYE',
  'MIRRORED_TAPER'
] as const

type FigmaWidthPreset = (typeof FIGMA_WIDTH_PRESETS)[number]

/** Figma's `VariableWidthStrokeProperties`. */
export type FigmaVariableWidthStrokeProperties =
  | { widthProfile: FigmaWidthPreset }
  | {
      widthProfile: 'CUSTOM'
      variableWidthPoints: ReadonlyArray<{ position: number; width: number }>
    }

/** Figma's `ComplexStrokeProperties`: a plain stroke, a dynamic one, or a brush. */
export type FigmaComplexStrokeProperties =
  | { type: 'BASIC' }
  | { type: 'DYNAMIC'; frequency: number; wiggle: number; smoothen: number }
  | {
      type: 'BRUSH'
      brushType: 'STRETCH'
      brushName: string
      direction: 'FORWARD' | 'BACKWARD'
    }
  | {
      type: 'BRUSH'
      brushType: 'SCATTER'
      brushName: string
      gap: number
      wiggle: number
      sizeJitter: number
      angularJitter: number
      rotation: number
    }

/** Widths (both sides, in stroke weights) along the path for the presets Kalka has no own of. */
const EXTRA_PRESETS: Record<'QUARTER_TAPER' | 'MIRRORED_TAPER', ReadonlyArray<[number, number]>> = {
  QUARTER_TAPER: [
    [0, 1],
    [0.75, 1],
    [1, 0.05]
  ],
  MIRRORED_TAPER: [
    [0, 0.05],
    [0.45, 0.85],
    [1, 1]
  ]
}

function presetPoints(preset: FigmaWidthPreset): StrokeWidthPoint[] {
  if (preset === 'QUARTER_TAPER' || preset === 'MIRRORED_TAPER') {
    return EXTRA_PRESETS[preset].map(([position, width]) => ({
      position,
      ascent: width / 2,
      descent: width / 2
    }))
  }
  if (preset === 'UNIFORM') return []
  const own = { WEDGE: 'wedge', TAPER: 'taper', EYE: 'eye' } as const
  return strokeWidthPreset(own[preset])
}

const SAME = 1e-4

function samePoints(a: readonly StrokeWidthPoint[], b: readonly StrokeWidthPoint[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (point, index) =>
        Math.abs(point.position - b[index].position) < SAME &&
        Math.abs(point.ascent - b[index].ascent) < SAME &&
        Math.abs(point.descent - b[index].descent) < SAME
    )
  )
}

/** Layers whose stroke runs along a path, the ones Kalka draws a width profile or a brush on. */
export function drawsAlongPath(node: SceneNode): boolean {
  return node.type === 'VECTOR' || node.type === 'LINE'
}

/** A layer's width profile as Figma's `variableWidthStrokeProperties`; null off a path. */
export function figmaVariableWidth(node: SceneNode): FigmaVariableWidthStrokeProperties | null {
  if (!drawsAlongPath(node)) return null
  const profile = node.strokeWidthProfile
  if (profile.length === 0 || matchStrokeWidthPreset(profile) === 'uniform') {
    return { widthProfile: 'UNIFORM' as const }
  }
  const preset = FIGMA_WIDTH_PRESETS.find(
    (name) => name !== 'UNIFORM' && samePoints(presetPoints(name), profile)
  )
  if (preset) return { widthProfile: preset }
  return {
    widthProfile: 'CUSTOM' as const,
    variableWidthPoints: profile.map((point) => ({
      position: point.position,
      width: point.ascent + point.descent
    }))
  }
}

const unitNumber = v.pipe(v.number(), v.finite())

const VariableWidthInput = v.nullable(
  v.variant('widthProfile', [
    v.object({ widthProfile: v.picklist(FIGMA_WIDTH_PRESETS) }),
    v.object({
      widthProfile: v.literal('CUSTOM'),
      variableWidthPoints: v.array(v.object({ position: unitNumber, width: unitNumber }))
    })
  ])
)

/** The width profile a `variableWidthStrokeProperties` value sets. */
export function widthProfileFromFigma(value: unknown): StrokeWidthPoint[] {
  const parsed = v.safeParse(VariableWidthInput, value)
  if (!parsed.success) {
    throw new TypeError(
      `variableWidthStrokeProperties: expected null, { widthProfile: ${FIGMA_WIDTH_PRESETS.map((name) => `'${name}'`).join(' | ')} } or { widthProfile: 'CUSTOM', variableWidthPoints: [{ position, width }] }`
    )
  }
  const properties = parsed.output
  if (properties === null) return []
  if (properties.widthProfile !== 'CUSTOM') return presetPoints(properties.widthProfile)
  return properties.variableWidthPoints
    .map((point) => {
      const half = Math.max(0, point.width) / 2
      return { position: Math.max(0, Math.min(1, point.position)), ascent: half, descent: half }
    })
    .sort((a, b) => a.position - b.position)
}

/** Figma's ranges for a scatter brush: size jitter 0–3 and angular jitter in degrees. */
const SIZE_JITTER_RANGE = 3
const ANGULAR_JITTER_RANGE = 180

/** A layer's brush as Figma's `complexStrokeProperties`. */
export function figmaComplexStroke(node: SceneNode): FigmaComplexStrokeProperties {
  const brush = node.strokeBrush
  if (!brush) return { type: 'BASIC' as const }
  if (brush.type === 'STRETCH') {
    return {
      type: 'BRUSH' as const,
      brushType: 'STRETCH' as const,
      brushName: 'CUSTOM' as const,
      direction: brush.reverse ? ('BACKWARD' as const) : ('FORWARD' as const)
    }
  }
  return {
    type: 'BRUSH' as const,
    brushType: 'SCATTER' as const,
    brushName: 'CUSTOM' as const,
    gap: brush.gap,
    wiggle: brush.wiggle,
    sizeJitter: brush.sizeJitter * SIZE_JITTER_RANGE,
    angularJitter: brush.angularJitter * ANGULAR_JITTER_RANGE,
    rotation: brush.rotation
  }
}

const ComplexStrokeInput = v.variant('type', [
  v.object({ type: v.literal('BASIC') }),
  v.object({ type: v.literal('DYNAMIC') }),
  v.variant('brushType', [
    v.object({
      type: v.literal('BRUSH'),
      brushType: v.literal('STRETCH'),
      brushName: v.string(),
      direction: v.optional(v.picklist(['FORWARD', 'BACKWARD']))
    }),
    v.object({
      type: v.literal('BRUSH'),
      brushType: v.literal('SCATTER'),
      brushName: v.string(),
      gap: v.optional(unitNumber),
      wiggle: v.optional(unitNumber),
      sizeJitter: v.optional(unitNumber),
      angularJitter: v.optional(unitNumber),
      rotation: v.optional(unitNumber)
    })
  ])
])

/**
 * Picks one of Kalka's brushes for a brush name: Kalka's own id (`stars`, `ink`, …) as such, a
 * Figma brush name by its place in Figma's list, so each of Figma's brushes always lands on the
 * same one of Kalka's.
 */
function brushId(type: StrokeBrush['type'], name: string): string {
  const own = STROKE_BRUSHES[type]
  const lower = name.toLowerCase()
  if (own.includes(lower)) return lower
  const figma = type === 'STRETCH' ? FIGMA_STRETCH_BRUSHES : FIGMA_SCATTER_BRUSHES
  const index = figma.indexOf(name.toUpperCase())
  return own[Math.max(0, index) % own.length]
}

const FIGMA_STRETCH_BRUSHES = [
  'HEIST',
  'BLOCKBUSTER',
  'GRINDHOUSE',
  'BIOPIC',
  'SPAGHETTI_WESTERN',
  'SLASHER',
  'HARDBOILED',
  'VERITE',
  'EPIC',
  'SCREWBALL',
  'ROM_COM',
  'NOIR',
  'PROPAGANDA',
  'MELODRAMA',
  'NEW_WAVE'
]

const FIGMA_SCATTER_BRUSHES = [
  'BUBBLEGUM',
  'WITCH_HOUSE',
  'SHOEGAZE',
  'HONKY_TONK',
  'SCREAMO',
  'DRONE',
  'DOO_WOP',
  'SPOKEN_WORD',
  'VAPORWAVE',
  'OI'
]

/** The brush a `complexStrokeProperties` value sets; null draws a plain stroke. */
export function brushFromFigma(value: unknown, current: StrokeBrush | null): StrokeBrush | null {
  const parsed = v.safeParse(ComplexStrokeInput, value)
  if (!parsed.success) {
    throw new TypeError(
      "complexStrokeProperties: expected { type: 'BASIC' } or { type: 'BRUSH', brushType: 'STRETCH' | 'SCATTER', brushName, … }"
    )
  }
  const properties = parsed.output
  if (properties.type === 'BASIC') return null
  if (properties.type === 'DYNAMIC') {
    throw new TypeError('complexStrokeProperties: Kalka has no dynamic strokes yet')
  }
  if (properties.brushName === 'CUSTOM') {
    throw new TypeError("complexStrokeProperties: setting brushName to 'CUSTOM' is not supported")
  }
  const id = brushId(properties.brushType, properties.brushName)
  const base =
    current?.type === properties.brushType && current.id === id
      ? current
      : defaultStrokeBrush(properties.brushType, id)
  if (properties.brushType === 'STRETCH') {
    return { ...base, reverse: properties.direction === 'BACKWARD' }
  }
  const unit = (value: number) => Math.max(0, Math.min(1, value))
  return {
    ...base,
    gap: Math.max(0.25, properties.gap ?? base.gap),
    wiggle: Math.max(0, properties.wiggle ?? base.wiggle),
    sizeJitter:
      properties.sizeJitter === undefined
        ? base.sizeJitter
        : unit(properties.sizeJitter / SIZE_JITTER_RANGE),
    angularJitter:
      properties.angularJitter === undefined
        ? base.angularJitter
        : unit(Math.abs(properties.angularJitter) / ANGULAR_JITTER_RANGE),
    rotation: properties.rotation ?? base.rotation
  }
}
