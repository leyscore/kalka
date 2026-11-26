import * as v from 'valibot'

import type { SceneGraph, StrokeBrush, StrokeWidthPoint } from '@kalka/scene-graph'

import { drawsAlongPath } from '#core/figma-api/complex-strokes'
import {
  defaultStrokeBrush,
  matchStrokeWidthPreset,
  STROKE_BRUSHES,
  STROKE_WIDTH_PRESET_IDS,
  strokeWidthPreset,
  type StrokeWidthPreset
} from '#core/vector/stroke-outline'

import { nodeOf, type NodeRef } from './behaviours'

/** A path's stroke as Figma Draw sets it: its width profile and its brush. */
export interface StrokeDraw {
  /** A preset's name, `custom` for points of one's own, or `uniform`. */
  widthPreset: StrokeWidthPreset | 'custom'
  widthProfile: StrokeWidthPoint[]
  brush: StrokeBrush | null
}

/** What `setStrokeDraw` changes; a field left out stays. */
export interface StrokeDrawChange {
  /** A preset's name, points along the path, or null for a uniform stroke. */
  widthProfile?: StrokeWidthPreset | StrokeWidthPoint[] | null
  /**
   * A brush as `TYPE:id` (`SCATTER:stars`), an object with its type, id and any settings, or
   * null for a plain stroke.
   */
  brush?: string | (Partial<StrokeBrush> & Pick<StrokeBrush, 'type' | 'id'>) | null
}

const finite = v.pipe(v.number(), v.finite())

const WidthPointSchema = v.object({
  position: v.pipe(finite, v.minValue(0), v.maxValue(1)),
  ascent: v.pipe(finite, v.minValue(0)),
  descent: v.pipe(finite, v.minValue(0))
})

const BrushSchema = v.object({
  type: v.picklist(['STRETCH', 'SCATTER']),
  id: v.string(),
  gap: v.optional(v.pipe(finite, v.minValue(0))),
  wiggle: v.optional(v.pipe(finite, v.minValue(0))),
  sizeJitter: v.optional(v.pipe(finite, v.minValue(0), v.maxValue(1))),
  angularJitter: v.optional(v.pipe(finite, v.minValue(0), v.maxValue(1))),
  rotation: v.optional(finite),
  reverse: v.optional(v.boolean()),
  seed: v.optional(finite)
})

/** Kalka's width presets and brushes, which `setStrokeDraw` takes by name. */
export function strokeDrawCatalog() {
  return {
    widthPresets: [...STROKE_WIDTH_PRESET_IDS],
    brushes: { STRETCH: [...STROKE_BRUSHES.STRETCH], SCATTER: [...STROKE_BRUSHES.SCATTER] }
  }
}

export function getStrokeDraw(graph: SceneGraph, ref: NodeRef): StrokeDraw {
  const node = nodeOf(graph, ref)
  return {
    widthPreset: matchStrokeWidthPreset(node.strokeWidthProfile) ?? 'custom',
    widthProfile: node.strokeWidthProfile.map((point) => ({ ...point })),
    brush: node.strokeBrush ? { ...node.strokeBrush } : null
  }
}

function widthProfileOf(value: StrokeDrawChange['widthProfile']): StrokeWidthPoint[] {
  if (value === null || value === undefined) return []
  if (typeof value === 'string') {
    if (!STROKE_WIDTH_PRESET_IDS.includes(value)) {
      throw new Error(
        `No width preset "${value}"; the presets are ${STROKE_WIDTH_PRESET_IDS.join(', ')}`
      )
    }
    return strokeWidthPreset(value)
  }
  const parsed = v.safeParse(v.array(WidthPointSchema), value)
  if (!parsed.success) {
    throw new Error('A width profile is points of { position (0–1), ascent, descent }')
  }
  return parsed.output.sort((a, b) => a.position - b.position)
}

function brushOf(value: StrokeDrawChange['brush']): StrokeBrush | null {
  if (value === null || value === undefined) return null
  const spec = typeof value === 'string' ? parseBrushName(value) : value
  const parsed = v.safeParse(BrushSchema, spec)
  if (!parsed.success) throw new Error('A brush is { type: "STRETCH" | "SCATTER", id, … }')
  const { type, id } = parsed.output
  if (!STROKE_BRUSHES[type].includes(id)) {
    throw new Error(`No ${type} brush "${id}"; there are ${STROKE_BRUSHES[type].join(', ')}`)
  }
  return { ...defaultStrokeBrush(type, id), ...parsed.output }
}

function parseBrushName(name: string): { type: string; id: string } {
  const [type = '', id = ''] = name.split(':')
  return { type: type.toUpperCase(), id }
}

/**
 * Sets a vector's or line's width profile and brush, as the stroke's Figma Draw settings do.
 * Returns the stroke as it is now.
 */
export function setStrokeDraw(
  graph: SceneGraph,
  ref: NodeRef,
  change: StrokeDrawChange
): StrokeDraw {
  const node = nodeOf(graph, ref)
  if (!drawsAlongPath(node)) {
    throw new Error(`${node.name} is a ${node.type}; width profiles and brushes need a path`)
  }
  const changes: { strokeWidthProfile?: StrokeWidthPoint[]; strokeBrush?: StrokeBrush | null } = {}
  if ('widthProfile' in change) changes.strokeWidthProfile = widthProfileOf(change.widthProfile)
  if ('brush' in change) changes.strokeBrush = brushOf(change.brush)
  graph.updateNode(node.id, changes)
  return getStrokeDraw(graph, node.id)
}
