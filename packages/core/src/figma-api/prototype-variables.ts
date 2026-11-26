import * as v from 'valibot'

import type {
  PrototypeAction,
  PrototypeExpression,
  PrototypeLiteral,
  PrototypeOperator
} from '@kalka/scene-graph'

/**
 * The Plugin API's variable actions (`SET_VARIABLE`, `SET_VARIABLE_MODE`, `CONDITIONAL`) and its
 * `VariableData`, as the scene graph keeps them. Figma names multiplication and division
 * `MULTIPLICATION` and `DIVISION` here, where `.fig` files say `MULTIPLY` and `DIVIDE`.
 */

const FUNCTIONS: readonly (readonly [PrototypeOperator, string])[] = [
  ['ADDITION', 'ADDITION'],
  ['SUBTRACTION', 'SUBTRACTION'],
  ['MULTIPLY', 'MULTIPLICATION'],
  ['DIVIDE', 'DIVISION'],
  ['EQUALS', 'EQUALS'],
  ['NOT_EQUAL', 'NOT_EQUAL'],
  ['LESS_THAN', 'LESS_THAN'],
  ['LESS_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL'],
  ['GREATER_THAN', 'GREATER_THAN'],
  ['GREATER_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL'],
  ['AND', 'AND'],
  ['OR', 'OR'],
  ['NOT', 'NOT'],
  ['NEGATE', 'NEGATE']
]
const FUNCTION_OF = new Map<PrototypeOperator, string>(FUNCTIONS)
const OPERATOR_OF = new Map<string, PrototypeOperator>(
  FUNCTIONS.map(([operator, name]) => [name, operator])
)

const color = v.object({ r: v.number(), g: v.number(), b: v.number(), a: v.optional(v.number()) })

type VariableData = {
  type?: string
  resolvedType?: string
  value?: unknown
}
const variableDataSchema: v.GenericSchema<VariableData> = v.object({
  type: v.optional(v.string()),
  resolvedType: v.optional(v.string()),
  value: v.optional(v.unknown())
})

const expressionSchema = v.object({
  expressionFunction: v.string(),
  expressionArguments: v.array(v.unknown())
})

function literalFromFigma(value: unknown): PrototypeLiteral | null {
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string')
    return value
  const parsed = v.safeParse(color, value)
  return parsed.success ? { ...parsed.output, a: parsed.output.a ?? 1 } : null
}

/** `VAR_MODE_LOOKUP` over a variable alias and a mode id: the variable read in that mode. */
function modeLookupFromFigma(args: unknown[], depth: number): PrototypeExpression {
  const message = 'A variable mode lookup needs a variable alias and a mode id'
  if (args.length !== 2) throw new Error(message)
  const [variable, mode] = args.map((argument) => variableDataFromFigma(argument, depth + 1))
  if (variable.type !== 'VARIABLE' || mode.type !== 'VALUE' || typeof mode.value !== 'string')
    throw new Error(message)
  return { type: 'VARIABLE', variableId: variable.variableId, modeId: mode.value }
}

/** A `VariableData` given to the Plugin API as an expression; throws for one Kalka cannot play. */
export function variableDataFromFigma(value: unknown, depth = 0): PrototypeExpression {
  if (depth > 64) throw new Error('The expression is nested too deeply')
  const parsed = v.safeParse(variableDataSchema, value)
  if (!parsed.success) throw new Error('A variable value needs a type and a value')
  const data = parsed.output
  if (data.type === 'VARIABLE_ALIAS') {
    const alias = v.safeParse(v.object({ id: v.string() }), data.value)
    if (!alias.success) throw new Error('A variable alias needs an id')
    return { type: 'VARIABLE', variableId: alias.output.id }
  }
  if (data.type === 'EXPRESSION') {
    const expression = v.safeParse(expressionSchema, data.value)
    if (!expression.success) throw new Error('An expression needs a function and its arguments')
    if (expression.output.expressionFunction === 'VAR_MODE_LOOKUP')
      return modeLookupFromFigma(expression.output.expressionArguments, depth)
    const operator = OPERATOR_OF.get(expression.output.expressionFunction)
    if (!operator)
      throw new Error(`Kalka does not play ${expression.output.expressionFunction} expressions yet`)
    return {
      type: 'EXPRESSION',
      operator,
      operands: expression.output.expressionArguments.map((argument) =>
        variableDataFromFigma(argument, depth + 1)
      )
    }
  }
  const literal = literalFromFigma(data.value)
  if (literal === null) throw new Error('A variable value needs a value')
  return { type: 'VALUE', value: literal }
}

