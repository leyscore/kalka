import type { SceneGraph } from '@kalka/scene-graph'

/** The weights a page loaded for each family, as ranges: one weight, or a variable font's span. */
export type LoadedFaceWeights = Map<string, Array<[number, number]>>

const FONT_FACE = /@font-face\s*\{([^}]*)\}/g
const FAMILY = /font-family:\s*(['"]?)([^;'"]+)\1\s*;/
const WEIGHT = /font-weight:\s*(\d+)(?:\s+(\d+))?\s*;/

/** The families and weights a stylesheet's `@font-face` rules load, such as Google Fonts' CSS. */
export function loadedFaceWeights(css: string): LoadedFaceWeights {
  const faces: LoadedFaceWeights = new Map()
  for (const [, body = ''] of css.matchAll(FONT_FACE)) {
    const family = FAMILY.exec(body)?.[2]?.trim()
    const weight = WEIGHT.exec(body)
    if (!family || !weight) continue
    const min = Number(weight[1])
    const max = weight[2] ? Number(weight[2]) : min
    const ranges = faces.get(family) ?? []
    if (!ranges.some(([from, to]) => from === min && to === max)) ranges.push([min, max])
    faces.set(family, ranges)
  }
  return faces
}

/**
 * The weight a browser draws when a page asks for `desired` and has only `ranges` loaded, by
 * CSS font matching: from 400 to 500 it looks up to 500, then down, then up; under 400 down
 * first; over 500 up first. A missing bold is drawn from the nearest face, emboldened, so its
 * letters keep that face's widths.
 */
export function matchedWeight(desired: number, ranges: ReadonlyArray<[number, number]>): number {
  if (ranges.length === 0 || ranges.some(([min, max]) => min <= desired && desired <= max))
    return desired
  const below = ranges.filter(([, max]) => max < desired).map(([, max]) => max)
  const above = ranges.filter(([min]) => min > desired).map(([min]) => min)
  const nearestBelow = below.length > 0 ? Math.max(...below) : undefined
  const nearestAbove = above.length > 0 ? Math.min(...above) : undefined
  if (desired >= 400 && desired <= 500) {
    const upTo500 = above.filter((weight) => weight <= 500)
    if (upTo500.length > 0) return Math.min(...upTo500)
    return nearestBelow ?? nearestAbove ?? desired
  }
  if (desired < 400) return nearestBelow ?? nearestAbove ?? desired
  return nearestAbove ?? nearestBelow ?? desired
}

/**
 * Gives every text layer under `rootId` the weight the page drew it at, for the families the
 * page loaded: a bold the page did not load is drawn from a lighter face, whose letters are
 * narrower than the real bold, so the text wraps as on the page.
 */
export function matchLoadedFontWeights(
  graph: SceneGraph,
  rootId: string,
  faces: LoadedFaceWeights
): void {
  if (faces.size === 0) return
  const visit = (id: string) => {
    const node = graph.getNode(id)
    if (!node) return
    if (node.type === 'TEXT') {
      const ranges = faces.get(node.fontFamily)
      if (ranges) node.fontWeight = matchedWeight(node.fontWeight, ranges)
      for (const run of node.styleRuns) {
        const runRanges = faces.get(run.style.fontFamily ?? node.fontFamily)
        if (runRanges && run.style.fontWeight !== undefined)
          run.style.fontWeight = matchedWeight(run.style.fontWeight, runRanges)
      }
    }
    for (const child of node.childIds) visit(child)
  }
  visit(rootId)
}
