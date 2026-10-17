import {
  modesDefaultFirst,
  variablesResolvingThrough,
  type Color,
  type SceneGraph,
  type SceneNode,
  type Variable,
  type VariableScope,
  type VariableValue
} from '@kalka/scene-graph'

import { colorsEqual, type Tolerance } from './values'

/** A variable as `find_nodes` reports it. */
export interface FoundVariable {
  id: string
  name: string
  collection: string
}

export function foundVariable(graph: SceneGraph, variable: Variable): FoundVariable {
  return {
    id: variable.id,
    name: variable.name,
    collection: graph.variableCollections.get(variable.collectionId)?.name ?? ''
  }
}

function cssVariableName(variable: Variable): string {
  const web = variable.codeSyntax?.WEB?.trim()
  const declared = web?.match(/^(?:var\()?\s*(--[\w-]+)/)?.[1]
  return declared ?? `--${variable.name.trim().replace(/[^\w-]+/g, '-')}`
}

/**
 * The variables a search names: by ID, else every variable of that name (exactly, then ignoring
 * case), else by the CSS custom property it is written as, such as `--color-primary` or
 * `var(--color-primary)`.
 */
export function variablesNamed(graph: SceneGraph, query: string): Variable[] {
  const wanted = query.trim()
  const byId = graph.variables.get(wanted)
  if (byId) return [byId]
  const all = [...graph.variables.values()]
  const exact = all.filter((variable) => variable.name === wanted)
  if (exact.length > 0) return exact
  const folded = all.filter((variable) => variable.name.toLowerCase() === wanted.toLowerCase())
  if (folded.length > 0) return folded
  const property = wanted.match(/^(?:var\()?\s*(--[\w-]+)\s*\)?$/)?.[1]
  return property ? all.filter((variable) => cssVariableName(variable) === property) : []
}

/** The field a binding key sets: `fills/0/color` sets `fills`. */
export function bindingRootField(key: string): string {
  return key.split('/')[0]
}

/**
 * The bindings of a layer to these variables, directly or through a variable that aliases one,
 * in any mode, as binding key to the variable bound.
 */
export function bindingsTo(
  node: SceneNode,
  reaching: ReadonlySet<string>
): Array<{ field: string; variableId: string }> {
  return Object.entries(node.boundVariables)
    .filter(([, variableId]) => reaching.has(variableId))
    .map(([field, variableId]) => ({ field, variableId }))
}

/** Every variable whose value comes from one of these, at any depth and in any mode. */
export function reachingVariables(graph: SceneGraph, variables: readonly Variable[]): Set<string> {
  return variablesResolvingThrough(
    graph,
    variables.map((variable) => variable.id)
  )
}

/** A token's value in each mode of its collection, aliases followed, by mode name. */
export function tokenValues(
  graph: SceneGraph,
  variable: Variable
): Array<{ mode: string; value: VariableValue }> {
  const collection = graph.variableCollections.get(variable.collectionId)
  if (!collection) return []
  return modesDefaultFirst(collection).flatMap((mode) => {
    const value = graph.resolveVariable(variable.id, mode.modeId)
    return value === undefined ? [] : [{ mode: mode.name, value }]
  })
}

/** Numeric fields by the Figma scope that lets a variable bind them. */
const NUMBER_FIELDS_BY_SCOPE: Partial<Record<VariableScope, readonly string[]>> = {
  CORNER_RADIUS: [
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius'
  ],
  WIDTH_HEIGHT: ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'],
  GAP: [
    'itemSpacing',
    'counterAxisSpacing',
    'gridRowGap',
    'gridColumnGap',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft'
  ],
  STROKE_FLOAT: [
    'strokeWeight',
    'borderTopWeight',
    'borderRightWeight',
    'borderBottomWeight',
    'borderLeftWeight'
  ],
  OPACITY: ['opacity'],
  FONT_SIZE: ['fontSize'],
  LINE_HEIGHT: ['lineHeight'],
  LETTER_SPACING: ['letterSpacing']
}

const ALL_NUMBER_FIELDS = Object.values(NUMBER_FIELDS_BY_SCOPE).flat()

function scopesOf(variable: Variable): readonly VariableScope[] {
  const scopes = variable.scopes ?? []
  return scopes.length === 0 || scopes.includes('ALL_SCOPES') ? ['ALL_SCOPES'] : scopes
}

function numberFields(variable: Variable): string[] {
  const scopes = scopesOf(variable)
  if (scopes.includes('ALL_SCOPES')) return ALL_NUMBER_FIELDS
  return scopes.flatMap((scope) => NUMBER_FIELDS_BY_SCOPE[scope] ?? [])
}

const FRAME_TYPES = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION'])

/** Whether a color token's scopes let it fill this layer, or stroke it. */
function colorScopeAllows(variable: Variable, node: SceneNode, paints: 'fills' | 'strokes') {
  const scopes = scopesOf(variable)
  if (scopes.includes('ALL_SCOPES')) return true
  if (paints === 'strokes') return scopes.includes('STROKE')
  if (scopes.includes('ALL_FILLS')) return true
  if (node.type === 'TEXT') return scopes.includes('TEXT_FILL')
  return scopes.includes(FRAME_TYPES.has(node.type) ? 'FRAME_FILL' : 'SHAPE_FILL')
}

/** A raw value of a layer that a token could be bound to instead. */
export interface RawValue {
  /** The binding key `bind_variable` takes, such as `fills/0/color` or `cornerRadius`. */
  field: string
  value: VariableValue
}

/**
 * The values of a layer a token of this type and these scopes could bind, unbound to any
 * variable: solid paint colors for a color, the scoped numeric fields for a number, the font
 * family and text content for a string.
 */
export function unboundRawValues(node: SceneNode, variable: Variable): RawValue[] {
  const unbound = (field: string) => !Object.hasOwn(node.boundVariables, field)
  const values: RawValue[] = []
  if (variable.type === 'COLOR') {
    for (const paints of ['fills', 'strokes'] as const) {
      if (!colorScopeAllows(variable, node, paints)) continue
      node[paints].forEach((paint, index) => {
        const field = `${paints}/${index}/color`
        if (paint.type === 'SOLID' && paint.visible && unbound(field))
          values.push({ field, value: paint.color })
      })
    }
  } else if (variable.type === 'FLOAT') {
    for (const field of numberFields(variable)) {
      const value = Reflect.get(node, field)
      if (typeof value === 'number' && unbound(field)) values.push({ field, value })
    }
  } else if (variable.type === 'STRING') {
    const scopes = scopesOf(variable)
    const all = scopes.includes('ALL_SCOPES')
    if ((all || scopes.includes('FONT_FAMILY')) && unbound('fontFamily') && node.type === 'TEXT')
      values.push({ field: 'fontFamily', value: node.fontFamily })
    if ((all || scopes.includes('TEXT_CONTENT')) && unbound('text') && node.type === 'TEXT')
      values.push({ field: 'text', value: node.text })
  }
  return values
}

function isColor(value: VariableValue): value is Color {
  return typeof value === 'object' && 'r' in value
}

/** Whether a raw value equals a token value, colors within the tolerance. */
export function rawValueEquals(raw: VariableValue, token: VariableValue, tolerance: Tolerance) {
  if (isColor(raw) && isColor(token)) return colorsEqual(raw, token, tolerance.color)
  if (typeof raw === 'number' && typeof token === 'number')
    return Math.abs(raw - token) <= tolerance.number
  if (typeof raw === 'string' && typeof token === 'string')
    return raw.trim().toLowerCase() === token.trim().toLowerCase()
  return false
}
