import { HTML_TAGS } from '@open-pencil/scene-graph'

/** Tags whose browser defaults the reset clears; `div` and `span` have none to clear. */
const STYLED_TAGS = HTML_TAGS.filter((tag) => tag !== 'div' && tag !== 'span')

/**
 * Clears the browser's default styles on the tags a layer can take, so an `h1` or a `button`
 * draws exactly as the `div` it replaces: the layer's own CSS is all that styles it. `:where`
 * keeps the rule at zero specificity, so any class rule a developer adds still wins.
 */
export const HTML_TAG_RESET_CSS = `:where(${STYLED_TAGS.join(',')}){margin:0;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:inherit;text-decoration:none;list-style:none;min-inline-size:0;appearance:none}`
