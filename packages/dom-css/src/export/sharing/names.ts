import { cssName } from '#dom-css/behaviours/states/names'
import type { DesignDocument, DesignElement, DesignNode } from '#dom-css/types'

import type { SceneNode } from '@kalka/scene-graph'
import { pickStyle } from '@kalka/scene-graph/css-model'

import { splitWhitespace } from '../html'
import { claimName } from '../storybook/names'

/** Names a tool gives new layers, which say nothing about what a layer is. */
const DEFAULT_LAYER_NAME =
  /^(frame|group|rectangle|ellipse|polygon|star|vector|line|text|image|img|component|instance|layer)(\s*\d+)?$/i

/** Tags that name no layer: a box or a run of text, whatever it draws. */
const GENERIC_TAGS: ReadonlySet<string> = new Set(['div', 'span'])

/** What an element is, for a layer whose name does not say: `link`, `image`, `row`. */
const TAG_ROLES: ReadonlyMap<string, string> = new Map([
  ['a', 'link'],
  ['img', 'image'],
  ['svg', 'icon'],
  ['p', 'text']
])

/** How many words of a name or a text a class takes. */
const CLASS_WORDS = 4

/** Combining marks, which `NFKD` splits off accented letters. */
const MARKS = /\p{M}/gu

/** A selector a layer imported from HTML was named after, such as `section.hero`. */
const SELECTOR = /^[a-z][\w-]*(?:\.[a-z][\w-]*)+$/

/** A class list a layer imported from HTML was named after, such as `ft-row ft-file`. */
const CLASS_LIST = /^[a-z][a-z0-9_]*-[\w-]+(?:\s+[a-z][a-z0-9_]*-[\w-]+)+$/

/** The first words of a name or a text, accents dropped, for a class to take. */
function words(text: string): string {
  const plain = text.normalize('NFKD').replaceAll(MARKS, '')
  return splitWhitespace(plain).slice(0, CLASS_WORDS).join(' ')
}

/**
 * What a layer's name says it is, or undefined when it says nothing: a default name, or the
 * element's own tag, as layers imported from HTML are named. A layer named after the classes of
 * the element it was imported from takes the first of them.
 */
function meaningfulName(element: DesignElement): string | undefined {
  const name = element.sourceSceneNode?.name.trim()
  const tag = element.tagName.toLowerCase()
  const says = (part: string) => part.toLowerCase() !== tag && !GENERIC_TAGS.has(part.toLowerCase())
  if (!name || DEFAULT_LAYER_NAME.test(name)) return undefined
  if (SELECTOR.test(name) || CLASS_LIST.test(name)) return name.split(/[\s.]+/).find(says)
  return says(name) ? name : undefined
}

/** A word for what a box is from how it lays out its children. */
function boxRole(element: DesignElement): string {
  const style = element.inlineStyle ?? {}
  if (style.display === 'flex') return style['flex-direction'] === 'column' ? 'stack' : 'row'
  if (style.display === 'grid') return 'grid'
  return 'box'
}

/** What an element is when its layer's name does not say. */
function role(element: DesignElement): string {
  const tag = element.tagName.toLowerCase()
  if (element.sourceSceneNode?.type === 'TEXT') return tag === 'span' || tag === 'p' ? 'text' : tag
  const tagRole = TAG_ROLES.get(tag)
  if (tagRole) return tagRole
  if (tag === 'div' || tag === 'span') return boxRole(element)
  return tag
}

function nameClass(element: DesignElement): string | undefined {
  const name = meaningfulName(element)
  return name ? cssName(words(name), 'layer') : undefined
}

/** The first words of a text layer, which name its own class as a developer would. */
function textClass(element: DesignElement): string | undefined {
  const text = element.sourceSceneNode?.type === 'TEXT' ? element.sourceSceneNode.text : ''
  const first = words(text)
  return first ? cssName(first, 'text') : undefined
}

/** Weight names as type scales call them; the regular weight goes unsaid. */
const WEIGHT_NAMES: ReadonlyMap<number, string> = new Map([
  [100, 'thin'],
  [200, 'extralight'],
  [300, 'light'],
  [500, 'medium'],
  [600, 'semibold'],
  [700, 'bold'],
  [800, 'extrabold'],
  [900, 'black']
])

/** A text style by its size and weight, `text-21-semibold`, as type scales name them. */
function textStyleClass(node: SceneNode): string {
  const weight = WEIGHT_NAMES.get(node.fontWeight)
  return cssName(['text', String(Math.round(node.fontSize)), weight ?? ''].join(' '), 'text')
}

/** Whether a text layer is named after its words, as design tools name new text. */
function namedAfterText(node: SceneNode): boolean {
  const name = node.name.trim()
  return name.length > 0 && node.text.trim().startsWith(name)
}

/**
 * A class for a style several layers share: the name they all have, or what the first one is.
 * Text named after its own words is named after its type, which the others share with it.
 */
export function sharedClassBase(first: DesignElement, all: readonly DesignElement[]): string {
  const names = new Set(all.map(nameClass))
  const [name] = names
  if (names.size === 1 && name) return name
  const node = first.sourceSceneNode
  if (node?.type === 'TEXT' && (namedAfterText(node) || !meaningfulName(first)))
    return textStyleClass(node)
  return nameClass(first) ?? role(first)
}

/** A class for one layer's own declarations: its name, its first words, or what it is. */
export function ownClassBase(element: DesignElement): string {
  return nameClass(element) ?? textClass(element) ?? role(element)
}

function collectClasses(node: DesignNode, names: Set<string>): void {
  if (node.type === 'text') return
  for (const name of splitWhitespace(pickStyle(node.attrs, 'class') ?? '')) names.add(name)
  for (const child of node.children) collectClasses(child, names)
}

/** Class names a generated one must not take: every class the markup already uses. */
export function takenClassNames(
  document: DesignDocument,
  reserved: Iterable<string> = []
): Set<string> {
  const names = new Set(reserved)
  for (const node of document.children) collectClasses(node, names)
  return names
}

/** The first free class name from `base`: `base`, then `base-2`, `base-3`. */
export function claimClassName(base: string, taken: Set<string>): string {
  return claimName(base, taken, { separator: '-' })
}
