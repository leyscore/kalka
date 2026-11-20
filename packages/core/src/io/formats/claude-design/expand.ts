import { compact } from 'es-toolkit/array'
import { isPlainObject } from 'es-toolkit/predicate'
import { camelCase, kebabCase } from 'es-toolkit/string'

import {
  attribute,
  isElement,
  type DesignComponent,
  type ParsedElement,
  type ParsedNode
} from './component'

/** What `renderVals()` returned, or the stand-ins for it when the logic could not run. */
export type DesignValues = Record<string, unknown>

/**
 * Fills a component's holes. `values` runs its logic with the props it is given; when it returns
 * null, the holes fall back to the tweaks' defaults and the template's `hint-*` placeholders.
 */
export interface ExpandOptions {
  component: (name: string) => DesignComponent | undefined
  values: (
    name: string,
    component: DesignComponent,
    props: DesignValues
  ) => Promise<DesignValues | null>
  /** Deepest `<dc-import>` nesting followed; deeper imports keep their placeholder box. */
  maxDepth?: number
}

/** A component's markup with every hole, loop, branch and import resolved. */
export interface ExpandedComponent {
  html: string
  /** Stylesheet links of the component and the ones it imports, each once. */
  links: string[]
  /** `<style>` sheets of the component and the ones it imports, each once. */
  styles: string[]
}

