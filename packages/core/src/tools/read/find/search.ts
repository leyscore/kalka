import type { SceneGraph, SceneNode, Variable } from '@kalka/scene-graph'
import {
  propertiesFor,
  fieldsOwning,
  layerCSS,
  type CSSDeclarations
} from '@kalka/scene-graph/css-model'

import { formatVariableValue } from '#core/tools/variables/resolved'

import {
  bindingRootField,
  bindingsTo,
  foundVariable,
  rawValueEquals,
  tokenValues,
  unboundRawValues,
  type FoundVariable
} from './tokens'
import { cssValueMatches, declaredValue, textMatches, type Tolerance } from './values'

export type VariableMatch = 'bound' | 'unbound' | 'any'

export interface FindQuery {
  type?: string
  name?: string
  text?: string
  style?: { property?: string; value?: string }
  /** The variables named, and every variable that resolves through one of them. */
  variables?: { named: readonly Variable[]; reaching: ReadonlySet<string>; match: VariableMatch }
  tolerance: Tolerance
}

/** A CSS declaration a layer matched on, with the variables bound to the fields it comes from. */
export interface StyleMatch {
  property: string
  value: string
  variables?: Array<FoundVariable & { field: string }>
}

/** A field of a layer bound to a searched token, or holding its value unbound. */
export interface TokenMatch {
  field: string
  /** The CSS properties the field gives this layer. */
  properties: string[]
  value: string
  variable: FoundVariable
  bound: boolean
  /** Bound to a variable that aliases the token rather than to the token itself. */
  throughAlias?: true
  /** The token's modes whose value the unbound field holds. */
  modes?: string[]
  /** The mode the layer reads the bound variable in. */
  mode?: string
}

export interface FoundNode {
  id: string
  name: string
  type: string
  page: { id: string; name: string }
  text?: string
  styles?: StyleMatch[]
  tokens?: TokenMatch[]
}

/** One layer's CSS, computed once per layer and only when a filter needs it. */
class LayerStyle {
  private css: CSSDeclarations | undefined
  constructor(
    private readonly graph: SceneGraph,
    readonly node: SceneNode
  ) {}

  get declarations(): CSSDeclarations {
    if (!this.css) {
      const parent = this.node.parentId ? this.graph.getNode(this.node.parentId) : undefined
      this.css = layerCSS(this.node, parent)
    }
    return this.css
  }

  /** The declared properties a binding of this field writes on this layer. */
  propertiesOfField(field: string): string[] {
    const root = bindingRootField(field)
    const declared = this.declarations
    return propertiesFor(this.node)
      .filter((family) => {
        const fields: readonly string[] = family.fields
        return fields.includes(root)
      })
      .flatMap((family) => family.properties)
      .filter((property) => Object.hasOwn(declared, property))
  }
}

function boundToProperty(
  graph: SceneGraph,
  node: SceneNode,
  property: string
): StyleMatch['variables'] {
  const fields = fieldsOwning([property])
  const bound = Object.entries(node.boundVariables).flatMap(([field, variableId]) => {
    const variable = fields.has(bindingRootField(field)) ? graph.variables.get(variableId) : null
    return variable ? [{ ...foundVariable(graph, variable), field }] : []
  })
  return bound.length > 0 ? bound : undefined
}

function styleMatches(
  graph: SceneGraph,
  layer: LayerStyle,
  style: NonNullable<FindQuery['style']>,
  tolerance: Tolerance
): StyleMatch[] {
  const declarations = layer.declarations
  const properties = style.property ? [style.property.trim()] : Object.keys(declarations)
  return properties.flatMap((property) => {
    const value = declaredValue(declarations, property)
    if (value === undefined) return []
    if (style.value !== undefined && !cssValueMatches(value, style.value, tolerance)) return []
    const variables = boundToProperty(graph, layer.node, property)
    const match: StyleMatch = { property, value }
    if (variables) match.variables = variables
    return [match]
  })
}

function boundTokenMatches(
  graph: SceneGraph,
  layer: LayerStyle,
  named: readonly Variable[],
  reaching: ReadonlySet<string>
): TokenMatch[] {
  const namedIds = new Set(named.map((variable) => variable.id))
  return bindingsTo(layer.node, reaching).flatMap(({ field, variableId }) => {
    const variable = graph.variables.get(variableId)
    if (!variable) return []
    const collection = graph.variableCollections.get(variable.collectionId)
    const modeId = graph.getNodeVariableModeId(layer.node.id, variable.collectionId)
    const match: TokenMatch = {
      field,
      properties: layer.propertiesOfField(field),
      value: formatVariableValue(graph.resolveVariable(variable.id, modeId)),
      variable: foundVariable(graph, variable),
      bound: true,
      mode: collection?.modes.find((mode) => mode.modeId === modeId)?.name ?? ''
    }
    if (!namedIds.has(variable.id)) match.throughAlias = true
    return [match]
  })
}

function unboundTokenMatches(
  graph: SceneGraph,
  layer: LayerStyle,
  named: readonly Variable[],
  tolerance: Tolerance
): TokenMatch[] {
  return named.flatMap((variable) => {
    const values = tokenValues(graph, variable)
    return unboundRawValues(layer.node, variable).flatMap((raw) => {
      const modes = values
        .filter((token) => rawValueEquals(raw.value, token.value, tolerance))
        .map((token) => token.mode)
      if (modes.length === 0) return []
      return [
        {
          field: raw.field,
          properties: layer.propertiesOfField(raw.field),
          value: formatVariableValue(raw.value),
          variable: foundVariable(graph, variable),
          bound: false,
          modes
        }
      ]
    })
  })
}

function tokenMatches(
  graph: SceneGraph,
  layer: LayerStyle,
  variables: NonNullable<FindQuery['variables']>,
  tolerance: Tolerance
): TokenMatch[] {
  const bound =
    variables.match === 'unbound'
      ? []
      : boundTokenMatches(graph, layer, variables.named, variables.reaching)
  const unbound =
    variables.match === 'bound' ? [] : unboundTokenMatches(graph, layer, variables.named, tolerance)
  return [...bound, ...unbound]
}

/** The layer as a result when it passes every filter of the query, else null. */
export function matchNode(
  graph: SceneGraph,
  node: SceneNode,
  page: SceneNode,
  query: FindQuery
): FoundNode | null {
  if (query.type && node.type !== query.type) return null
  if (query.name !== undefined && !textMatches(node.name, query.name)) return null
  if (query.text !== undefined && (node.type !== 'TEXT' || !textMatches(node.text, query.text)))
    return null

  const layer = new LayerStyle(graph, node)
  const styles = query.style ? styleMatches(graph, layer, query.style, query.tolerance) : undefined
  if (styles?.length === 0) return null
  const tokens = query.variables
    ? tokenMatches(graph, layer, query.variables, query.tolerance)
    : undefined
  if (tokens?.length === 0) return null

  const found: FoundNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    page: { id: page.id, name: page.name }
  }
  if (query.text !== undefined) found.text = node.text
  if (styles) found.styles = styles
  if (tokens) found.tokens = tokens
  return found
}
