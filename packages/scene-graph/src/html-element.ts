import { uniq } from 'es-toolkit'
import * as v from 'valibot'

/**
 * The HTML a layer is written as: the tag its element takes and the classes it carries. A layer
 * without a tag keeps the one its type gives (a frame is a `div`, a text a `span`); classes are
 * names for the developer's CSS and scripts, never a style the editor draws.
 */

/**
 * Tags a layer may take: each lays out as a box the projection's CSS fully describes. Void
 * elements, embedded content, scripting, tables and interactive widgets with their own
 * behaviour (`details`, `select`) are left out, since their rendering is not the layer's.
 */
export const HTML_TAGS = [
  'div',
  'span',
  'section',
  'header',
  'footer',
  'main',
  'nav',
  'article',
  'aside',
  'figure',
  'figcaption',
  'form',
  'fieldset',
  'address',
  'hgroup',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'pre',
  'a',
  'button',
  'label',
  'legend',
  'strong',
  'em',
  'small',
  'code',
  'mark',
  'time'
] as const
export type HTMLTag = (typeof HTML_TAGS)[number]

/** Tags that lay out inline by default; written as a layer they need `display: block`. */
export const INLINE_HTML_TAGS: ReadonlySet<HTMLTag> = new Set<HTMLTag>([
  'span',
  'a',
  'button',
  'label',
  'strong',
  'em',
  'small',
  'code',
  'mark',
  'time'
])

export function isHTMLTag(value: string): value is HTMLTag {
  return (HTML_TAGS as readonly string[]).includes(value)
}

/** A tag as a layer keeps it, or null when it is not one a layer can take. */
export function parseHTMLTag(value: string | null | undefined): HTMLTag | null {
  const tag = value?.trim().toLowerCase() ?? ''
  return isHTMLTag(tag) ? tag : null
}

/**
 * One class name as HTML and CSS frameworks write it: Tailwind's `md:px-4`, `w-[12px]`, `w-1/2`
 * pass; quotes, angle brackets, `=` and backticks, which could break out of the attribute, do not.
 */
const CLASS_NAME = /^[^\s"'<>=`]+$/

const MAX_CLASSES = 64
const MAX_CLASS_LENGTH = 128

export function isHTMLClassName(value: string): boolean {
  return value.length <= MAX_CLASS_LENGTH && CLASS_NAME.test(value)
}

/** The classes of a `class` attribute or a typed list: valid names, each once, in order. */
export function parseHTMLClasses(value: string | readonly string[] | null | undefined): string[] {
  if (!value) return []
  const tokens =
    typeof value === 'string' ? value.split(/\s+/) : value.flatMap((item) => item.split(/\s+/))
  return uniq(tokens.filter((token) => token.length > 0 && isHTMLClassName(token))).slice(
    0,
    MAX_CLASSES
  )
}

/** Stored classes, from a file: invalid names are dropped rather than failing the list. */
export const htmlClassesSchema: v.GenericSchema<unknown, string[]> = v.pipe(
  v.array(v.string()),
  v.transform((classes) => parseHTMLClasses(classes))
)
