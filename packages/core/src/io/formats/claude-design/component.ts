import { parse, type DefaultTreeAdapterTypes } from 'parse5'
import * as v from 'valibot'

import type { Size } from '@kalka/scene-graph'

export type ParsedNode = DefaultTreeAdapterTypes.ChildNode
export type ParsedElement = DefaultTreeAdapterTypes.Element
type ParsedParent = DefaultTreeAdapterTypes.ParentNode

/** A component's preferred size, from `$preview`. */
export type PreviewSize = Size

/**
 * A Design Component (`.dc.html`): markup with `{{holes}}` inside `<x-dc>`, its stylesheets,
 * and the logic class whose `renderVals()` fills the holes.
 */
export interface DesignComponent {
  lang: string | null
  title: string
  /** Stylesheet links of its head and `<helmet>`, as written. */
  links: string[]
  /** Its `<style>` sheets, head and `<helmet>`. */
  styles: string[]
  /** The markup inside `<x-dc>`, without the `<helmet>`. */
  template: ParsedNode[]
  /** The source of `class Component extends DCLogic`, when it has one. */
  script: string | null
  /** Each tweak's `default` from `data-props`, by prop name. */
  defaults: Record<string, unknown>
  /** The preferred size from `data-props`' `$preview`. */
  preview: PreviewSize | null
}

const PropsSchema = v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.unknown()))
const PreviewSchema = v.object({
  width: v.pipe(v.number(), v.finite(), v.minValue(1)),
  height: v.pipe(v.number(), v.finite(), v.minValue(1))
})
const PropSchema = v.object({ default: v.unknown() })

export function isElement(node: ParsedNode): node is ParsedElement {
  return 'tagName' in node
}

export function attribute(element: ParsedElement, name: string): string | undefined {
  return element.attrs.find((attr) => attr.name === name)?.value
}

function textOf(element: ParsedElement): string {
  return element.childNodes.map((child) => ('value' in child ? child.value : '')).join('')
}

function findElement(
  parent: ParsedParent,
  match: (element: ParsedElement) => boolean
): ParsedElement | undefined {
  for (const child of parent.childNodes) {
    if (!isElement(child)) continue
    if (match(child)) return child
    const found = findElement(child, match)
    if (found) return found
  }
  return undefined
}

function collectElements(
  nodes: readonly ParsedNode[],
  tagName: string,
  into: ParsedElement[] = []
): ParsedElement[] {
  for (const child of nodes) {
    if (!isElement(child)) continue
    if (child.tagName === tagName) into.push(child)
    else collectElements(child.childNodes, tagName, into)
  }
  return into
}

/** The stylesheets a head or `<helmet>` declares, in order. */
function readSheets(parent: ParsedParent, links: string[], styles: string[]): void {
  for (const child of parent.childNodes) {
    if (!isElement(child)) continue
    if (child.tagName === 'style') styles.push(textOf(child))
    else if (child.tagName === 'link' && attribute(child, 'rel')?.toLowerCase() === 'stylesheet') {
      const href = attribute(child, 'href')
      if (href) links.push(href)
    } else if (child.tagName !== 'script') readSheets(child, links, styles)
  }
}

function readProps(script: ParsedElement | undefined) {
  const defaults: Record<string, unknown> = {}
  let preview: PreviewSize | null = null
  const raw = script ? attribute(script, 'data-props') : undefined
  if (!raw) return { defaults, preview }
  const props = v.safeParse(PropsSchema, raw)
  if (!props.success) return { defaults, preview }
  for (const [name, spec] of Object.entries(props.output)) {
    if (name === '$preview') {
      const size = v.safeParse(PreviewSchema, spec)
      if (size.success) preview = size.output
      continue
    }
    const prop = v.safeParse(PropSchema, spec)
    if (prop.success && prop.output.default !== undefined) defaults[name] = prop.output.default
  }
  return { defaults, preview }
}

/** Reads a `.dc.html` file. Its scripts are kept as text and never run here. */
export function parseDesignComponent(html: string): DesignComponent {
  const parsed = parse(html)
  const root = findElement(parsed, (element) => element.tagName === 'html')
  const head = findElement(parsed, (element) => element.tagName === 'head')
  const body = findElement(parsed, (element) => element.tagName === 'body')
  const container = findElement(parsed, (element) => element.tagName === 'x-dc') ?? body
  const script = findElement(
    parsed,
    (element) =>
      element.tagName === 'script' &&
      (attribute(element, 'type') === 'text/x-dc' ||
        element.attrs.some((attr) => attr.name === 'data-dc-script'))
  )

  const links: string[] = []
  const styles: string[] = []
  if (head) readSheets(head, links, styles)
  const template: ParsedNode[] = []
  for (const child of container?.childNodes ?? []) {
    if (isElement(child) && child.tagName === 'helmet') readSheets(child, links, styles)
    else if (isElement(child) && child.tagName === 'script') continue
    else template.push(child)
  }
  // A `<helmet>` nested deeper still declares the component's sheets.
  for (const helmet of collectElements(template, 'helmet')) readSheets(helmet, links, styles)

  const titleElement = head ? findElement(head, (element) => element.tagName === 'title') : null
  const source = script ? textOf(script).trim() : ''
  return {
    lang: (root && attribute(root, 'lang')) || null,
    title: titleElement ? textOf(titleElement).trim() : '',
    links,
    styles,
    template,
    script: source || null,
    ...readProps(script)
  }
}
