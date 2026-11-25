/**
 * Paints are stored bottom to top, the last one drawn in front; Figma lists them the other way, so
 * the top of the list is the paint in front. Each entry keeps its stored index for edits.
 */
export function topFirst<T>(items: readonly T[]): Array<{ item: T; index: number }> {
  return items.map((item, index) => ({ item, index })).reverse()
}
