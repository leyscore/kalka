import {
  CSS_CLASS_FIELDS,
  classStyleFromNode,
  documentCSSClasses,
  type CSSClass,
  type CSSClassKind,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import { fieldsOwning } from '@kalka/scene-graph/css-model'

/**
 * Classes from CSS as an agent writes it. Declarations go through the same CSS engine as
 * `write_html`, so shorthands (`padding: 0 28px`, `background: #fff`), relative units and the
 * cascade read as a browser reads them; the class keeps the fields of its kind those declarations
 * set and reports the rest, which a class cannot hold.
 */

/** Text properties: a rule of only these styles text; any other makes it style boxes. */
const TEXT_PROPERTY = /^(?:color|font(?:-.*)?|line-height|letter-spacing|text-.*|white-space)$/

/** A line height or letter spacing in units of the font size: a number, `em` or a percentage. */
const RELATIVE_TO_FONT = /^(-?[\d.]+)(em|%)?$/

/** The CSS a class of each kind can hold, as the fields in `CSS_CLASS_FIELDS` write it. */
const CLASS_PROPERTIES: Record<CSSClassKind, RegExp> = {
  box: /^(?:background(?:-color)?|border(?:-.*)?|outline(?:-.*)?|box-shadow|filter|backdrop-filter|opacity|mix-blend-mode|display|flex-direction|flex-wrap|justify-content|align-items|align-content|gap|row-gap|column-gap|padding(?:-.*)?)$/,
  text: /^(?:color|font(?:-family|-weight|-style|-size)?|line-height|letter-spacing|text-align|text-transform|text-decoration(?:-.*)?|text-shadow|opacity|mix-blend-mode)$/
}

const NOT_HELD: Record<CSSClassKind, string> = {
  box: 'a box class holds paint, borders, corners, shadows, padding and auto layout: set sizes and position on the layers, and type on a text class',
  text: 'a text class holds type and color: set the rest on the layers'
}

/** A length relative to the font size in pixels, or null when it is not one. */
function resolvedAgainstFont(property: string, value: string, fontSize: number): string | null {
  const match = RELATIVE_TO_FONT.exec(value.trim())
  if (!match) return null
  const amount = Number.parseFloat(match[1])
  // A bare number is a multiple for line-height; letter-spacing takes no unitless value but 0.
  if (!match[2] && property === 'letter-spacing') return amount === 0 ? '0px' : null
  const scale = match[2] === '%' ? amount / 100 : amount
  return `${Math.round(scale * fontSize * 100) / 100}px`
}

function pixelFontSize(declarations: Record<string, string>): number | null {
  const match = /^([\d.]+)px$/.exec(declarations['font-size']?.trim() ?? '')
  return match ? Number.parseFloat(match[1]) : null
}

/** The kind a class written as `declarations` most likely has: text when it only styles text. */
export function inferredClassKind(declarations: Record<string, string>): CSSClassKind {
  const names = Object.keys(declarations)
  return names.length > 0 && names.every((name) => TEXT_PROPERTY.test(name)) ? 'text' : 'box'
}

export function cssRule(selector: string, declarations: Record<string, string>): string {
  const body = Object.entries(declarations)
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ')
  return `${selector} { ${body} }`
}

function findLayer(graph: SceneGraph, kind: CSSClassKind): SceneNode | undefined {
  for (const page of graph.getPages())
    for (const root of graph.getChildren(page.id))
      for (const node of [root, ...graph.flattenTree(root.id).map((entry) => entry.node)])
        if ((node.type === 'TEXT') === (kind === 'text')) return node
  return undefined
}

/**
 * The CSS each class was last written with in this session, so later HTML that names a class
 * also inherits what its fields cannot hold, such as a button class's font for its label.
 */
const authoredRules = new WeakMap<SceneGraph, Map<string, Record<string, string>>>()

/** Remembers the CSS a class was written with, merged over what it had. */
export function rememberClassCSS(
  graph: SceneGraph,
  name: string,
  declarations: Record<string, string>
): void {
  let rules = authoredRules.get(graph)
  if (!rules) {
    rules = new Map()
    authoredRules.set(graph, rules)
  }
  rules.set(name, { ...rules.get(name), ...declarations })
}

export interface ClassFromCSS {
  cssClass: CSSClass
  /** Declarations the class cannot hold, with why, for the agent to set on the layers. */
  ignored: Record<string, string>
}

/** A class of `kind` holding what `declarations` set, read by the CSS engine. */
export async function cssClassFromDeclarations(
  name: string,
  kind: CSSClassKind,
  declarations: Record<string, string>
): Promise<ClassFromCSS> {
  const { htmlToSceneGraph } = await import('@kalka/dom-css')
  const ignored: Record<string, string> = {}
  const kept: Record<string, string> = {}
  const fontSize = pixelFontSize(declarations)
  for (const [property, value] of Object.entries(declarations)) {
    if (!CLASS_PROPERTIES[kind].test(property)) {
      ignored[property] = NOT_HELD[kind]
      continue
    }
    if (property === 'line-height' || property === 'letter-spacing') {
      // Layers hold these in pixels, so a class resolves them against its own font size.
      const relative = RELATIVE_TO_FONT.test(value.trim()) && !/^0(?:px)?$/.test(value.trim())
      if (relative) {
        const resolved = fontSize === null ? null : resolvedAgainstFont(property, value, fontSize)
        if (resolved === null) {
          ignored[property] =
            'relative to the font size, which this class does not set in px: add font-size to the class or set it on each layer'
          continue
        }
        kept[property] = resolved
        continue
      }
    }
    kept[property] = value
  }

  const fields: readonly string[] = CSS_CLASS_FIELDS[kind]
  const owned = [...fieldsOwning(Object.keys(kept))].filter((field) => fields.includes(field))
  // Shorthands own their longhands' fields.
  if ('background' in kept) owned.push('fills')
  if ('font' in kept) owned.push('fontFamily', 'fontSize', 'fontWeight', 'italic', 'lineHeight')

  const markup =
    kind === 'text'
      ? '<p class="kalka-class">Aa</p>'
      : '<div class="kalka-class"><span>Aa</span></div>'
  const imported = await htmlToSceneGraph(
    `<style>${cssRule('.kalka-class', kept)}</style>${markup}`,
    { pageName: 'Class' }
  )
  const layer = findLayer(imported, kind)
  const read = layer ? classStyleFromNode(layer) : {}
  const style = Object.fromEntries(Object.entries(read).filter(([field]) => owned.includes(field)))
  return { cssClass: { name, kind, style }, ignored }
}

/**
 * The document's classes as one stylesheet, so HTML written later that names them lays out and
 * inherits as it will on the canvas.
 */
export async function documentClassSheet(graph: SceneGraph): Promise<string> {
  const classes = documentCSSClasses(graph)
  if (classes.length === 0) return ''
  const { cssClassDeclarations } = await import('@kalka/dom-css/export')
  const authored = authoredRules.get(graph)
  return classes
    .map((cssClass) =>
      cssRule(`.${cssClass.name}`, {
        ...authored?.get(cssClass.name),
        ...cssClassDeclarations(cssClass)
      })
    )
    .join('\n')
}
