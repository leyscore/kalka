import type { Color } from './primitives'
import type { VariableValue } from './types'

/**
 * Prototype variables, as Figma's advanced prototyping uses them: an action sets a variable to a
 * value or an expression, sets a collection's mode, or runs other actions when a condition holds.
 * Expressions read the document's variables (`VARIABLE`) and combine them with Figma's operators.
 */

/** A value an expression holds as it is. */
export type PrototypeLiteral = Color | number | string | boolean

/** Figma's expression functions that a prototype can evaluate. */
export const PROTOTYPE_OPERATORS = [
  'ADDITION',
  'SUBTRACTION',
  'MULTIPLY',
  'DIVIDE',
  'EQUALS',
  'NOT_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'AND',
  'OR',
  'NOT',
  'NEGATE',
  'STRINGIFY',
  'IS_TRUTHY'
] as const
export type PrototypeOperator = (typeof PROTOTYPE_OPERATORS)[number]

/** The operators that take one operand. */
export const UNARY_PROTOTYPE_OPERATORS: ReadonlySet<PrototypeOperator> = new Set([
  'NOT',
  'NEGATE',
  'STRINGIFY',
  'IS_TRUTHY'
])

export type PrototypeExpression =
  | { type: 'VALUE'; value: PrototypeLiteral }
  | { type: 'VARIABLE'; variableId: string }
  | { type: 'EXPRESSION'; operator: PrototypeOperator; operands: PrototypeExpression[] }

/** If a condition holds (or always, for Else, a null condition), run the actions. */
export interface PrototypeConditionalBlock<Action> {
  condition: PrototypeExpression | null
  actions: Action[]
}

export function isPrototypeLiteral(value: VariableValue | undefined): value is PrototypeLiteral {
  if (value === undefined) return false
  if (typeof value !== 'object') return true
  return 'r' in value && 'g' in value && 'b' in value
}

function truthy(value: PrototypeLiteral | undefined): boolean {
  if (value === undefined) return false
  if (typeof value === 'object') return true
  return Boolean(value)
}

function sameValue(a: PrototypeLiteral, b: PrototypeLiteral): boolean {
  if (typeof a === 'object' && typeof b === 'object')
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
  return a === b
}

function stringify(value: PrototypeLiteral): string {
  if (typeof value !== 'object') return String(value)
  const hex = (channel: number) =>
    Math.round(Math.min(1, Math.max(0, channel)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(value.r)}${hex(value.g)}${hex(value.b)}`.toUpperCase()
}

function numeric(value: PrototypeLiteral): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)))
    return Number(value)
  return undefined
}

function arithmetic(
  operator: 'ADDITION' | 'SUBTRACTION' | 'MULTIPLY' | 'DIVIDE',
  a: PrototypeLiteral,
  b: PrototypeLiteral
): PrototypeLiteral | undefined {
  // Figma joins text with +, as `"Count: " + count`.
  if (operator === 'ADDITION' && (typeof a === 'string' || typeof b === 'string'))
    return stringify(a) + stringify(b)
  const x = numeric(a)
  const y = numeric(b)
  if (x === undefined || y === undefined) return undefined
  if (operator === 'ADDITION') return x + y
  if (operator === 'SUBTRACTION') return x - y
  if (operator === 'MULTIPLY') return x * y
  return y === 0 ? undefined : x / y
}

function compare(
  operator: 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL',
  a: PrototypeLiteral,
  b: PrototypeLiteral
): boolean | undefined {
  const x = numeric(a)
  const y = numeric(b)
  if (x === undefined || y === undefined) return undefined
  if (operator === 'LESS_THAN') return x < y
  if (operator === 'LESS_THAN_OR_EQUAL') return x <= y
  if (operator === 'GREATER_THAN') return x > y
  return x >= y
}

/** The operators that take one operand, and AND and OR, which take any number. */
function logical(
  operator: PrototypeOperator,
  values: (PrototypeLiteral | undefined)[]
): PrototypeLiteral | undefined {
  const [a] = values
  switch (operator) {
    case 'NOT':
      return !truthy(a)
    case 'IS_TRUTHY':
      return truthy(a)
    case 'NEGATE': {
      const x = a === undefined ? undefined : numeric(a)
      return x === undefined ? undefined : -x
    }
    case 'STRINGIFY':
      return a === undefined ? undefined : stringify(a)
    case 'AND':
      return values.length > 0 && values.every(truthy)
    default:
      return values.some(truthy)
  }
}

/**
 * The value of an expression, reading each variable through `read`; undefined when it reads a
 * variable that has no value or combines values that do not go together.
 */
export function evaluatePrototypeExpression(
  expression: PrototypeExpression,
  read: (variableId: string) => VariableValue | undefined
): PrototypeLiteral | undefined {
  if (expression.type === 'VALUE') return expression.value
  if (expression.type === 'VARIABLE') {
    const value = read(expression.variableId)
    return isPrototypeLiteral(value) ? value : undefined
  }
  const values = expression.operands.map((operand) => evaluatePrototypeExpression(operand, read))
  const { operator } = expression
  if (UNARY_PROTOTYPE_OPERATORS.has(operator) || operator === 'AND' || operator === 'OR')
    return logical(operator, values)
  const [a, b] = values
  if (a === undefined || b === undefined) return undefined
  switch (operator) {
    case 'EQUALS':
      return sameValue(a, b)
    case 'NOT_EQUAL':
      return !sameValue(a, b)
    case 'ADDITION':
    case 'SUBTRACTION':
    case 'MULTIPLY':
    case 'DIVIDE':
      return arithmetic(operator, a, b)
    case 'LESS_THAN':
    case 'LESS_THAN_OR_EQUAL':
    case 'GREATER_THAN':
    case 'GREATER_THAN_OR_EQUAL':
      return compare(operator, a, b)
    default:
      return undefined
  }
}

/** Whether a condition holds; an Else block, with no condition, always does. */
export function prototypeConditionHolds(
  condition: PrototypeExpression | null,
  read: (variableId: string) => VariableValue | undefined
): boolean {
  return condition === null || truthy(evaluatePrototypeExpression(condition, read))
}

/** The variables an expression reads. */
export function expressionVariables(expression: PrototypeExpression | null): string[] {
  if (!expression) return []
  if (expression.type === 'VARIABLE') return [expression.variableId]
  if (expression.type === 'VALUE') return []
  return expression.operands.flatMap(expressionVariables)
}
