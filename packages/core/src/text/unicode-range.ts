/** Whether a CSS `unicode-range`, such as `U+0400-045F,U+04??`, holds a code point. */
export function unicodeRangeCovers(unicodeRange: string, codePoint: number): boolean {
  return unicodeRange.split(',').some((part) => {
    const [start, end = start] = part.trim().replace(/^U\+/i, '').split('-')
    return (
      codePoint >= Number.parseInt(start.replaceAll('?', '0'), 16) &&
      codePoint <= Number.parseInt(end.replaceAll('?', 'F'), 16)
    )
  })
}