const HOLE = /\{\{\s*([^{}]*?)\s*\}\}/g
const WHOLE_HOLE = /^\s*\{\{\s*([^{}]*?)\s*\}\}\s*$/
const DEFAULT_MAX_DEPTH = 8
const DEFAULT_PLACEHOLDER_COUNT = 3

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr'
])
const RAW_TEXT_ELEMENTS = new Set(['style', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'])
/** Attributes a hole's value of `false` writes rather than removes, as React writes them. */
const STRINGIFIED_BOOLEAN = /^(aria-|data-)|^(draggable|spellcheck|contenteditable)$/

interface Scope {
  values: DesignValues
  /** Loop variables, innermost last. */
  locals: DesignValues[]
  /** Whether missing values take the template's `hint-*` placeholders. */
  placeholders: boolean
}

interface State {
  options: ExpandOptions
  links: string[]
  styles: string[]
  /** Components being expanded, to stop an import of itself. */
  stack: string[]
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function literal(expression: string): { value: unknown } | null {
  if (expression === 'true') return { value: true }
  if (expression === 'false') return { value: false }
  if (expression === 'null' || expression === 'undefined' || expression === '')
    return { value: null }
  if (/^-?\d+(\.\d+)?$/.test(expression)) return { value: Number(expression) }
  const quoted = /^(['"])(.*)\1$/.exec(expression)
  if (quoted) return { value: quoted[2] }
  return null
}

function property(value: unknown, key: string): unknown {
  if (Array.isArray(value)) return key === 'length' ? value.length : value[Number(key)]
  if (isPlainObject(value)) return value[key]
  if (typeof value === 'string' && key === 'length') return value.length
  return undefined
}

/** A hole's value: a literal, or a dotted path through the loop variables and the values. */
function lookup(scope: Scope, expression: string): unknown {
  const constant = literal(expression)
  if (constant) return constant.value
  const [head = '', ...rest] = expression.split('.').map((part) => part.trim())
  const owner = [...scope.locals].reverse().find((locals) => head in locals) ?? scope.values
  let value: unknown = owner[head]
  for (const key of rest) value = property(value, key)
  return value
}

function textValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (Array.isArray(value)) return value.map(textValue).join('')
  return ''
}

function interpolate(scope: Scope, text: string): string {
  return text.replace(HOLE, (_, expression: string) => textValue(lookup(scope, expression)))
}

/** A style written as an object, as React takes it, in CSS. */
function styleText(value: Record<string, unknown>): string {
  return Object.entries(value)
    .filter(([, declaration]) => typeof declaration === 'string' || typeof declaration === 'number')
    .map(([name, declaration]) => {
      const property = name.startsWith('--') ? name : kebabCase(name)
      const unit = typeof declaration === 'number' && declaration !== 0 ? 'px' : ''
      return `${property}: ${String(declaration)}${unit}`
    })
    .join('; ')
}

/** The attribute a whole-value hole writes, or null to leave it out. */
function attributeValue(name: string, value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'boolean') {
    if (STRINGIFIED_BOOLEAN.test(name)) return String(value)
    return value ? '' : null
  }
  if (typeof value === 'string') return value
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null
  if (name === 'style' && isPlainObject(value)) return styleText(value)
  return null
}

function attributeName(attr: ParsedElement['attrs'][number]): string {
  return attr.prefix ? `${attr.prefix}:${attr.name}` : attr.name
}

function renderAttributes(element: ParsedElement, scope: Scope): string {
  let out = ''
  for (const attr of element.attrs) {
    const name = attributeName(attr)
    // Handlers never run in a design; `hint-*` only guide the runtime's placeholders.
    if (/^on/i.test(name) || name.startsWith('hint-') || name === 'key' || name === 'ref') continue
    const whole = WHOLE_HOLE.exec(attr.value)
    const value = whole
      ? attributeValue(name, lookup(scope, whole[1] ?? ''))
      : interpolate(scope, attr.value)
    if (value === null) continue
    out += value === '' && !whole ? ` ${name}=""` : ` ${name}="${escapeAttribute(value)}"`
  }
  return out
}

function placeholderValue(element: ParsedElement, scope: Scope): unknown {
  const hint = attribute(element, 'hint-placeholder-val')
  if (hint === undefined) return undefined
  const whole = WHOLE_HOLE.exec(hint)
  return whole ? lookup(scope, whole[1] ?? '') : hint
}

function holeValue(element: ParsedElement, name: string, scope: Scope): unknown {
  const raw = attribute(element, name) ?? ''
  const whole = WHOLE_HOLE.exec(raw)
  return whole ? lookup(scope, whole[1] ?? '') : interpolate(scope, raw)
}

/** `hint-size="W,H"`: the box a child takes before it renders, in CSS lengths. */
function hintBox(element: ParsedElement): string {
  const [width, height] = (attribute(element, 'hint-size') ?? '')
    .split(',')
    .map((part) => part.trim())
  const length = (value: string | undefined) =>
    value && /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value
  return compact([width && `width: ${length(width)}`, height && `height: ${length(height)}`]).join(
    '; '
  )
}

function addSheets(state: State, component: DesignComponent): void {
  for (const link of component.links) if (!state.links.includes(link)) state.links.push(link)
  for (const style of component.styles) if (!state.styles.includes(style)) state.styles.push(style)
}

async function renderImport(element: ParsedElement, scope: Scope, state: State): Promise<string> {
  const name = attribute(element, 'name') ?? ''
  const component = state.options.component(name)
  const depth = state.options.maxDepth ?? DEFAULT_MAX_DEPTH
  if (!component || state.stack.includes(name) || state.stack.length >= depth) {
    const box = hintBox(element)
    return `<div data-dc-import="${escapeAttribute(name)}"${box ? ` style="${escapeAttribute(box)}"` : ''}></div>`
  }
  const props: DesignValues = { ...component.defaults }
  for (const attr of element.attrs) {
    const attrName = attributeName(attr)
    if (attrName === 'name' || attrName.startsWith('hint-')) continue
    const whole = WHOLE_HOLE.exec(attr.value)
    props[camelCase(attrName)] = whole
      ? lookup(scope, whole[1] ?? '')
      : interpolate(scope, attr.value)
  }
  return renderComponent(name, component, props, state)
}

async function renderElement(element: ParsedElement, scope: Scope, state: State): Promise<string> {
  const tag = element.tagName
  if (tag === 'helmet' || tag === 'script' || tag === 'template') return ''
  if (tag === 'sc-if') {
    let condition = holeValue(element, 'value', scope)
    if (condition === undefined && scope.placeholders) condition = placeholderValue(element, scope)
    return condition ? renderNodes(element.childNodes, scope, state) : ''
  }
  if (tag === 'sc-for') {
    const list = holeValue(element, 'list', scope)
    const count = Number(attribute(element, 'hint-placeholder-count') ?? DEFAULT_PLACEHOLDER_COUNT)
    const placeholders = scope.placeholders && list === undefined
    let items: unknown[] = []
    if (Array.isArray(list)) items = list
    else if (placeholders) items = Array.from({ length: count }, () => ({}))
    const as = attribute(element, 'as') ?? 'item'
    let out = ''
    for (const [index, item] of items.entries()) {
      const locals = { ...scope, locals: [...scope.locals, { [as]: item, $index: index }] }
      out += await renderNodes(element.childNodes, locals, state)
    }
    return out
  }
  if (tag === 'dc-import') return renderImport(element, scope, state)

  // A design system's component, whose bundle is not here: its content in a box of its slot.
  const outputTag = tag === 'x-import' ? 'div' : tag
  const attributes =
    tag === 'x-import'
      ? renderAttributes(
          { ...element, attrs: element.attrs.filter((attr) => attr.name === 'style') },
          scope
        )
      : renderAttributes(element, scope)
  if (VOID_ELEMENTS.has(outputTag)) return `<${outputTag}${attributes}>`
  const children = RAW_TEXT_ELEMENTS.has(outputTag)
    ? element.childNodes
        .map((child) => ('value' in child ? interpolate(scope, child.value) : ''))
        .join('')
    : await renderNodes(element.childNodes, scope, state)
  return `<${outputTag}${attributes}>${children}</${outputTag}>`
}

async function renderNodes(
  nodes: readonly ParsedNode[],
  scope: Scope,
  state: State
): Promise<string> {
  let out = ''
  for (const node of nodes) {
    if (isElement(node)) out += await renderElement(node, scope, state)
    else if (node.nodeName === '#text' && 'value' in node)
      out += escapeText(interpolate(scope, node.value))
  }
  return out
}

async function renderComponent(
  name: string,
  component: DesignComponent,
  props: DesignValues,
  state: State
): Promise<string> {
  addSheets(state, component)
  const values = await state.options.values(name, component, props)
  const scope: Scope = {
    values: values ?? props,
    locals: [],
    placeholders: values === null
  }
  state.stack.push(name)
  try {
    return await renderNodes(component.template, scope, state)
  } finally {
    state.stack.pop()
  }
}

/** Expands a component into plain HTML: the markup a browser draws, with no runtime left. */
export async function expandDesignComponent(
  name: string,
  options: ExpandOptions,
  props: DesignValues = {}
): Promise<ExpandedComponent> {
  const component = options.component(name)
  if (!component) throw new Error(`Component "${name}" not found`)
  const state: State = { options, links: [], styles: [], stack: [] }
  const html = await renderComponent(name, component, { ...component.defaults, ...props }, state)
  return { html, links: state.links, styles: state.styles }
}
