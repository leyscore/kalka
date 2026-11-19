import { sortBy } from 'es-toolkit/array'

import type { NodeChange, VariableDataValuesEntry } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import type { SceneGraph, VariableValue } from '@kalka/scene-graph'

import { extractPluginData } from '../node-change/plugin-data'
import { readVariableMetadata } from '../node-change/variable/metadata'
import {
  readModeAttribute,
  readModeConditions,
  readVariableToken,
  withoutTokenPluginData
} from '../node-change/variable/token'
import {
  mapUnsupportedExpressionReferences,
  unsupportedExpressionData
} from '../node-change/variable/unsupported'
import { createResourceResolver } from './resource-reference'

function valueOf(
  entry: VariableDataValuesEntry,
  resolve: ReturnType<typeof createResourceResolver>
): VariableValue {
  const { value, dataType, resolvedDataType } = entry.variableData
  if (!value) throw new Error('Missing variable value')
  if (dataType === 'EXPRESSION') return keptExpression(entry, resolve)
  const type = dataType ?? resolvedDataType
  if (type === 'ALIAS') {
    const aliasId = resolve(value.alias)
    if (!aliasId) throw new Error('Unresolved variable alias')
    return { aliasId }
  }
  if (type === 'COLOR' && value.colorValue) return structuredClone(value.colorValue)
  if (type === 'BOOLEAN' && value.boolValue !== undefined) return value.boolValue
  if (type === 'STRING' && value.textValue !== undefined) return value.textValue
  if (type === 'FLOAT' && value.floatValue !== undefined) return value.floatValue
  throw new Error(`Unsupported variable value ${type}`)
}

/**
 * An expression Kalka does not evaluate, such as Figma's `VAR_MODE_LOOKUP`, kept as the file wrote
 * it: the variable resolves to nothing, so layers keep the values the file saved, and a save
 * writes the expression back.
 */
function keptExpression(
  entry: VariableDataValuesEntry,
  resolve: ReturnType<typeof createResourceResolver>
): VariableValue {
  const data = unsupportedExpressionData(entry.variableData)
  const references: (string | null)[] = []
  const modes: string[] = []
  mapUnsupportedExpressionReferences(
    data,
    (reference) => {
      references.push(resolve(reference) ?? null)
      return undefined
    },
    (guid) => {
      modes.push(guidToString(guid))
      return guid
    }
  )
  return {
    expression: 'UNSUPPORTED',
    function: data.value?.expressionValue?.expressionFunction ?? '',
    value: { ...data },
    references,
    modes
  }
}

function modeValues(
  resource: NodeChange,
  modes: readonly string[],
  resolve: ReturnType<typeof createResourceResolver>
): Record<string, VariableValue> {
  const entries = resource.variableDataValues?.entries ?? []
  if (!entries.length) throw new Error('Missing mode values')
  const values: Record<string, VariableValue> = {}
  for (const entry of entries) {
    const modeId = guidToString(entry.modeID)
    if (!modes.includes(modeId)) throw new Error('Unknown mode')
    values[modeId] = valueOf(entry, resolve)
  }
  return values
}

type SavedMode = NonNullable<NodeChange['variableSetModes']>[number]

/** Figma lists modes by `sortPosition` and takes the first as default; unpositioned modes follow. */
function modesInListedOrder(resource: NodeChange): SavedMode[] {
  return sortBy(resource.variableSetModes ?? [], [
    (mode) => !mode.sortPosition,
    (mode) => mode.sortPosition ?? ''
  ])
}

/** No invented values or fallback collections: unsupported resources remain explicit. */
export function materializeVariableResources(
  graph: SceneGraph,
  resources: readonly NodeChange[],
  onUnsupported?: (resource: NodeChange) => void
): void {
  const report = (resource: NodeChange, reason: string): void => {
    if (!onUnsupported) throw new Error(`Unsupported document resource ${resource.type}: ${reason}`)
    onUnsupported(structuredClone(resource))
  }
  for (const resource of resources) {
    if (resource.type !== 'VARIABLE_SET') continue
    const modes = modesInListedOrder(resource)
    if (!resource.guid || modes.length === 0) {
      report(resource, 'missing collection identity or modes')
      continue
    }
    const pluginData = withoutTokenPluginData(extractPluginData(resource))
    const conditions = readModeConditions(resource)
    graph.addCollection({
      id: guidToString(resource.guid),
      name: resource.name ?? 'Variables',
      modes: modes.map((mode) => {
        const modeId = guidToString(mode.id)
        return {
          modeId,
          name: mode.name,
          condition: conditions[modeId],
          ...(mode.sortPosition ? { sortPosition: mode.sortPosition } : {})
        }
      }),
      defaultModeId: guidToString(modes[0].id),
      variableIds: [],
      modeAttribute: readModeAttribute(resource),
      pluginData: pluginData.length > 0 ? pluginData : undefined,
      key: typeof resource.key === 'string' ? resource.key : undefined,
      version: typeof resource.version === 'string' ? resource.version : undefined
    })
  }
  addVariables(graph, resources, report)
}

function addVariables(
  graph: SceneGraph,
  resources: readonly NodeChange[],
  report: (resource: NodeChange, reason: string) => void
): void {
  const resolve = createResourceResolver(resources)
  for (const resource of resources) {
    if (resource.type !== 'VARIABLE') continue
    const type = resource.variableResolvedType
    const collectionId = resource.variableSetID
      ? resolve(resource.variableSetID)
      : resource.parentIndex?.guid && guidToString(resource.parentIndex.guid)
    const collection = collectionId && graph.variableCollections.get(collectionId)
    if (
      !resource.guid ||
      !collection ||
      !collectionId ||
      (type !== 'COLOR' && type !== 'BOOLEAN' && type !== 'STRING' && type !== 'FLOAT')
    ) {
      report(resource, 'unresolved collection, identity or type')
      continue
    }
    const valuesByMode: Record<string, VariableValue> = {}
    try {
      Object.assign(
        valuesByMode,
        modeValues(
          resource,
          collection.modes.map((mode) => mode.modeId),
          resolve
        )
      )
    } catch (error) {
      report(resource, error instanceof Error ? error.message : 'Invalid mode value')
      continue
    }
    const metadata = readVariableMetadata(resource)
    graph.addVariable({
      id: guidToString(resource.guid),
      name: resource.name ?? 'Variable',
      type,
      collectionId,
      valuesByMode,
      ...metadata,
      ...readVariableToken(resource, valuesByMode)
    })
  }
}
