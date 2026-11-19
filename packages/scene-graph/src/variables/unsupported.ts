import { compact } from 'es-toolkit/array'

import type { VariableUnsupportedExpression, VariableValue } from '../types'

/** Whether a value is an imported expression Kalka keeps without evaluating it. */
export function isUnsupportedVariableValue(
  value: VariableValue | undefined
): value is VariableUnsupportedExpression {
  return typeof value === 'object' && 'expression' in value
}

/** The variables a value refers to: its alias, or the known aliases of a kept expression. */
export function variableValueReferences(value: VariableValue): string[] {
  if (isUnsupportedVariableValue(value)) return compact(value.references)
  if (typeof value === 'object' && 'aliasId' in value) return [value.aliasId]
  return []
}

/** A copy of a value with its variable and mode references mapped, for another document. */
export function mapVariableValueReferences(
  value: VariableValue,
  variable: (id: string) => string,
  mode: (id: string) => string = (id) => id
): VariableValue {
  if (isUnsupportedVariableValue(value))
    return {
      ...structuredClone(value),
      references: value.references.map((id) => (id === null ? null : variable(id))),
      modes: value.modes.map(mode)
    }
  if (typeof value === 'object' && 'aliasId' in value) return { aliasId: variable(value.aliasId) }
  return structuredClone(value)
}
