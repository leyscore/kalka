import { HTML_TAGS } from '@kalka/scene-graph'

/** Tags whose browser defaults the reset clears; `div` and `span` have none to clear. */
const STYLED_TAGS: ReadonlySet<string> = new Set(
  HTML_TAGS.filter((tag) => tag !== 'div' && tag !== 'span')
)

const TAG_LIST = [...STYLED_TAGS].join(',')
const RESET_DECLARATIONS =
  'margin:0;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:inherit;text-decoration:none;list-style:none;min-inline-size:0;appearance:none'

/**
 * Clears the browser's default styles on the tags a layer can take, so an `h1` or a `button`
 * draws exactly as the `div` it replaces: the layer's own CSS is all that styles it. `:where`
 * keeps the rule at zero specificity, so any class rule a developer adds still wins.
 */
export const HTML_TAG_RESET_CSS = `:where(${TAG_LIST}){${RESET_DECLARATIONS}}`

/**
 * The reset for HTML pasted into someone else's page: it reaches only the elements under the
 * exported roots, which `selector` matches, and leaves the rest of that page's headings alone.
 */
export function scopedTagResetCSS(selector: string): string {
  return `:where(${selector},${selector} *):where(${TAG_LIST}){${RESET_DECLARATIONS}}`
}

/** Whether an element's tag is one whose browser defaults the reset clears. */
export function hasBrowserDefaults(tagName: string): boolean {
  return STYLED_TAGS.has(tagName.toLowerCase())
}
