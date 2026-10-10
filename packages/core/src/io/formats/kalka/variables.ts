import type {
  SceneGraph,
  TokenExpression,
  Variable,
  VariableCollection,
  VariableType
} from '@open-pencil/scene-graph'

import {
  decodeVariableToken,
  type DecodedValue,
  type DecodedVariable
} from '#core/io/formats/design-tokens/decode'
import type {
  DesignTokenBundle,
  ReadCollection,
  ReadToken
} from '#core/io/formats/design-tokens/read'
import { trimNumber } from '#core/io/formats/design-tokens/values'

import type { SavedCollection, SavedVariable } from './project'
import { decodeValue, encodeValue, sameAsWritten, type JSONValue } from './values'

/** Variable fields `project.json` ties to tokens by name rather than saving as props. */
const VARIABLE_IDENTITY = ['id', 'name', 'collectionId'] as const
/** Collection fields `project.json` saves in its own members rather than as props. */
const COLLECTION_IDENTITY = [
  'id',
  'name',
  'modes',
  'defaultModeId',
  'variableIds',
  'modeAttribute'
] as const

/** Saved collections and the props of the variables and collections their tokens lack. */
type PropsOf = (entry: { props?: Record<string, unknown> }) => Record<string, unknown> | undefined

interface PendingAlias {
  variable: Variable
  modeId: string
  value: Extract<DecodedValue, { kind: 'alias' }>
}

function isDecoded(value: unknown): value is DecodedVariable {
  return typeof value === 'object' && value !== null
}

class VariableReader {
  private readonly byPath = new Map<string, Map<string, string>>()
  private readonly pending: PendingAlias[] = []
  private readonly claimed = new Set<SavedCollection>()
  /** Variables whose tokens are aliases without a type, which take their target's. */
  private readonly untyped = new Set<Variable>()

  constructor(
    private readonly graph: SceneGraph,
    private readonly saved: readonly SavedCollection[]
  ) {}

  read(bundle: DesignTokenBundle): void {
    for (const collection of this.saved) this.addSavedCollection(collection)
    for (const read of bundle.collections) this.readCollection(read)
    for (const alias of this.pending) this.resolveAlias(alias)
  }

  private addSavedCollection(saved: SavedCollection): void {
    const collection: VariableCollection = {
      id: saved.id,
      name: saved.name,
      modes: saved.modes.map((mode) =>
        mode.condition === undefined
          ? { modeId: mode.id, name: mode.name }
          : { modeId: mode.id, name: mode.name, condition: mode.condition }
      ),
      defaultModeId: saved.defaultMode,
      variableIds: []
    }
    if (saved.modeAttribute !== undefined) collection.modeAttribute = saved.modeAttribute
    this.graph.addCollection(collection)
  }

  /** The collection a set of tokens fills: the saved one of that name, or a new one. */
  private targetCollection(read: ReadCollection): {
    collection: VariableCollection
    saved: SavedCollection | undefined
  } {
    const saved = this.saved.find((entry) => entry.name === read.name && !this.claimed.has(entry))
    const existing = saved && this.graph.variableCollections.get(saved.id)
    if (saved && existing) {
      this.claimed.add(saved)
      return { collection: existing, saved }
    }
    const collection = this.graph.createCollection(read.name)
    if (read.modeAttribute) collection.modeAttribute = read.modeAttribute
    return { collection, saved: undefined }
  }

  /** Mode ids by the bundle's mode order; a mode the collection lacks is added. */
  private modeIds(read: ReadCollection, collection: VariableCollection, isNew: boolean): string[] {
    const ids = read.modes.map((mode, index) => {
      const existing = collection.modes.find((entry) => entry.name === mode.name)
      if (existing) return existing.modeId
      if (isNew && index === 0) {
        this.graph.renameMode(collection.id, collection.defaultModeId, mode.name)
        return collection.defaultModeId
      }
      return this.graph.createMode(collection.id, mode.name) ?? ''
    })
    if (isNew) {
      read.modes.forEach((mode, index) => {
        const entry = collection.modes.find((candidate) => candidate.modeId === ids[index])
        if (entry && mode.condition) entry.condition = mode.condition
        if (mode.isDefault) collection.defaultModeId = ids[index]
      })
    }
    return ids
  }

