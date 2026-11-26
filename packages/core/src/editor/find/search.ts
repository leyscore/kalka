import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** The kinds of layer a search can be narrowed to, as Figma's find filters them. */
export const FIND_LAYER_KINDS = [
  'text',
  'frame',
  'section',
  'component',
  'instance',
  'group',
  'shape',
  'image'
] as const

export type FindLayerKind = (typeof FIND_LAYER_KINDS)[number]

export interface FindOptions {
  query: string
  /** Look in the characters of text layers. */
  text: boolean
  /** Look in layer names. */
  names: boolean
  matchCase: boolean
  wholeWord: boolean
  /** Only these kinds of layer; empty for every kind. */
  kinds: readonly FindLayerKind[]
}

/** One place a search found: a range of a text layer's characters, or a layer's name. */
export interface FindMatch {
  /** Stable while the document does not change: the layer, the field and the range. */
  key: string
  nodeId: string
  pageId: string
  /** The outermost layer on the page that holds the match, the layer itself at the top. */
  frameId: string
  field: 'text' | 'name'
  start: number
  end: number
}

export const DEFAULT_FIND_OPTIONS: FindOptions = {
  query: '',
  text: true,
  names: true,
  matchCase: false,
  wholeWord: false,
  kinds: []
}

const SHAPE_TYPES = new Set([
  'RECTANGLE',
  'ROUNDED_RECTANGLE',
  'ELLIPSE',
  'LINE',
  'STAR',
  'POLYGON',
  'VECTOR',
  'CONNECTOR',
  'SHAPE_WITH_TEXT'
])

/** The find filter a layer falls under; null for pages. */
export function findLayerKind(node: SceneNode): FindLayerKind | null {
  switch (node.type) {
    case 'CANVAS':
      return null
    case 'TEXT':
      return 'text'
    case 'INSTANCE':
      return 'instance'
    case 'COMPONENT':
    case 'COMPONENT_SET':
      return 'component'
    case 'SECTION':
      return 'section'
    case 'GROUP':
    case 'BOOLEAN_OPERATION':
      return 'group'
    case 'FRAME':
      return 'frame'
    default:
      if (node.fills.some((fill) => fill.type === 'IMAGE')) return 'image'
      return SHAPE_TYPES.has(node.type) ? 'shape' : null
  }
}

const WORD_CHARACTER = /[\p{L}\p{N}_]/u

function isWordBoundary(haystack: string, start: number, end: number): boolean {
  const before = haystack.charAt(start - 1)
  const after = haystack.charAt(end)
  return !(before && WORD_CHARACTER.test(before)) && !(after && WORD_CHARACTER.test(after))
}

/** The ranges of `haystack` where the query is, in order and without overlapping. */
export function findRanges(
  haystack: string,
  options: Pick<FindOptions, 'query' | 'matchCase' | 'wholeWord'>
): Array<[number, number]> {
  const { query } = options
  if (!query) return []
  // Lower-casing keeps lengths for the scripts layers are written in; a string it would
  // lengthen is searched as is, so ranges always point into the original characters.
  const fold = (value: string) => {
    const lower = value.toLowerCase()
    return lower.length === value.length ? lower : value
  }
  const source = options.matchCase ? haystack : fold(haystack)
  const needle = options.matchCase ? query : fold(query)
  const ranges: Array<[number, number]> = []
  let from = 0
  while (from <= source.length - needle.length) {
    const start = source.indexOf(needle, from)
    if (start === -1) break
    const end = start + needle.length
    if (!options.wholeWord || isWordBoundary(haystack, start, end)) {
      ranges.push([start, end])
      from = end
    } else {
      from = start + 1
    }
  }
  return ranges
}

/**
 * Every match of the search on these pages, in layer order: a text layer's characters first,
 * then its name. Hidden and locked layers are found too, as Figma finds them.
 */
export function findInPages(
  graph: SceneGraph,
  pageIds: readonly string[],
  options: FindOptions
): FindMatch[] {
  const matches: FindMatch[] = []
  if (!options.query || (!options.text && !options.names)) return matches
  const kinds = new Set(options.kinds)

  const visit = (node: SceneNode, pageId: string, frameId: string) => {
    const kind = findLayerKind(node)
    if (kind && (kinds.size === 0 || kinds.has(kind))) {
      const fields: Array<['text' | 'name', string]> = []
      if (options.text && node.type === 'TEXT') fields.push(['text', node.text])
      // A text layer named after its characters would be found twice for the same words.
      const namedByText =
        node.type === 'TEXT' && options.text && (node.autoRename || node.name === node.text)
      if (options.names && !namedByText) fields.push(['name', node.name])
      for (const [field, value] of fields) {
        for (const [start, end] of findRanges(value, options)) {
          matches.push({
            key: `${node.id}:${field}:${start}`,
            nodeId: node.id,
            pageId,
            frameId,
            field,
            start,
            end
          })
        }
      }
    }
    for (const child of graph.getChildren(node.id)) visit(child, pageId, frameId)
  }

  for (const pageId of pageIds) {
    for (const top of graph.getChildren(pageId)) visit(top, pageId, top.id)
  }
  return matches
}
