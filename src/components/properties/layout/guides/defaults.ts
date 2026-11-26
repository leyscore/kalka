import type { LayoutGrid } from '@kalka/scene-graph'

/** Figma's count for a new set of columns or rows. */
export const DEFAULT_GRID_COUNT = 5

/** Figma's new guide: a 10 px grid in translucent red. */
export function defaultLayoutGrid(): LayoutGrid {
  return {
    visible: true,
    color: { r: 1, g: 0, b: 0, a: 0.1 },
    pattern: 'GRID',
    alignment: 'STRETCH',
    count: DEFAULT_GRID_COUNT,
    gutterSize: 20,
    offset: 0,
    sectionSize: 10
  }
}
