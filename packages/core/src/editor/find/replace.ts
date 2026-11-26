import type { SceneNode, StyleRun } from '@kalka/scene-graph'

import { replaceRangeInRuns } from '#core/text/style-runs'

import { findRanges, type FindOptions } from './search'

export type ReplaceMatchOptions = Pick<FindOptions, 'query' | 'matchCase' | 'wholeWord'>

/**
 * A text layer's characters and runs with each range replaced, or null when none of them still
 * holds the query: the document may have changed since the search. Each replacement takes the
 * style of the first character it replaces, so bold or coloured words keep their look.
 */
export function replacedText(
  node: Pick<SceneNode, 'text' | 'styleRuns'>,
  ranges: ReadonlyArray<readonly [number, number]>,
  replacement: string,
  options: ReplaceMatchOptions
): { text: string; styleRuns: StyleRun[]; count: number } | null {
  const current = new Set(findRanges(node.text, options).map(([start, end]) => `${start}:${end}`))
  const valid = ranges
    .filter(([start, end]) => current.has(`${start}:${end}`))
    .toSorted((a, b) => b[0] - a[0])
  if (valid.length === 0) return null
  let text = node.text
  let styleRuns = node.styleRuns
  // From the end, so the ranges still to replace keep their offsets.
  for (const [start, end] of valid) {
    styleRuns = replaceRangeInRuns(styleRuns, start, end, replacement.length, text.length)
    text = text.slice(0, start) + replacement + text.slice(end)
  }
  return { text, styleRuns, count: valid.length }
}
