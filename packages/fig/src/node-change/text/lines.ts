import type { NodeChange } from '@kalka/kiwi/fig/codec'
import {
  compactListLines,
  textListLines,
  type SceneNode,
  type TextListLine,
  type TextListType
} from '@kalka/scene-graph'

type KiwiTextLines = NonNullable<NonNullable<NodeChange['textData']>['lines']>

const LIST_TYPES: Readonly<Record<string, TextListType>> = {
  ORDERED_LIST: 'ORDERED',
  UNORDERED_LIST: 'UNORDERED'
}

/**
 * Each paragraph's list as Figma saved it: a line typed as an ordered or unordered list, nested
 * by its indentation level, which counts from 1 for the outermost list.
 */
export function importListLines(nc: NodeChange): TextListLine[] {
  const lines = nc.textData?.lines ?? []
  return compactListLines(
    lines.map((line): TextListLine => {
      const type = LIST_TYPES[line.lineType ?? 'PLAIN'] ?? 'NONE'
      if (type === 'NONE') return { type, level: 0 }
      return { type, level: Math.max(0, (line.indentationLevel ?? 1) - 1) }
    })
  )
}

/** A text's lines as Figma saves them, one per paragraph with its list. */
export function exportTextLines(node: Pick<SceneNode, 'text' | 'listLines'>): KiwiTextLines {
  return textListLines(node).map((line) =>
    line.type === 'NONE'
      ? { lineType: 'PLAIN' }
      : {
          lineType: line.type === 'ORDERED' ? 'ORDERED_LIST' : 'UNORDERED_LIST',
          indentationLevel: line.level + 1
        }
  )
}
