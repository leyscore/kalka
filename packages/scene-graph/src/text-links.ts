import { omit } from 'es-toolkit'

import type { StyleRun, TextHyperlink } from './types'

/** Address schemes a link in a text may open; anything else, such as `javascript:`, is refused. */
const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/**
 * The web address a link typed or pasted as `input` opens, as Figma reads it: a bare domain such
 * as `kalka.design` gains `https://`. Null for an empty input or a scheme a link may not use.
 */
export function hyperlinkURL(input: string): string | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
  const candidate = hasScheme ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`
  if (!URL.canParse(candidate)) return null
  const url = new URL(candidate)
  return LINK_SCHEMES.has(url.protocol) ? candidate : null
}

/** A web link to `input`, or null when it is not an address a link may open. */
export function urlHyperlink(input: string): TextHyperlink | null {
  const value = hyperlinkURL(input)
  return value === null ? null : { type: 'URL', value }
}

/** The link at a character of a text, from its runs. */
export function hyperlinkAt(runs: readonly StyleRun[], index: number): TextHyperlink | null {
  for (const run of runs)
    if (index >= run.start && index < run.start + run.length && run.style.hyperlink)
      return run.style.hyperlink
  return null
}

/**
 * A text's runs with `link` laid over every character, each run's other styles kept, or with
 * every link taken off when `link` is null: a link on a whole text layer, as Figma sets one when
 * no characters are selected.
 */
export function runsWithHyperlink(
  runs: readonly StyleRun[],
  length: number,
  link: TextHyperlink | null
): StyleRun[] {
  if (link === null)
    return runs
      .map((run) => ({ ...run, style: omit(run.style, ['hyperlink']) }))
      .filter((run) => Object.keys(run.style).length > 0)
  const result: StyleRun[] = []
  let cursor = 0
  for (const run of [...runs].sort((a, b) => a.start - b.start)) {
    if (run.start > cursor)
      result.push({ start: cursor, length: run.start - cursor, style: { hyperlink: link } })
    result.push({ ...run, style: { ...run.style, hyperlink: link } })
    cursor = Math.max(cursor, run.start + run.length)
  }
  if (cursor < length)
    result.push({ start: cursor, length: length - cursor, style: { hyperlink: link } })
  return result
}
