import type { GUID } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import {
  PROTOTYPE_OPERATORS,
  type PrototypeAction,
  type PrototypeExpression,
  type PrototypeLiteral,
  type PrototypeOperator
} from '@kalka/scene-graph'

/**
 * Figma's variable actions (`SET_VARIABLE`, `SET_VARIABLE_MODE`, `CONDITIONAL`) and the
 * `VariableData` their values and conditions are written in, both ways. Variables, collections
 * and modes are named by the GUIDs of their records; library ones by their key until the
 * document pass resolves them (`prototypeVariableReferences`).
 */

type Obj = { [key: string]: unknown }

const MAX_DEPTH = 64

function isRecord(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function guidOf(value: unknown): string | null {
  if (!isRecord(value)) return null
  const { sessionID, localID } = value
  if (typeof sessionID !== 'number' || typeof localID !== 'number') return null
  if (sessionID === 4294967295 && localID === 4294967295) return null
  return guidToString({ sessionID, localID })
}

/** A `VariableID` or `VariableSetID`: `{ guid }` or a library `{ assetRef }`. */
function referenceOf(value: unknown): string | null {
  return isRecord(value) ? guidOf(value.guid) : null
}

const OPERATORS: ReadonlySet<string> = new Set(PROTOTYPE_OPERATORS)

function isOperator(value: unknown): value is PrototypeOperator {
  return typeof value === 'string' && OPERATORS.has(value)
}

/**
 * Figma's variable mode lookup, `VAR_MODE_LOOKUP` over a variable and the id of one of its
 * collection's modes as text (`accent[Dark]`): the variable read in that mode.
 */
function importModeLookup(args: unknown[]): PrototypeExpression | null {
  const [variable, mode] = args
  if (args.length !== 2 || !isRecord(variable) || !isRecord(mode)) return null
  const alias = isRecord(variable.value) ? referenceOf(variable.value.alias) : null
  const modeId = isRecord(mode.value) ? mode.value.textValue : undefined
  if (!alias || typeof modeId !== 'string' || modeId === '') return null
  return { type: 'VARIABLE', variableId: alias, modeId }
}

function importExpression(value: unknown, depth: number): PrototypeExpression | null {
  const expression = isRecord(value) ? value : {}
  if (expression.expressionFunction === 'VAR_MODE_LOOKUP')
    return importModeLookup(
      Array.isArray(expression.expressionArguments) ? expression.expressionArguments : []
    )
  const operator = expression.expressionFunction
  const operands = Array.isArray(expression.expressionArguments)
    ? expression.expressionArguments.map((argument) => importVariableData(argument, depth + 1))
    : []
  if (!isOperator(operator) || operands.some((operand) => operand === null)) return null
  return {
    type: 'EXPRESSION',
    operator,
    operands: operands.filter((operand): operand is PrototypeExpression => operand !== null)
  }
}

/** A `VariableData` as an expression; null for one Kalka does not evaluate. */
export function importVariableData(data: unknown, depth = 0): PrototypeExpression | null {
  if (!isRecord(data) || depth > MAX_DEPTH) return null
  const value = isRecord(data.value) ? data.value : {}
  const type = typeof data.dataType === 'string' ? data.dataType : data.resolvedDataType
  switch (type) {
    case 'BOOLEAN':
      return typeof value.boolValue === 'boolean' ? { type: 'VALUE', value: value.boolValue } : null
    case 'FLOAT':
      return typeof value.floatValue === 'number'
        ? { type: 'VALUE', value: Math.round(value.floatValue * 1e6) / 1e6 }
        : null
    case 'STRING':
      return typeof value.textValue === 'string' ? { type: 'VALUE', value: value.textValue } : null
    case 'COLOR': {
      const color = value.colorValue
      if (!isRecord(color)) return null
      const channel = (key: string, fallback: number) =>
        typeof color[key] === 'number' ? color[key] : fallback
      return {
        type: 'VALUE',
        value: { r: channel('r', 0), g: channel('g', 0), b: channel('b', 0), a: channel('a', 1) }
      }
    }
    case 'ALIAS': {
      const variableId = referenceOf(value.alias)
      return variableId ? { type: 'VARIABLE', variableId } : null
    }
    case 'EXPRESSION':
      return importExpression(value.expressionValue, depth)
    default:
      return null
  }
}

/** Where a variable action names a variable, collection or mode, written back. */
export interface VariableRefs {
  variable: (id: string) => Obj
  variableType: (id: string) => string | undefined
  collection: (id: string) => GUID | undefined
  mode: (id: string) => GUID | undefined
}

function literalData(value: PrototypeLiteral): Obj {
  if (typeof value === 'boolean')
    return { dataType: 'BOOLEAN', resolvedDataType: 'BOOLEAN', value: { boolValue: value } }
  if (typeof value === 'number')
    return { dataType: 'FLOAT', resolvedDataType: 'FLOAT', value: { floatValue: value } }
  if (typeof value === 'string')
    return { dataType: 'STRING', resolvedDataType: 'STRING', value: { textValue: value } }
  return { dataType: 'COLOR', resolvedDataType: 'COLOR', value: { colorValue: { ...value } } }
}

const BOOLEAN_OPERATORS: ReadonlySet<PrototypeOperator> = new Set([
  'EQUALS',
  'NOT_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'AND',
  'OR',
  'NOT',
  'IS_TRUTHY'
])

/** An expression as `VariableData`, with what it resolves to as Figma records it. */
export function exportVariableData(expression: PrototypeExpression, refs: VariableRefs): Obj {
  if (expression.type === 'VALUE') return literalData(expression.value)
  if (expression.type === 'VARIABLE') {
    const resolved = refs.variableType(expression.variableId)
    const alias = {
      dataType: 'ALIAS',
      ...(resolved ? { resolvedDataType: resolved } : {}),
      value: { alias: refs.variable(expression.variableId) }
    }
    const mode = expression.modeId ? refs.mode(expression.modeId) : undefined
    if (!mode) return alias
    return {
      dataType: 'EXPRESSION',
      ...(resolved ? { resolvedDataType: resolved } : {}),
      value: {
        expressionValue: {
          expressionFunction: 'VAR_MODE_LOOKUP',
          expressionArguments: [alias, literalData(guidToString(mode))]
        }
      }
    }
  }
  const operands = expression.operands.map((operand) => exportVariableData(operand, refs))
  let resolved: unknown = operands[0]?.resolvedDataType
  if (BOOLEAN_OPERATORS.has(expression.operator)) resolved = 'BOOLEAN'
  else if (expression.operator === 'STRINGIFY') resolved = 'STRING'
  else if (operands.some((operand) => operand.resolvedDataType === 'STRING')) resolved = 'STRING'
  return {
    dataType: 'EXPRESSION',
    ...(typeof resolved === 'string' ? { resolvedDataType: resolved } : {}),
    value: {
      expressionValue: { expressionFunction: expression.operator, expressionArguments: operands }
    }
  }
}

type VariableAction = Extract<
  PrototypeAction,
  { type: 'SET_VARIABLE' | 'SET_VARIABLE_MODE' | 'CONDITIONAL' }
>

/** A variable action of a `.fig` record; null for another kind or one Kalka cannot read. */
export function importVariableAction(
  action: Obj,
  importAction: (action: unknown) => PrototypeAction | null
): VariableAction | null {
  switch (action.connectionType) {
    case 'SET_VARIABLE': {
      const target = isRecord(action.targetVariable) ? action.targetVariable : {}
      const variableId = referenceOf(target.id) ?? guidOf(action.targetVariableID)
      const data = action.targetVariableData
      const value = data === undefined ? null : importVariableData(data)
      if (data !== undefined && value === null) return null
      return { type: 'SET_VARIABLE', variableId, value }
    }
    case 'SET_VARIABLE_MODE':
      return {
        type: 'SET_VARIABLE_MODE',
        collectionId: referenceOf(action.targetVariableSetID),
        modeId: guidOf(action.targetVariableModeID)
      }
    case 'CONDITIONAL': {
      const blocks = (Array.isArray(action.conditionalActions) ? action.conditionalActions : [])
        .filter(isRecord)
        .map((block) => ({
          condition: block.condition === undefined ? null : importVariableData(block.condition),
          hasCondition: block.condition !== undefined,
          actions: (Array.isArray(block.actions) ? block.actions : [])
            .map(importAction)
            .filter((item): item is PrototypeAction => item !== null)
        }))
      // A condition Kalka cannot evaluate would turn its block into an Else.
      if (blocks.some((block) => block.hasCondition && block.condition === null)) return null
      return {
        type: 'CONDITIONAL',
        blocks: blocks.map(({ condition, actions }) => ({ condition, actions }))
      }
    }
    default:
      return null
  }
}

/** A variable action written as Figma writes it; null when it names nothing to write. */
export function exportVariableAction(
  action: VariableAction,
  refs: VariableRefs,
  exportAction: (action: PrototypeAction) => Obj | null
): Obj | null {
  switch (action.type) {
    case 'SET_VARIABLE': {
      const fields: Obj = { connectionType: 'SET_VARIABLE' }
      if (action.variableId) fields.targetVariable = { id: refs.variable(action.variableId) }
      if (action.value) fields.targetVariableData = exportVariableData(action.value, refs)
      return fields
    }
    case 'SET_VARIABLE_MODE': {
      const fields: Obj = { connectionType: 'SET_VARIABLE_MODE' }
      const collection = action.collectionId ? refs.collection(action.collectionId) : undefined
      const mode = action.modeId ? refs.mode(action.modeId) : undefined
      if (collection) fields.targetVariableSetID = { guid: collection }
      if (mode) fields.targetVariableModeID = mode
      return fields
    }
    case 'CONDITIONAL':
      return {
        connectionType: 'CONDITIONAL',
        conditionalActions: action.blocks.map((block) => {
          const written: Obj = {
            actions: block.actions.map(exportAction).filter((item): item is Obj => item !== null)
          }
          if (block.condition) written.condition = exportVariableData(block.condition, refs)
          return written
        })
      }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

/** A `VariableID` or `VariableSetID` as records hold them. */
export interface VariableReference {
  guid?: GUID
  assetRef?: { key: string; version?: string }
}

function isReference(value: unknown): value is VariableReference {
  if (!isRecord(value)) return false
  const { assetRef } = value
  return assetRef === undefined || (isRecord(assetRef) && typeof assetRef.key === 'string')
}

/**
 * The variable and collection references of a record's interactions, each an object whose
 * `guid` a library reference (`assetRef`) is resolved into, as the document pass does for
 * bindings.
 */
export function prototypeVariableReferences(interactions: unknown): VariableReference[] {
  const found: VariableReference[] = []
  const push = (value: unknown): void => {
    if (isReference(value)) found.push(value)
  }
  const data = (value: unknown, depth: number): void => {
    if (!isRecord(value) || depth > MAX_DEPTH) return
    const inner = isRecord(value.value) ? value.value : {}
    push(inner.alias)
    const expression = isRecord(inner.expressionValue) ? inner.expressionValue : {}
    for (const argument of Array.isArray(expression.expressionArguments)
      ? expression.expressionArguments
      : [])
      data(argument, depth + 1)
  }
  const actions = (list: unknown, depth: number): void => {
    if (!Array.isArray(list) || depth > MAX_DEPTH) return
    for (const action of list.filter(isRecord)) {
      if (isRecord(action.targetVariable)) push(action.targetVariable.id)
      push(action.targetVariableSetID)
      data(action.targetVariableData, 0)
      for (const block of Array.isArray(action.conditionalActions)
        ? action.conditionalActions.filter(isRecord)
        : []) {
        data(block.condition, 0)
        actions(block.actions, depth + 1)
      }
    }
  }
  for (const interaction of Array.isArray(interactions) ? interactions.filter(isRecord) : [])
    actions(interaction.actions, 0)
  return found
}