  private readCollection(read: ReadCollection): void {
    const { collection, saved } = this.targetCollection(read)
    const modeIds = this.modeIds(read, collection, !saved)
    const tokens = new Map<string, { name: string; byMode: Array<ReadToken | undefined> }>()
    read.modes.forEach((mode, index) => {
      for (const token of mode.tokens) {
        const key = token.path.join('.')
        const entry = tokens.get(key) ?? { name: token.name, byMode: [] }
        entry.byMode[index] = token
        tokens.set(key, entry)
      }
    })
    const paths = this.byPath.get(collection.name) ?? new Map<string, string>()
    this.byPath.set(collection.name, paths)
    const claimed = new Set<string>()
    for (const [key, entry] of tokens) {
      const decoded = entry.byMode.map((token) => (token ? decodeVariableToken(token) : undefined))
      const first = decoded.find(isDecoded)
      if (!first) continue
      const savedVariable = saved?.variables.find(
        (candidate) => candidate.name === entry.name && !claimed.has(candidate.id)
      )
      if (savedVariable) claimed.add(savedVariable.id)
      const variable = this.addVariable(collection, entry.name, first, savedVariable)
      if (first.type === undefined) this.untyped.add(variable)
      paths.set(key, variable.id)
      decoded.forEach((value, index) => {
        if (isDecoded(value)) this.setValue(variable, modeIds[index], value)
      })
    }
  }

  private addVariable(
    collection: VariableCollection,
    name: string,
    first: DecodedVariable,
    saved: SavedVariable | undefined
  ): Variable {
    const type: VariableType = first.type ?? 'STRING'
    const fields: Pick<Variable, 'description' | 'hiddenFromPublishing'> &
      Partial<Pick<Variable, 'unit' | 'scopes' | 'codeSyntax'>> = {
      description: first.description ?? '',
      hiddenFromPublishing: first.hiddenFromPublishing ?? false
    }
    if (first.unit !== undefined) fields.unit = first.unit
    if (first.scopes !== undefined) fields.scopes = first.scopes
    if (first.codeSyntax !== undefined) fields.codeSyntax = first.codeSyntax
    if (saved && !this.graph.variables.has(saved.id)) {
      const variable: Variable = {
        id: saved.id,
        name,
        type,
        collectionId: collection.id,
        valuesByMode: {},
        ...fields
      }
      this.graph.addVariable(variable)
      return variable
    }
    const variable = this.graph.createVariable(name, type, collection.id)
    variable.valuesByMode = {}
    Object.assign(variable, fields)
    return variable
  }

  private setValue(variable: Variable, modeId: string, decoded: DecodedVariable): void {
    if (decoded.value.kind === 'alias') {
      this.pending.push({ variable, modeId, value: decoded.value })
      return
    }
    const value = decoded.value.value
    variable.valuesByMode[modeId] = value
    if (decoded.expression !== undefined && typeof value === 'number') {
      const expression: TokenExpression = { css: decoded.expression, resolved: value }
      variable.expressions = { ...variable.expressions, [modeId]: expression }
    }
  }

  private resolveAlias({ variable, modeId, value }: PendingAlias): void {
    const key = value.path.join('.')
    const own = this.graph.variableCollections.get(variable.collectionId)
    let targetId: string | undefined
    if (value.collection !== undefined && value.name !== undefined) {
      const collection = [...this.graph.variableCollections.values()].find(
        (candidate) => candidate.name === value.collection
      )
      targetId = collection?.variableIds.find(
        (id) => this.graph.variables.get(id)?.name === value.name
      )
    }
    targetId ??= own ? this.byPath.get(own.name)?.get(key) : undefined
    targetId ??= [...this.byPath.values()].map((paths) => paths.get(key)).find(Boolean)
    if (!targetId) return
    variable.valuesByMode[modeId] = { aliasId: targetId }
    const target = this.graph.variables.get(targetId)
    if (target && this.untyped.delete(variable)) variable.type = target.type
  }
}

/** Collections in the order they were saved, their variables in the order they were saved. */
function restoreOrder(graph: SceneGraph, saved: readonly SavedCollection[]): void {
  const collections = [...graph.variableCollections.values()]
  const position = new Map(saved.map((entry, index) => [entry.id, index]))
  collections.sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity))
  graph.variableCollections.clear()
  for (const collection of collections) graph.variableCollections.set(collection.id, collection)
  for (const entry of saved) {
    const collection = graph.variableCollections.get(entry.id)
    if (!collection) continue
    const order = new Map(entry.variables.map((variable, index) => [variable.id, index]))
    collection.variableIds.sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity))
  }
  const variables = new Map(graph.variables)
  graph.variables.clear()
  for (const collection of graph.variableCollections.values())
    for (const id of collection.variableIds) {
      const variable = variables.get(id)
      if (variable) graph.variables.set(id, variable)
    }
  for (const [id, variable] of variables)
    if (!graph.variables.has(id)) graph.variables.set(id, variable)
}

