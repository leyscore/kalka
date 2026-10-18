import {
  DEFAULT_FONT_FAMILY,
  FIGMA_INTER_VERSION,
  parseFontStyle,
  type InterVersion,
  type SceneNode
} from '@kalka/scene-graph'

/**
 * The name Kalka loads and registers Inter 3.19 under, so it never takes the place of Inter 4
 * for another document open at the same time. Pages, files, and exports never name it: there
 * the family is `Inter`, given the Inter 3.19 files.
 */
export const INTER_3_FAMILY = 'Kalka Inter 3.19'

const INTER_3_FILE_WEIGHTS: Record<number, string> = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black'
}

/**
 * The family a document's text names, as Kalka loads it: Inter in a document that keeps Figma's
 * Inter 3.19 is that Inter's own family; every other family is itself.
 */
export function fontFamilyKey(family: string, interVersion: InterVersion): string {
  return interVersion === FIGMA_INTER_VERSION && family === DEFAULT_FONT_FAMILY
    ? INTER_3_FAMILY
    : family
}

/** A text whose families, its runs' too, name the faces as Kalka loads them. */
export function withFontFamilyKeys<T extends Pick<SceneNode, 'fontFamily' | 'styleRuns'>>(
  node: T,
  interVersion: InterVersion
): T {
  if (interVersion !== FIGMA_INTER_VERSION) return node
  const usesInter =
    node.fontFamily === DEFAULT_FONT_FAMILY ||
    node.styleRuns.some((run) => run.style.fontFamily === DEFAULT_FONT_FAMILY)
  if (!usesInter) return node
  return {
    ...node,
    fontFamily: fontFamilyKey(node.fontFamily, interVersion),
    styleRuns: node.styleRuns.map((run) =>
      run.style.fontFamily === undefined
        ? run
        : {
            ...run,
            style: { ...run.style, fontFamily: fontFamilyKey(run.style.fontFamily, interVersion) }
          }
    )
  }
}

/** The family a page or a file names for a loaded family: Inter 3.19 is `Inter` there. */
export function cssFontFamily(family: string): string {
  return family === INTER_3_FAMILY ? DEFAULT_FONT_FAMILY : family
}

/**
 * Whether a face loaded under `family` belongs on a page of a document using `interVersion`:
 * such a page names both Inters `Inter`, so it gets only the one its document uses.
 */
export function fontFamilyServesInter(family: string, interVersion: InterVersion): boolean {
  if (family === INTER_3_FAMILY) return interVersion === FIGMA_INTER_VERSION
  if (family === DEFAULT_FONT_FAMILY) return interVersion !== FIGMA_INTER_VERSION
  return true
}

/** The bundled Inter 3.19 file for a style, by its weight and slant; every style has one. */
export function inter3FontURL(style: string): string {
  const { weight, italic } = parseFontStyle(style)
  const name = INTER_3_FILE_WEIGHTS[Math.round(weight / 100) * 100] ?? 'Regular'
  const file = italic ? (name === 'Regular' ? 'Italic' : `${name}Italic`) : name
  return `/fonts/inter-3.19/Inter-${file}.woff`
}
