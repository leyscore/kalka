import {
  collectionPluginDataNodeChange,
  parseGuidOrNull,
  variableAlias,
  variableMetadataNodeChange
} from '@kalka/fig/node-change'
import type { GUID, NodeChange, VariableDataEntry } from '@kalka/kiwi/fig/codec'
import { guidToString, stringToGuid } from '@kalka/kiwi/fig/guid'
import {
  modesDefaultFirst,
  type SceneGraph,
  type SceneNode,
  type VariableCollectionMode,
  type VariableValue
} from '@kalka/scene-graph'
import { fractionalPosition, orderKeyBetween } from '@kalka/scene-graph/order-keys'

import { safeColor } from '#core/kiwi/fig/node-change/serialize'

/**
 * Identity allocation shared by the two writers. The document exporter and the clipboard
 * both emit variables, modes and shared styles ahead of the nodes that reference them; when
 * each allocated its own way the two drifted.
 */
export function assignVariableGuid(
  id: string,
  localIdCounter: { value: number },
  assignedGuidValues: Set<string>,
  nodeSourceGuidValues: Set<string>,
  keepsGuid: (id: string) => boolean = () => true
): GUID {
  if (
    keepsGuid(id) &&
    /^\d+:\d+$/.test(id) &&
    !assignedGuidValues.has(id) &&
    !nodeSourceGuidValues.has(id)
  ) {
    const guid = stringToGuid(id)
    assignedGuidValues.add(id)
    return guid
  }
  const guid = { sessionID: 0, localID: localIdCounter.value++ }
  assignedGuidValues.add(`${guid.sessionID}:${guid.localID}`)
  return guid
}

export function assignVariableGuids(
  graph: SceneGraph,
  localIdCounter: { value: number },
  varIdToGuid: Map<string, GUID>,
  modeIdToGuid: Map<string, GUID>,
  assignedGuidValues: Set<string>,
  nodeSourceGuidValues: Set<string>,
  keepsGuid?: (id: string) => boolean
): void {
  for (const [colId, col] of graph.variableCollections) {
    const colGuid = assignVariableGuid(
      colId,
      localIdCounter,
      assignedGuidValues,
      nodeSourceGuidValues,
      keepsGuid
    )
    varIdToGuid.set(colId, colGuid)
    for (const mode of col.modes) {
      const modeGuid = assignVariableGuid(
        mode.modeId,
        localIdCounter,
        assignedGuidValues,
        nodeSourceGuidValues,
        keepsGuid
      )
      modeIdToGuid.set(mode.modeId, modeGuid)
    }
    for (const varId of col.variableIds) {
      const varGuid = assignVariableGuid(
        varId,
        localIdCounter,
        assignedGuidValues,
        nodeSourceGuidValues,
        keepsGuid
      )
      varIdToGuid.set(varId, varGuid)
    }
  }
}

/**
 * Where Figma lists each mode: where the file saved it, and a new mode after the rest. A
 * collection made in Kalka lists its modes in their order.
 */
function modeSortPositions(modes: readonly VariableCollectionMode[]) {
  if (modes.every((mode) => !mode.sortPosition))
    return modes.map((mode, index) => ({ mode, sortPosition: fractionalPosition(index) }))
  let last = modes.reduce<string | null>(
    (highest, mode) =>
      mode.sortPosition && (!highest || mode.sortPosition > highest) ? mode.sortPosition : highest,
    null
  )
  return modes.map((mode) => {
    if (mode.sortPosition) return { mode, sortPosition: mode.sortPosition }
    last = orderKeyBetween(last, null)
    return { mode, sortPosition: last }
  })
}

/**
 * Shared styles live on the internal canvas and need a GUID before any node cites them. A style
 * read from Figma keeps the GUID it came with, which its ID spells; the others take new ones.
 */
