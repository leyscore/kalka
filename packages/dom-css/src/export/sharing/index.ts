import type {
  DesignDocument,
  DesignElement,
  DesignNode,
  DesignStyleDeclaration,
  MediaStyle
} from '#dom-css/types'

import { mergeClassNames } from '../html'
import { claimClassName, ownClassBase, sharedClassBase, takenClassNames } from './names'

/**
 * Where a layer is and how big, which layers styled alike still differ in: these stay with the
 * layer, inline or in its own class, and the rest of its style can be shared.
 */
const PLACEMENT = new Set([
  'width',
  'height',
  'left',
  'top',
  'right',
  'bottom',
  'inset',
  'transform',
  'transform-origin'
])

/** The properties one shorthand can set together, which must stay in one rule. */
function family(property: string): string {
  if (property === 'left' || property === 'top' || property === 'right' || property === 'bottom')
    return 'inset'
  if (property === 'row-gap' || property === 'column-gap') return 'gap'
  return property.split('-')[0] ?? property
}

const PLACEMENT_FAMILIES = new Set([...PLACEMENT].map(family))

interface SplitStyle {
  shared: DesignStyleDeclaration
  own: DesignStyleDeclaration
}

/**
 * A layer's style as what it can share and what is its own. Each shorthand's family stays on one
 * side, so the cascade sets every property as the single declaration block did.
 */
function splitStyle(style: DesignStyleDeclaration): SplitStyle {
  const shared: DesignStyleDeclaration = {}
  const own: DesignStyleDeclaration = {}
  for (const [name, value] of Object.entries(style)) {
    if (value === '') continue
    if (PLACEMENT_FAMILIES.has(family(name))) own[name] = value
    else shared[name] = value
  }
  return { shared, own }
}

export function styleToCSS(style: DesignStyleDeclaration): string {
  return Object.entries(style)
    .filter(([, value]) => value !== '')
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ')
}

function forEachElement(node: DesignNode, visit: (element: DesignElement) => void): void {
  if (node.type === 'text') return
  visit(node)
  for (const child of node.children) forEachElement(child, visit)
}

/** A rule of a breakpoint, kept with its width so wider breakpoints come first. */
export interface MediaRule {
  maxWidth: number
  css: string
}

function mediaRule(className: string, { maxWidth, style }: MediaStyle): MediaRule {
  return { maxWidth, css: `@media (max-width:${maxWidth}px){.${className}{${styleToCSS(style)}}}` }
}

/** The media rules of a page, widest first, so a narrower breakpoint's rules win below it. */
export function mediaCSS(rules: readonly MediaRule[]): string {
  return [...rules]
    .sort((a, b) => b.maxWidth - a.maxWidth)
    .map((rule) => rule.css)
    .join('')
}

export interface SharedStyles {
  document: DesignDocument
  /** The class rules the document's elements now use, shared ones first. */
  css: string
  media: MediaRule[]
}

export interface ShareStylesOptions {
  /**
   * `inline` keeps what is a layer's own in its `style`, as a fragment does; `classes` moves it
   * into a class of the layer's own, as a page with a stylesheet does, which breakpoints need.
   */
  own: 'inline' | 'classes'
  /** Class names the page defines already, which generated ones must not take. */
  reserved?: Iterable<string>
}

class StyleSharing {
  /** The class of each style several layers share, by its declarations. */
  private readonly sharedClasses = new Map<string, string>()
  /** The class of each own style, by its declarations, so equal ones share it too. */
  private readonly ownClasses = new Map<string, string>()
  private readonly sharedRules: string[] = []
  private readonly ownRules: string[] = []
  readonly media: MediaRule[] = []

  constructor(
    document: DesignDocument,
    private readonly taken: Set<string>,
    private readonly own: ShareStylesOptions['own']
  ) {
    const alike = new Map<string, DesignElement[]>()
    for (const node of document.children)
      forEachElement(node, (element) => {
        const key = styleToCSS(splitStyle(element.inlineStyle ?? {}).shared)
        if (key) alike.set(key, [...(alike.get(key) ?? []), element])
      })
    for (const [key, elements] of alike) {
      const first = elements.at(0)
      if (!first || elements.length < 2) continue
      const className = claimClassName(sharedClassBase(first, elements, key), this.taken)
      this.sharedClasses.set(key, className)
      this.sharedRules.push(`.${className}{${key}}`)
    }
  }

  css(): string {
    return [...this.sharedRules, ...this.ownRules].join('')
  }

  /**
   * A class of the element's own for `style`. Layers styled exactly alike share it, but not
   * layers that only happen to have the same size beside a shared class.
   */
  private ownClass(element: DesignElement, style: DesignStyleDeclaration, whole: boolean): string {
    const declarations = styleToCSS(style)
    // A layer with breakpoints keeps a class its media rules alone target.
    const reuse = whole && (element.mediaStyles?.length ?? 0) === 0
    const existing = reuse ? this.ownClasses.get(declarations) : undefined
    if (existing) return existing
    const className = claimClassName(ownClassBase(element), this.taken)
    if (declarations) this.ownRules.push(`.${className}{${declarations}}`)
    if (reuse) this.ownClasses.set(declarations, className)
    for (const style of element.mediaStyles ?? []) this.media.push(mediaRule(className, style))
    return className
  }

  element(element: DesignElement): DesignElement {
    const style = element.inlineStyle ?? {}
    const media = (element.mediaStyles?.length ?? 0) > 0
    const split = splitStyle(style)
    const sharedClass = this.sharedClasses.get(styleToCSS(split.shared))
    const ownStyle = sharedClass ? split.own : style
    const classes: Array<string | undefined> = [element.attrs.class, sharedClass]
    let inlineStyle: DesignStyleDeclaration | undefined = ownStyle
    if (this.own === 'classes' && (Object.keys(ownStyle).length > 0 || media)) {
      classes.push(this.ownClass(element, ownStyle, !sharedClass))
      inlineStyle = undefined
    }
    const className = mergeClassNames(...classes)
    return {
      ...element,
      attrs: className ? { ...element.attrs, class: className } : element.attrs,
      inlineStyle: inlineStyle && Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined
    }
  }
}

function shareNode(node: DesignNode, sharing: StyleSharing): DesignNode {
  if (node.type === 'text') return node
  // Parents claim their names before their children, in reading order.
  const element = sharing.element(node)
  return { ...element, children: node.children.map((child) => shareNode(child, sharing)) }
}

/**
 * Styles several layers repeat as class rules, named after the first layer with each: what a
 * layer has of its own, its place and size, stays with it. Every element keeps the declarations
 * it had, so the page draws as it did with every style inline.
 */
export function shareStyles(document: DesignDocument, options: ShareStylesOptions): SharedStyles {
  const sharing = new StyleSharing(
    document,
    takenClassNames(document, options.reserved),
    options.own
  )
  const children = document.children.map((node) => shareNode(node, sharing))
  return { document: { ...document, children }, css: sharing.css(), media: sharing.media }
}
