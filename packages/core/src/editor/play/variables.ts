import {
  evaluatePrototypeExpression,
  prototypeConditionHolds,
  reconcileVariableBindings,
  type PrototypeAction,
  type PrototypeExpression,
  type PrototypeLiteral,
  type SceneGraph,
  type VariableType,
  type VariableValue
} from '@kalka/scene-graph'

/**
 * Prototype variables while presenting, as Figma plays them: set variable actions give variables
 * values for the rest of the presentation, set variable mode actions show a collection in another
 * mode, and conditionals run the actions of the first block whose condition holds. The document's
 * variables are never changed; each presented frame is drawn with these values instead.
 */
export interface PresentVariables {
  /** Values set while presenting, by variable id; they hold in every mode. */
  values: Record<string, PrototypeLiteral>
  /** Modes chosen while presenting, by collection id. */
  modes: Record<string, string>
}

export const NO_PRESENT_VARIABLES: PresentVariables = { values: {}, modes: {} }

export function hasPresentVariables(variables: PresentVariables | undefined): boolean {
  return (
    !!variables &&
    (Object.keys(variables.values).length > 0 || Object.keys(variables.modes).length > 0)
  )
}

/**
 * A variable's value while presenting, at a layer (whose modes it reads) or in the collection's
 * active mode: the value set while presenting, else its value in the mode chosen while
 * presenting or the layer's mode, aliases followed.
 */
export function presentVariableValue(
  graph: SceneGraph,
  variables: PresentVariables,
  variableId: string,
  nodeId?: string,
  seen: Set<string> = new Set()
): VariableValue | undefined {
  if (seen.has(variableId)) return undefined
  seen.add(variableId)
  if (Object.hasOwn(variables.values, variableId)) return variables.values[variableId]
  const variable = graph.variables.get(variableId)
  if (!variable) return undefined
  const collection = graph.variableCollections.get(variable.collectionId)
  const modeId =
    variables.modes[variable.collectionId] ??
    (nodeId
      ? graph.getNodeVariableModeId(nodeId, variable.collectionId)
      : graph.getActiveModeId(variable.collectionId))
  const value =
    variable.valuesByMode[modeId] ??
    (collection ? variable.valuesByMode[collection.defaultModeId] : undefined) ??
    Object.values(variable.valuesByMode)[0]
  if (value && typeof value === 'object' && 'aliasId' in value)
    return presentVariableValue(graph, variables, value.aliasId, nodeId, seen)
  return value
}

/** The literal a variable of a type can hold for a computed value, as Figma converts it. */
function fitted(type: VariableType, value: PrototypeLiteral): PrototypeLiteral | undefined {
  switch (type) {
    case 'FLOAT':
      if (typeof value === 'number') return value
      if (typeof value === 'boolean') return value ? 1 : 0
      return typeof value === 'string' && Number.isFinite(Number(value)) && value.trim() !== ''
        ? Number(value)
        : undefined
    case 'BOOLEAN':
      return typeof value === 'boolean' ? value : undefined
    case 'STRING':
      return typeof value === 'object' ? undefined : String(value)
    case 'COLOR':
      return typeof value === 'object' ? value : undefined
    default:
      return undefined
  }
}

/** Evaluates an expression with the presentation's variables, read at a layer. */
export function evaluatePresentExpression(
  graph: SceneGraph,
  variables: PresentVariables,
  expression: PrototypeExpression,
  nodeId?: string
): PrototypeLiteral | undefined {
  return evaluatePrototypeExpression(expression, (id) =>
    presentVariableValue(graph, variables, id, nodeId)
  )
}

/**
 * Runs a variable action: the variables after it, or null when it changes nothing (no variable
 * or mode picked, or a value the variable cannot hold).
 */
export function runVariableAction(
  graph: SceneGraph,
  variables: PresentVariables,
  action: Extract<PrototypeAction, { type: 'SET_VARIABLE' | 'SET_VARIABLE_MODE' }>,
  nodeId?: string
): PresentVariables | null {
  if (action.type === 'SET_VARIABLE_MODE') {
    const collection = action.collectionId
      ? graph.variableCollections.get(action.collectionId)
      : undefined
    if (!collection || !collection.modes.some((mode) => mode.modeId === action.modeId)) return null
    return { ...variables, modes: { ...variables.modes, [collection.id]: action.modeId ?? '' } }
  }
  const variable = action.variableId ? graph.variables.get(action.variableId) : undefined
  if (!variable || !action.value) return null
  const computed = evaluatePresentExpression(graph, variables, action.value, nodeId)
  const value = computed === undefined ? undefined : fitted(variable.type, computed)
  if (value === undefined) return null
  return { ...variables, values: { ...variables.values, [variable.id]: value } }
}

/** The actions a conditional runs: those of its first block whose condition holds. */
export function conditionalActions(
  graph: SceneGraph,
  variables: PresentVariables,
  action: Extract<PrototypeAction, { type: 'CONDITIONAL' }>,
  nodeId?: string
): PrototypeAction[] {
  const read = (id: string) => presentVariableValue(graph, variables, id, nodeId)
  return (
    action.blocks.find((block) => prototypeConditionHolds(block.condition, read))?.actions ?? []
  )
}

/**
 * Draws a private play graph with the presentation's variables: values set while presenting
 * hold in every mode, modes chosen apply from the frame `rootId` down (modes its layers choose
 * still win), and the layers bound to them take their values, which it returns. The graph may
 * share its variables with the document, so they are copied before any is changed.
 */
export function applyPresentVariables(
  graph: SceneGraph,
  rootId: string,
  variables: PresentVariables
): string[] {
  if (!hasPresentVariables(variables)) return []
  graph.variables = new Map(graph.variables)
  for (const [id, value] of Object.entries(variables.values)) {
    const variable = graph.variables.get(id)
    if (!variable) continue
    const valuesByMode: Record<string, VariableValue> = {}
    for (const modeId of Object.keys(variable.valuesByMode)) valuesByMode[modeId] = value
    graph.variables.set(id, { ...variable, valuesByMode })
  }
  const root = graph.getNode(rootId)
  if (root && Object.keys(variables.modes).length > 0)
    graph.updateNode(rootId, { variableModes: { ...root.variableModes, ...variables.modes } })
  return reconcileVariableBindings(graph, { subtrees: [rootId] })
}