function literalType(value: PrototypeLiteral): string {
  if (typeof value === 'boolean') return 'BOOLEAN'
  if (typeof value === 'number') return 'FLOAT'
  if (typeof value === 'string') return 'STRING'
  return 'COLOR'
}

const BOOLEAN_RESULTS: ReadonlySet<PrototypeOperator> = new Set([
  'EQUALS',
  'NOT_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'AND',
  'OR',
  'NOT'
])

/** An expression in the Plugin API's `VariableData` shape. */
export function variableDataToFigma(expression: PrototypeExpression): VariableData {
  if (expression.type === 'VALUE') {
    const type = literalType(expression.value)
    const value = typeof expression.value === 'object' ? { ...expression.value } : expression.value
    return { type, resolvedType: type, value }
  }
  if (expression.type === 'VARIABLE') {
    const alias: VariableData = {
      type: 'VARIABLE_ALIAS',
      value: { type: 'VARIABLE_ALIAS', id: expression.variableId }
    }
    if (!expression.modeId) return alias
    const mode: VariableData = { type: 'STRING', resolvedType: 'STRING', value: expression.modeId }
    return {
      type: 'EXPRESSION',
      value: { expressionFunction: 'VAR_MODE_LOOKUP', expressionArguments: [alias, mode] }
    }
  }
  return {
    type: 'EXPRESSION',
    ...(BOOLEAN_RESULTS.has(expression.operator) ? { resolvedType: 'BOOLEAN' } : {}),
    value: {
      expressionFunction: FUNCTION_OF.get(expression.operator) ?? expression.operator,
      expressionArguments: expression.operands.map(variableDataToFigma)
    }
  }
}

const variableActionSchema = v.variant('type', [
  v.object({
    type: v.literal('SET_VARIABLE'),
    variableId: v.nullable(v.string()),
    variableValue: v.optional(v.unknown())
  }),
  v.object({
    type: v.literal('SET_VARIABLE_MODE'),
    variableCollectionId: v.nullable(v.string()),
    variableModeId: v.nullable(v.string())
  }),
  v.object({
    type: v.literal('CONDITIONAL'),
    conditionalBlocks: v.array(
      v.object({ condition: v.optional(v.unknown()), actions: v.array(v.unknown()) })
    )
  })
])

/** A variable action given to the Plugin API; null for another kind of action. */
export function variableActionFromFigma(
  value: unknown,
  actionFromFigma: (value: unknown) => PrototypeAction
): PrototypeAction | null {
  const parsed = v.safeParse(variableActionSchema, value)
  if (!parsed.success) return null
  const action = parsed.output
  switch (action.type) {
    case 'SET_VARIABLE':
      return {
        type: 'SET_VARIABLE',
        variableId: action.variableId,
        value:
          action.variableValue === undefined ? null : variableDataFromFigma(action.variableValue)
      }
    case 'SET_VARIABLE_MODE':
      return {
        type: 'SET_VARIABLE_MODE',
        collectionId: action.variableCollectionId,
        modeId: action.variableModeId
      }
    case 'CONDITIONAL':
      return {
        type: 'CONDITIONAL',
        blocks: action.conditionalBlocks.map((block) => ({
          condition: block.condition === undefined ? null : variableDataFromFigma(block.condition),
          actions: block.actions.map(actionFromFigma)
        }))
      }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

/** A variable action in the Plugin API's shape. */
export function variableActionToFigma(
  action: Extract<PrototypeAction, { type: 'SET_VARIABLE' | 'SET_VARIABLE_MODE' | 'CONDITIONAL' }>,
  actionToFigma: (action: PrototypeAction) => unknown
) {
  switch (action.type) {
    case 'SET_VARIABLE':
      return {
        type: action.type,
        variableId: action.variableId,
        ...(action.value ? { variableValue: variableDataToFigma(action.value) } : {})
      }
    case 'SET_VARIABLE_MODE':
      return {
        type: action.type,
        variableCollectionId: action.collectionId,
        variableModeId: action.modeId
      }
    case 'CONDITIONAL':
      return {
        type: action.type,
        conditionalBlocks: action.blocks.map((block) => ({
          ...(block.condition ? { condition: variableDataToFigma(block.condition) } : {}),
          actions: block.actions.map(actionToFigma)
        }))
      }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}
