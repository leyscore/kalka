import { describe, expect, test } from 'bun:test'

import {
  evaluatePrototypeExpression,
  formatPrototypeExpression,
  parsePrototypeExpression,
  prototypeConditionHolds,
  type PrototypeExpression,
  type VariableValue
} from '@kalka/scene-graph'

const VARIABLES: Record<string, { name: string; value: VariableValue }> = {
  v1: { name: 'count', value: 2 },
  v2: { name: 'done', value: false },
  v3: { name: 'name', value: 'Ada' },
  v4: { name: 'Colors/Primary', value: { r: 1, g: 0, b: 0, a: 1 } },
  v5: { name: 'cart total', value: 10 }
}
const lookup = (name: string) =>
  Object.entries(VARIABLES).find(([, variable]) => variable.name === name)?.[0]
const read = (id: string) => VARIABLES[id]?.value
const nameOf = (id: string) => VARIABLES[id]?.name ?? id

function parsed(text: string): PrototypeExpression {
  const result = parsePrototypeExpression(text, lookup)
  if (!('expression' in result)) throw new Error(`did not parse ${text}`)
  return result.expression
}

describe('prototype expressions', () => {
  test('evaluate arithmetic, text joins, comparisons and logic as Figma does', () => {
    expect(evaluatePrototypeExpression(parsed('count + 1'), read)).toBe(3)
    expect(evaluatePrototypeExpression(parsed('(count + 1) * 2 - 1'), read)).toBe(5)
    expect(evaluatePrototypeExpression(parsed('"Hi " + name'), read)).toBe('Hi Ada')
    expect(evaluatePrototypeExpression(parsed('"Count: " + count'), read)).toBe('Count: 2')
    expect(evaluatePrototypeExpression(parsed('count >= 2 and not done'), read)).toBe(true)
    expect(evaluatePrototypeExpression(parsed('count < 2 || done'), read)).toBe(false)
    expect(evaluatePrototypeExpression(parsed('{Colors/Primary} == #FF0000'), read)).toBe(true)
    expect(evaluatePrototypeExpression(parsed('{cart total} / 4'), read)).toBe(2.5)
    expect(evaluatePrototypeExpression(parsed('-count'), read)).toBe(-2)
  })

  test('a division by zero or a missing variable has no value', () => {
    expect(evaluatePrototypeExpression(parsed('count / 0'), read)).toBeUndefined()
    expect(
      evaluatePrototypeExpression({ type: 'VARIABLE', variableId: 'missing' }, read)
    ).toBeUndefined()
    expect(prototypeConditionHolds({ type: 'VARIABLE', variableId: 'missing' }, read)).toBe(false)
    expect(prototypeConditionHolds(null, read)).toBe(true)
  })

  test('report what does not parse', () => {
    expect(parsePrototypeExpression('count +', lookup)).toEqual({ error: 'syntax' })
    expect(parsePrototypeExpression('total + 1', lookup)).toEqual({
      error: 'unknown',
      name: 'total'
    })
    expect(parsePrototypeExpression('"open', lookup)).toEqual({ error: 'syntax' })
  })

  test('format back to text that parses to the same expression', () => {
    for (const text of [
      'count + 1',
      '(count + 1) * 2',
      '"Hi " + name',
      'count >= 3 and not done',
      '{Colors/Primary} == #00FF00',
      '{cart total} - (count - 1)'
    ]) {
      const expression = parsed(text)
      const formatted = formatPrototypeExpression(expression, nameOf)
      expect(parsed(formatted)).toEqual(expression)
    }
    expect(formatPrototypeExpression(parsed('(count+1)*2'), nameOf)).toBe('(count + 1) * 2')
  })

  test('a mode in brackets reads the variable in that mode, as accent[Dark] does', () => {
    const modes: Record<string, string> = { light: 'Light', dark: 'Dark' }
    const lookupMode = (id: string, name: string) =>
      id === 'v4' ? Object.keys(modes).find((modeId) => modes[modeId] === name) : undefined
    const result = parsePrototypeExpression('{Colors/Primary}[Dark] == #000000', lookup, lookupMode)
    if (!('expression' in result)) throw new Error('did not parse')
    expect(result.expression).toEqual({
      type: 'EXPRESSION',
      operator: 'EQUALS',
      operands: [
        { type: 'VARIABLE', variableId: 'v4', modeId: 'dark' },
        { type: 'VALUE', value: { r: 0, g: 0, b: 0, a: 1 } }
      ]
    })
    const inModes = (id: string, modeId?: string) =>
      modeId === 'dark' ? { r: 0, g: 0, b: 0, a: 1 } : read(id)
    expect(evaluatePrototypeExpression(result.expression, inModes)).toBe(true)
    const formatted = formatPrototypeExpression(result.expression, nameOf, (_, id) => modes[id])
    expect(formatted).toBe('Colors/Primary[Dark] == #000000')
    expect(parsePrototypeExpression(formatted, lookup, lookupMode)).toEqual(result)
    expect(parsePrototypeExpression('{Colors/Primary}[Dim]', lookup, lookupMode)).toEqual({
      error: 'unknown',
      name: 'Colors/Primary[Dim]'
    })
    expect(parsePrototypeExpression('[Dark]', lookup, lookupMode)).toEqual({ error: 'syntax' })
  })
})
