import { isEqualWith } from 'es-toolkit/predicate'

import type { SceneGraph, Variable, VariableCollection } from '../'
import type { LayerChangeKind } from './layers'

/**
 * What changed between two states of a document's variables, as Figma's branch review lists
 * them next to layers: the collections and variables added, removed or changed, matched by ID.
 * A variable added or removed with its collection counts in the collection's change.
 */

export type VariableEntity = 'collection' | 'variable'

export interface VariableChange {
  id: string
  entity: VariableEntity
  kind: LayerChangeKind
  name: string
  /** The collection a variable belongs to, by name; a collection's own name for a collection. */
  collection: string
  /** The fields that differ on a changed one; empty for one added or removed. */
  fields: string[]
  /** Variables added or removed with an added or removed collection. */
  descendants: number
}

/** Fields not compared: the ID, and a collection's variable list, which its variables follow. */
const UNCOMPARED: ReadonlySet<string> = new Set(['id', 'variableIds'])

/** Half the step a colour channel loses through CSS, as layers compare numbers. */
const NUMBER_TOLERANCE = 1 / 510

const sameValue = (a: unknown, b: unknown) =>
  typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= NUMBER_TOLERANCE : undefined

function changedFields<T extends object>(before: T, after: T): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  return [...keys].filter(
    (key) =>
      !UNCOMPARED.has(key) &&
      !isEqualWith(Reflect.get(before, key), Reflect.get(after, key), sameValue)
  )
}

function collectionName(graph: SceneGraph, variable: Variable): string {
  return graph.variableCollections.get(variable.collectionId)?.name ?? ''
}

function collectionChange(
  collection: VariableCollection,
  kind: LayerChangeKind,
  fields: string[] = []
): VariableChange {
  return {
    id: collection.id,
    entity: 'collection',
    kind,
    name: collection.name,
    collection: collection.name,
    fields,
    descendants: kind === 'changed' ? 0 : collection.variableIds.length
  }
}

/** The collections, then the variables, that differ between `before` and `after`. */
export function diffVariables(before: SceneGraph, after: SceneGraph): VariableChange[] {
  const changes: VariableChange[] = []
  for (const collection of after.variableCollections.values()) {
    const previous = before.variableCollections.get(collection.id)
    if (!previous) changes.push(collectionChange(collection, 'added'))
    else {
      const fields = changedFields(previous, collection)
      if (fields.length > 0) changes.push(collectionChange(collection, 'changed', fields))
    }
  }
  for (const collection of before.variableCollections.values()) {
    if (!after.variableCollections.has(collection.id))
      changes.push(collectionChange(collection, 'removed'))
  }
  const variable = (
    graph: SceneGraph,
    entry: Variable,
    kind: LayerChangeKind,
    fields: string[] = []
  ): VariableChange => ({
    id: entry.id,
    entity: 'variable',
    kind,
    name: entry.name,
    collection: collectionName(graph, entry),
    fields,
    descendants: 0
  })
  for (const entry of after.variables.values()) {
    const previous = before.variables.get(entry.id)
    if (!previous) {
      // One added with its collection is counted in that collection's change.
      if (before.variableCollections.has(entry.collectionId))
        changes.push(variable(after, entry, 'added'))
      continue
    }
    const fields = changedFields(previous, entry)
    if (fields.length > 0) changes.push(variable(after, entry, 'changed', fields))
  }
  for (const entry of before.variables.values()) {
    if (after.variables.has(entry.id)) continue
    if (after.variableCollections.has(entry.collectionId))
      changes.push(variable(before, entry, 'removed'))
  }
  return changes
}

function copyVariablesOf(target: SceneGraph, from: SceneGraph, collectionId: string): void {
  for (const id of from.variableCollections.get(collectionId)?.variableIds ?? []) {
    const entry = from.variables.get(id)
    if (entry && !target.variables.has(id)) target.addVariable(structuredClone(entry))
  }
}

function applyCollection(target: SceneGraph, from: SceneGraph, change: VariableChange): boolean {
  if (change.kind === 'removed') {
    target.removeCollection(change.id)
    return true
  }
  const collection = from.variableCollections.get(change.id)
  if (!collection) return false
  const existing = target.variableCollections.get(change.id)
  if (change.kind === 'added') {
    if (existing) return false
    target.addCollection({ ...structuredClone(collection), variableIds: [] })
    copyVariablesOf(target, from, change.id)
    return true
  }
  if (!existing) return false
  for (const field of change.fields) {
    if (field in collection)
      Reflect.set(existing, field, structuredClone(Reflect.get(collection, field)))
    else Reflect.deleteProperty(existing, field)
  }
  if (!existing.modes.some((mode) => mode.modeId === target.getActiveModeId(existing.id)))
    target.setActiveMode(existing.id, existing.defaultModeId)
  return true
}

/** Puts a variable at the place it has among its collection's variables in `from`. */
function placeVariable(target: SceneGraph, from: SceneGraph, entry: Variable): void {
  const collection = target.variableCollections.get(entry.collectionId)
  if (!collection) return
  const order = from.variableCollections.get(entry.collectionId)?.variableIds ?? []
  const others = collection.variableIds.filter((id) => id !== entry.id)
  let index = 0
  for (let at = order.indexOf(entry.id) - 1; at >= 0; at--) {
    const placed = others.indexOf(order[at] ?? '')
    if (placed !== -1) {
      index = placed + 1
      break
    }
  }
  collection.variableIds = [...others.slice(0, index), entry.id, ...others.slice(index)]
}

function applyVariable(target: SceneGraph, from: SceneGraph, change: VariableChange): boolean {
  if (change.kind === 'removed') {
    target.removeVariable(change.id)
    return true
  }
  const entry = from.variables.get(change.id)
  if (!entry || !target.variableCollections.has(entry.collectionId)) return false
  const existing = target.variables.get(change.id)
  if (change.kind === 'added' && existing) return false
  if (change.kind === 'changed' && !existing) return false
  if (existing && existing.collectionId !== entry.collectionId) {
    const previous = target.variableCollections.get(existing.collectionId)
    if (previous) previous.variableIds = previous.variableIds.filter((id) => id !== change.id)
  }
  target.variables.set(change.id, structuredClone(entry))
  placeVariable(target, from, entry)
  return true
}

/**
 * Applies the chosen variable changes of `from` to `target`: collections first, so a variable
 * added to a collection added too finds it. Returns the IDs of those it could not place, such as
 * a variable added to a collection the target removed.
 */
export function applyVariableChanges(
  target: SceneGraph,
  from: SceneGraph,
  changes: readonly VariableChange[]
): string[] {
  const skipped: string[] = []
  const collections = changes.filter((change) => change.entity === 'collection')
  const variables = changes.filter((change) => change.entity === 'variable')
  for (const change of collections)
    if (!applyCollection(target, from, change)) skipped.push(change.id)
  for (const change of variables) if (!applyVariable(target, from, change)) skipped.push(change.id)
  return skipped
}
