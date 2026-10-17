import { isEqual } from 'es-toolkit'

import { recordInstanceOverride } from '@kalka/scene-graph'
import type { CharacterStyleOverride, SceneGraph, SceneNode } from '@kalka/scene-graph'
import { copyFills } from '@kalka/scene-graph/copy'

import { styleNameToWeight, weightToStyleName, type FigmaFontName } from './fonts'

export function getFontName(node: SceneNode): FigmaFontName {
  return { family: node.fontFamily, style: weightToStyleName(node.fontWeight, node.italic) }
}

export function setFontName(graph: SceneGraph, nodeId: string, fontName: FigmaFontName): void {
  const { weight, italic } = styleNameToWeight(fontName.style)
  graph.updateNode(nodeId, {
    fontFamily: fontName.family,
    fontWeight: weight,
    italic
  })
  recordInstanceOverride(graph, nodeId, ['fontFamily', 'fontWeight'])
}

export function insertCharacters(
  graph: SceneGraph,
  node: SceneNode,
  start: number,
  characters: string
): void {
  const text = node.text.slice(0, start) + characters + node.text.slice(start)
  graph.updateNode(node.id, { text })
  recordInstanceOverride(graph, node.id, ['text'])
}

export function deleteCharacters(
  graph: SceneGraph,
  node: SceneNode,
  start: number,
  end: number
): void {
  const text = node.text.slice(0, start) + node.text.slice(end)
  graph.updateNode(node.id, { text })
  recordInstanceOverride(graph, node.id, ['text'])
}

const SEGMENT_FIELDS = [
  'fontName',
  'fontSize',
  'fontWeight',
  'fills',
  'letterSpacing',
  'lineHeight',
  'textDecoration',
  'textCase'
] as const

export type StyledTextSegmentField = (typeof SEGMENT_FIELDS)[number]

export type StyledTextSegment = {
  characters: string
  start: number
  end: number
} & Partial<Record<StyledTextSegmentField, unknown>>

type SegmentReader = (node: SceneNode, style: CharacterStyleOverride) => unknown

const SEGMENT_VALUES: Record<StyledTextSegmentField, SegmentReader> = {
  fontName: (node, style) => ({
    family: style.fontFamily ?? node.fontFamily,
    style: weightToStyleName(style.fontWeight ?? node.fontWeight, style.italic ?? node.italic)
  }),
  fontSize: (node, style) => style.fontSize ?? node.fontSize,
  fontWeight: (node, style) => style.fontWeight ?? node.fontWeight,
  fills: (node, style) => copyFills(style.fills ?? node.fills),
  letterSpacing: (node, style) => ({
    unit: 'PIXELS',
    value: style.letterSpacing ?? node.letterSpacing
  }),
  lineHeight: (node, style) => {
    const lineHeight = style.lineHeight === undefined ? node.lineHeight : style.lineHeight
    return lineHeight === null ? { unit: 'AUTO' } : { unit: 'PIXELS', value: lineHeight }
  },
  textDecoration: (node, style) => style.textDecoration ?? node.textDecoration,
  textCase: (node) => node.textCase
}

function isSegmentField(field: string): field is StyledTextSegmentField {
  return (SEGMENT_FIELDS as readonly string[]).includes(field)
}

/**
 * Figma's `getStyledTextSegments`: the text split where any of `fields` changes, each run with
 * its characters, range, and the values of those fields.
 */
export function styledTextSegments(
  node: SceneNode,
  fields: readonly string[],
  start = 0,
  end = node.text.length
): StyledTextSegment[] {
  const unsupported = fields.filter((field) => !isSegmentField(field))
  if (unsupported.length > 0) {
    throw new Error(
      `in getStyledTextSegments: Kalka does not support ${unsupported.join(', ')}; ` +
        `supported fields are ${SEGMENT_FIELDS.join(', ')}`
    )
  }
  const requested = fields.filter(isSegmentField)
  const cuts = new Set([start, end])
  for (const run of node.styleRuns) {
    for (const cut of [run.start, run.start + run.length]) {
      if (cut > start && cut < end) cuts.add(cut)
    }
  }
  const sorted = [...cuts].sort((a, b) => a - b)
  const segments: StyledTextSegment[] = []
  for (let index = 0; index < sorted.length - 1; index++) {
    const from = sorted[index]
    const to = sorted[index + 1]
    const run = node.styleRuns.find((r) => r.start <= from && from < r.start + r.length)
    const values: Partial<Record<StyledTextSegmentField, unknown>> = Object.fromEntries(
      requested.map((field) => [field, SEGMENT_VALUES[field](node, run?.style ?? {})])
    )
    const previous = segments.at(-1)
    if (previous && requested.every((field) => isEqual(previous[field], values[field]))) {
      previous.end = to
      previous.characters = node.text.slice(previous.start, to)
      continue
    }
    segments.push({ characters: node.text.slice(from, to), start: from, end: to, ...values })
  }
  return segments
}
