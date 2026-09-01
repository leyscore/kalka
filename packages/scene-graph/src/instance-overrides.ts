export type InstanceOverrideField = string

export interface InstanceOverrideState {
  self: Map<InstanceOverrideField, unknown>
  descendants: Map<string, Map<InstanceOverrideField, unknown>>
}

export function createInstanceOverrideState(): InstanceOverrideState {
  return { self: new Map(), descendants: new Map() }
}

export interface SerializedInstanceOverrideState {
  self: Array<[InstanceOverrideField, unknown]>
  descendants: Array<[string, Array<[InstanceOverrideField, unknown]>]>
}

export function serializeInstanceOverrideState(
  state: InstanceOverrideState
): SerializedInstanceOverrideState {
  return {
    self: [...state.self],
    descendants: [...state.descendants].map(([nodeId, fields]) => [nodeId, [...fields]])
  }
}

export function deserializeInstanceOverrideState(
  state: SerializedInstanceOverrideState | undefined
): InstanceOverrideState {
  if (!state || !Array.isArray(state.self) || !Array.isArray(state.descendants)) {
    return createInstanceOverrideState()
  }
  return {
    self: new Map(state.self),
    descendants: new Map(state.descendants.map(([nodeId, fields]) => [nodeId, new Map(fields)]))
  }
}

export function cloneInstanceOverrideState(state: InstanceOverrideState): InstanceOverrideState {
  return {
    self: new Map([...state.self].map(([field, value]) => [field, structuredClone(value)])),
    descendants: new Map(
      [...state.descendants].map(([id, fields]) => [
        id,
        new Map([...fields].map(([field, value]) => [field, structuredClone(value)]))
      ])
    )
  }
}

export function getInstanceOverride(
  state: InstanceOverrideState,
  instanceId: string,
  nodeId: string,
  field: InstanceOverrideField
): unknown {
  return nodeId === instanceId ? state.self.get(field) : state.descendants.get(nodeId)?.get(field)
}

export function hasInstanceOverride(
  state: InstanceOverrideState,
  instanceId: string,
  nodeId: string,
  field: InstanceOverrideField
): boolean {
  const fields = nodeId === instanceId ? state.self : state.descendants.get(nodeId)
  return fields?.has(field) ?? false
}

export function setInstanceOverride(
  state: InstanceOverrideState,
  instanceId: string,
  nodeId: string,
  field: InstanceOverrideField,
  value: unknown = true
): void {
  if (nodeId === instanceId) {
    state.self.set(field, value)
    return
  }
  const fields = state.descendants.get(nodeId) ?? new Map<string, unknown>()
  fields.set(field, value)
  state.descendants.set(nodeId, fields)
}

export function deleteInstanceOverride(
  state: InstanceOverrideState,
  instanceId: string,
  nodeId: string,
  field: InstanceOverrideField
): boolean {
  const fields = nodeId === instanceId ? state.self : state.descendants.get(nodeId)
  if (!fields?.delete(field)) return false
  if (nodeId !== instanceId && fields.size === 0) state.descendants.delete(nodeId)
  return true
}

export function clearInstanceOverrides(state: InstanceOverrideState): void {
  state.self.clear()
  state.descendants.clear()
}

export function forEachInstanceOverride(
  state: InstanceOverrideState,
  callback: (nodeId: string, field: InstanceOverrideField, value: unknown) => void
): void {
  for (const [field, value] of state.self) callback('', field, value)
  for (const [nodeId, fields] of state.descendants) {
    for (const [field, value] of fields) callback(nodeId, field, value)
  }
}
