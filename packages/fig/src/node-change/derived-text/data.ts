import { omit, pick } from 'es-toolkit/object'

import type { FigTextLayout, NodeChange } from '@kalka/kiwi/fig/codec'
import type { SceneNode } from '@kalka/scene-graph'

type DerivedTextData = NonNullable<NodeChange['derivedTextData']>

interface DerivedTextDataOptions {
  node: SceneNode
  glyphs: DerivedTextData['glyphs']
  fontMetaData: DerivedTextData['fontMetaData']
  baselines: DerivedTextData['baselines']
  logicalIndexToCharacterOffsetMap: number[]
}

/**
 * The layout Figma saved for a text node. Files written before Figma moved it into
 * `derivedTextData` keep the same fields in `textData`, beside the characters.
 */
export function savedTextLayout(
  nc: Pick<NodeChange, 'derivedTextData' | 'textData'>
): FigTextLayout | undefined {
  if (nc.derivedTextData) return nc.derivedTextData
  const data = nc.textData
  if (!data?.layoutSize && !data?.baselines?.length) return undefined
  return pick(data, TEXT_LAYOUT_FIELDS)
}

const TEXT_LAYOUT_FIELDS = [
  'layoutSize',
  'baselines',
  'glyphs',
  'fontMetaData',
  'logicalIndexToCharacterOffsetMap',
  'derivedLines',
  'truncationStartIndex',
  'truncatedHeight'
] as const satisfies ReadonlyArray<keyof FigTextLayout>

/**
 * `textData` without the layout older files keep in it, for text whose characters or shaping
 * changed since that layout was saved.
 */
function withoutSavedTextLayout(
  textData: NonNullable<NodeChange['textData']>
): NonNullable<NodeChange['textData']> {
  return omit(textData, TEXT_LAYOUT_FIELDS)
}

/** Forgets the layout Figma saved for the text, wherever the file kept it. */
export function dropSavedTextLayout(nc: Pick<NodeChange, 'derivedTextData' | 'textData'>): void {
  nc.derivedTextData = undefined
  if (nc.textData) nc.textData = withoutSavedTextLayout(nc.textData)
}

export function buildDerivedTextData(
  options: DerivedTextDataOptions
): NodeChange['derivedTextData'] {
  return {
    layoutSize: { x: options.node.width, y: options.node.height },
    baselines: options.baselines,
    glyphs: options.glyphs,
    fontMetaData: options.fontMetaData,
    logicalIndexToCharacterOffsetMap: options.logicalIndexToCharacterOffsetMap,
    derivedLines: [{ directionality: 'LTR' }],
    truncationStartIndex: -1,
    truncatedHeight: -1
  }
}
