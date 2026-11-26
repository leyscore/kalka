/** How many characters of text a result shows before the match. */
const LEAD = 18

/** The text around a match, cut to start shortly before it and on one line. */
export function matchSnippet(
  text: string,
  start: number,
  end: number
): { before: string; match: string; after: string } {
  const from = Math.max(0, start - LEAD)
  const flat = (value: string) => value.replaceAll(/\s+/g, ' ')
  return {
    before: (from > 0 ? '…' : '') + flat(text.slice(from, start)),
    match: flat(text.slice(start, end)),
    after: flat(text.slice(end, end + 80))
  }
}