/** Applies saved props, and adds variables the tokens did not hold from theirs. */
function applySavedProps(
  graph: SceneGraph,
  saved: readonly SavedCollection[],
  propsOf: PropsOf
): void {
  for (const entry of saved) {
    const collection = graph.variableCollections.get(entry.id)
    const collectionProps = propsOf(entry)
    if (collection && collectionProps) Object.assign(collection, collectionProps)
    for (const savedVariable of entry.variables) {
      const props = propsOf(savedVariable)
      const existing = graph.variables.get(savedVariable.id)
      if (existing) {
        if (props) Object.assign(existing, props)
        continue
      }
      if (!collection || !props) continue
      graph.addVariable({
        id: savedVariable.id,
        name: savedVariable.name,
        collectionId: entry.id,
        type: 'STRING',
        valuesByMode: {},
        description: '',
        hiddenFromPublishing: false,
        ...props
      })
    }
  }
}

/**
 * Builds the document's variables from `tokens.json`, with the ids, order, and fields tokens
 * cannot hold from `project.json`. A token or collection `project.json` does not know becomes a
 * new variable, so tokens added by hand open too.
 */
export function readVariables(
  graph: SceneGraph,
  bundle: DesignTokenBundle,
  saved: readonly SavedCollection[],
  propsOf: PropsOf = (entry) => entry.props && decodeProps(entry.props)
): void {
  new VariableReader(graph, saved).read(bundle)
  applySavedProps(graph, saved, propsOf)
  restoreOrder(graph, saved)
}

function decodeProps(props: Record<string, unknown>): Record<string, unknown> {
  const decoded = decodeValue(props)
  return typeof decoded === 'object' && decoded !== null && !Array.isArray(decoded)
    ? Object.fromEntries(Object.entries(decoded))
    : {}
}

/** Token values match when they agree to the six decimals tokens are written with. */
function sameTokenValue(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return trimNumber(a) === trimNumber(b)
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((value, index) => sameTokenValue(value, b[index]))
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    return [...keys].every((key) => {
      const left: unknown = Reflect.get(a, key)
      const right: unknown = Reflect.get(b, key)
      return sameTokenValue(left, right)
    })
  }
  return a === b
}

function differences(
  original: object,
  read: object | undefined,
  skip: readonly string[]
): Record<string, unknown> | undefined {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(original)) {
    if (skip.includes(key)) continue
    const readValue: unknown = read ? Reflect.get(read, key) : undefined
    const same =
      key === 'valuesByMode' || key === 'expressions'
        ? sameTokenValue(value, readValue)
        : sameAsWritten(value, readValue)
    if (!same) props[key] = value
  }
  return Object.keys(props).length > 0 ? props : undefined
}

function encodedProps(props: Record<string, unknown> | undefined) {
  if (!props) return undefined
  const encoded: JSONValue = encodeValue(props)
  return typeof encoded === 'object' && encoded !== null && !Array.isArray(encoded)
    ? encoded
    : undefined
}

/**
 * `project.json`'s record of the variables: each collection's ids, modes, and variable ids by
 * name, and the fields reading `tokens.json` back does not give, found by reading it back.
 */
export function savedCollections(
  graph: SceneGraph,
  bundle: DesignTokenBundle,
  scratch: SceneGraph
): SavedCollection[] {
  const identities: SavedCollection[] = [...graph.variableCollections.values()].map(
    (collection) => {
      const saved: SavedCollection = {
        id: collection.id,
        name: collection.name,
        defaultMode: collection.defaultModeId,
        modes: collection.modes.map((mode) =>
          mode.condition === undefined
            ? { id: mode.modeId, name: mode.name }
            : { id: mode.modeId, name: mode.name, condition: mode.condition }
        ),
        variables: collection.variableIds.flatMap((id) => {
          const variable = graph.variables.get(id)
          return variable ? [{ id, name: variable.name }] : []
        })
      }
      if (collection.modeAttribute !== undefined) saved.modeAttribute = collection.modeAttribute
      return saved
    }
  )
  readVariables(scratch, bundle, identities, () => undefined)
  return identities.map((saved) => {
    const original = graph.variableCollections.get(saved.id)
    const read = scratch.variableCollections.get(saved.id)
    const props = original && encodedProps(differences(original, read, COLLECTION_IDENTITY))
    if (props) saved.props = props
    for (const variable of saved.variables) {
      const own = graph.variables.get(variable.id)
      const variableProps =
        own && encodedProps(differences(own, scratch.variables.get(variable.id), VARIABLE_IDENTITY))
      if (variableProps) variable.props = variableProps
    }
    return saved
  })
}