export function assignSharedStyleGuids(
  styles: readonly SceneNode[],
  localIdCounter: { value: number },
  nodeIdToGuid: Map<string, GUID>,
  assignedGuidValues: Set<string>
): void {
  for (const style of styles) {
    if (nodeIdToGuid.has(style.id)) continue
    // A style read from Figma keeps its GUID, compared in the form the ID parses to.
    const imported = style.source.id ? parseGuidOrNull(style.source.id) : null
    const value = imported ? guidToString(imported) : null
    if (imported && value && !assignedGuidValues.has(value)) {
      nodeIdToGuid.set(style.id, imported)
      assignedGuidValues.add(value)
      continue
    }
    let guid: GUID
    do {
      guid = { sessionID: 1, localID: localIdCounter.value++ }
    } while (assignedGuidValues.has(`${guid.sessionID}:${guid.localID}`))
    nodeIdToGuid.set(style.id, guid)
    assignedGuidValues.add(`${guid.sessionID}:${guid.localID}`)
  }
}

function variableValueToKiwi(
  graph: SceneGraph,
  value: VariableValue,
  type: string,
  ids: Map<string, GUID>
): VariableDataEntry {
  if (typeof value === 'object' && 'aliasId' in value)
    return {
      value: { alias: variableAlias(graph, value.aliasId, ids) },
      dataType: 'ALIAS',
      resolvedDataType: type
    }
  if (type === 'COLOR' && typeof value === 'object' && 'r' in value)
    return { value: { colorValue: safeColor(value) }, dataType: type, resolvedDataType: type }
  if (type === 'BOOLEAN')
    return { value: { boolValue: !!value }, dataType: type, resolvedDataType: type }
  if (type === 'STRING')
    return {
      value: { textValue: typeof value === 'string' ? value : JSON.stringify(value) },
      dataType: type,
      resolvedDataType: type
    }
  return { value: { floatValue: Number(value) }, dataType: 'FLOAT', resolvedDataType: 'FLOAT' }
}

/**
 * Order keys for one parent, in call order. Collections, variables, shared styles and the
 * canvas's own layers all append to the internal canvas, so they share one sequence rather
 * than each numbering from zero and handing siblings the same key.
 */
export function sequentialPositions(start = 0): () => string {
  let index = start
  return () => fractionalPosition(index++)
}

export function appendVariableNodeChanges(
  graph: SceneGraph,
  changes: NodeChange[],
  parent: GUID,
  ids: Map<string, GUID>,
  modes: Map<string, GUID>,
  nextPosition: () => string = sequentialPositions()
): void {
  const modeKey = (modeId: string) => guidToString(modes.get(modeId) ?? stringToGuid(modeId))
  for (const collection of graph.variableCollections.values()) {
    const guid = ids.get(collection.id) ?? stringToGuid(collection.id)
    changes.push({
      guid,
      parentIndex: { guid: parent, position: nextPosition() },
      type: 'VARIABLE_SET',
      name: collection.name,
      phase: 'CREATED',
      strokeAlign: 'CENTER',
      strokeJoin: 'BEVEL',
      variableSetModes: modeSortPositions(modesDefaultFirst(collection)).map(
        ({ mode, sortPosition }) => ({
          id: modes.get(mode.modeId) ?? stringToGuid(mode.modeId),
          name: mode.name,
          sortPosition
        })
      ),
      pluginData: collectionPluginDataNodeChange(collection, modeKey),
      key: collection.key
    })
    for (const id of collection.variableIds) {
      const variable = graph.variables.get(id)
      if (!variable) continue
      changes.push({
        guid: ids.get(id) ?? stringToGuid(id),
        parentIndex: { guid: parent, position: nextPosition() },
        type: 'VARIABLE',
        name: variable.name,
        phase: 'CREATED',
        strokeAlign: 'CENTER',
        strokeJoin: 'BEVEL',
        variableSetID: { guid },
        variableResolvedType: variable.type,
        variableDataValues: {
          entries: Object.entries(variable.valuesByMode).map(([mode, value]) => ({
            modeID: modes.get(mode) ?? stringToGuid(mode),
            variableData: variableValueToKiwi(graph, value, variable.type, ids)
          }))
        },
        ...variableMetadataNodeChange(variable, modeKey),
        key: variable.key,
        version: variable.version
      })
    }
  }
}
