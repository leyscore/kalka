import type { NodeChange, StyleReference } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'

import { forEachOverrideRecord } from '../instance-overrides/types'

export const STYLE_REFERENCE_FIELDS = [
  'styleIdForFill',
  'styleIdForStrokeFill',
  'styleIdForText',
  'styleIdForEffect',
  'styleIdForGrid'
] as const

/**
 * Include available style definitions, including references declared on override paths and by
 * ranges of text.
 */
export function styleDependencies(
  node: NodeChange,
  resolve: (reference: StyleReference) => string | undefined,
  available: ReadonlySet<string>
): Set<string> {
  const result = new Set<string>()
  forEachOverrideRecord(node, (source) => {
    // Ranges of a text name their styles in its style table, as the record names its own.
    for (const record of [source, ...(source.textData?.styleOverrideTable ?? [])]) {
      for (const field of STYLE_REFERENCE_FIELDS) {
        const reference = record[field]
        if (!reference) continue
        const id = reference.guid ? guidToString(reference.guid) : resolve(reference)
        if (id && available.has(id)) result.add(id)
      }
    }
  })
  return result
}
