import type { Color } from './primitives'
import type { PrototypeExpression, PrototypeOperator } from './prototype-variables'

/**
 * Prototype expressions written as text, as Figma's expression field takes them:
 * `count + 1`, `"Hi " + name`, `count >= 3 and not done`. Variables go by name, or in braces
 * for any name (`{Colors/Primary}`); values are numbers, `"text"`, `true`, `false` and `#RRGGBB`.
 */

export type ExpressionParseResult =
  | { expression: PrototypeExpression }
  | { error: 'syntax' }
  | { error: 'unknown'; name: string }

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'color'; value: Color }
  | { kind: 'name'; value: string; braced: boolean }
  | { kind: 'op'; value: string }

const BARE_NAME = /^[\p{L}_][\p{L}\p{N}_/.]*$/u
const NAME_CHAR = /[\p{L}\p{N}_/.]/u
const OPERATORS = [
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '=',
  '<',
  '>',
  '+',
  '-',
  '*',
  '/',
  '!',
  '(',
  ')'
]

function hexColor(text: string): Color | null {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(text)
  if (!match) return null
  const channel = (at: number) => Number.parseInt(match[1].slice(at, at + 2), 16) / 255
  return {
    r: channel(0),
    g: channel(2),
    b: channel(4),
    a: match[2] ? Number.parseInt(match[2], 16) / 255 : 1
  }
}

function operatorAt(text: string, at: number): string | undefined {
  return OPERATORS.find((candidate) => text.startsWith(candidate, at))
}

function tokenize(text: string): Token[] | null {
  const tokens: Token[] = []
  let at = 0
  while (at < text.length) {
    const char = text[at]
    if (/\s/.test(char)) {
      at++
      continue
    }
    if (char === '"' || char === "'") {
      const end = text.indexOf(char, at + 1)
      if (end === -1) return null
      tokens.push({ kind: 'string', value: text.slice(at + 1, end) })
      at = end + 1
      continue
    }
    if (char === '{') {
      const end = text.indexOf('}', at + 1)
      if (end === -1) return null
      tokens.push({ kind: 'name', value: text.slice(at + 1, end).trim(), braced: true })
      at = end + 1
      continue
    }
    if (char === '#') {
      const match = /^#[0-9a-f]{6}(?:[0-9a-f]{2})?/i.exec(text.slice(at))
      const color = match ? hexColor(match[0]) : null
      if (!match || !color) return null
      tokens.push({ kind: 'color', value: color })
      at += match[0].length
      continue
    }
    const number = /^\d+(?:\.\d+)?|^\.\d+/.exec(text.slice(at))
    if (number) {
      tokens.push({ kind: 'number', value: Number(number[0]) })
      at += number[0].length
      continue
    }
    const operator = operatorAt(text, at)
    if (operator) {
      tokens.push({ kind: 'op', value: operator })
      at += operator.length
      continue
    }
    if (NAME_CHAR.test(char)) {
      let end = at
      while (end < text.length && NAME_CHAR.test(text[end])) end++
      tokens.push({ kind: 'name', value: text.slice(at, end), braced: false })
      at = end
      continue
    }
    return null
  }
  return tokens
}

class ParseError extends Error {
  constructor(readonly unknown?: string) {
    super(unknown ? `No variable ${unknown}` : 'Syntax error')
    this.name = 'ParseError'
  }
}

const COMPARISONS: Readonly<Record<string, PrototypeOperator>> = {
  '==': 'EQUALS',
  '=': 'EQUALS',
  '!=': 'NOT_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL'
}

/** Parses an expression, finding each variable by name through `lookup`. */
export function parsePrototypeExpression(
  text: string,
  lookup: (name: string) => string | undefined
): ExpressionParseResult {
  const tokens = tokenize(text)
  if (!tokens || tokens.length === 0) return { error: 'syntax' }
  let at = 0
  const peek = (): Token | undefined => tokens[at]
  const isOp = (...values: string[]) => {
    const token = peek()
    return token?.kind === 'op' && values.includes(token.value)
  }
  const isWord = (...values: string[]) => {
    const token = peek()
    return token?.kind === 'name' && !token.braced && values.includes(token.value.toLowerCase())
  }
  const binary = (
    operator: PrototypeOperator,
    a: PrototypeExpression,
    b: PrototypeExpression
  ): PrototypeExpression => ({ type: 'EXPRESSION', operator, operands: [a, b] })

  const primary = (): PrototypeExpression => {
    const token = tokens[at++]
    if (!token) throw new ParseError()
    if (token.kind === 'number' || token.kind === 'string' || token.kind === 'color')
      return { type: 'VALUE', value: token.value }
    if (token.kind === 'op') {
      if (token.value !== '(') throw new ParseError()
      const inner = or()
      if (!isOp(')')) throw new ParseError()
      at++
      return inner
    }
    if (!token.braced && (token.value === 'true' || token.value === 'false'))
      return { type: 'VALUE', value: token.value === 'true' }
    const variableId = lookup(token.value)
    if (!variableId) throw new ParseError(token.value)
    return { type: 'VARIABLE', variableId }
  }
  const unary = (): PrototypeExpression => {
    if (isOp('-')) {
      at++
      return { type: 'EXPRESSION', operator: 'NEGATE', operands: [unary()] }
    }
    return primary()
  }
  const product = (): PrototypeExpression => {
    let left = unary()
    while (isOp('*', '/')) {
      const token = tokens[at++]
      left = binary(
        token.kind === 'op' && token.value === '*' ? 'MULTIPLY' : 'DIVIDE',
        left,
        unary()
      )
    }
    return left
  }
  const sum = (): PrototypeExpression => {
    let left = product()
    while (isOp('+', '-')) {
      const token = tokens[at++]
      left = binary(
        token.kind === 'op' && token.value === '+' ? 'ADDITION' : 'SUBTRACTION',
        left,
        product()
      )
    }
    return left
  }
  const comparison = (): PrototypeExpression => {
    const left = sum()
    const token = peek()
    if (token?.kind === 'op' && COMPARISONS[token.value]) {
      at++
      return binary(COMPARISONS[token.value], left, sum())
    }
    return left
  }
  const not = (): PrototypeExpression => {
    if (isOp('!') || isWord('not')) {
      at++
      return { type: 'EXPRESSION', operator: 'NOT', operands: [not()] }
    }
    return comparison()
  }
  const and = (): PrototypeExpression => {
    let left = not()
    while (isOp('&&') || isWord('and')) {
      at++
      left = binary('AND', left, not())
    }
    return left
  }
  function or(): PrototypeExpression {
    let left = and()
    while (isOp('||') || isWord('or')) {
      at++
      left = binary('OR', left, and())
    }
    return left
  }

  try {
    const expression = or()
    if (at < tokens.length) return { error: 'syntax' }
    return { expression }
  } catch (error) {
    if (error instanceof ParseError && error.unknown)
      return { error: 'unknown', name: error.unknown }
    return { error: 'syntax' }
  }
}

const PRECEDENCE: Readonly<Record<PrototypeOperator, number>> = {
  OR: 1,
  AND: 2,
  NOT: 3,
  EQUALS: 4,
  NOT_EQUAL: 4,
  LESS_THAN: 4,
  LESS_THAN_OR_EQUAL: 4,
  GREATER_THAN: 4,
  GREATER_THAN_OR_EQUAL: 4,
  ADDITION: 5,
  SUBTRACTION: 5,
  MULTIPLY: 6,
  DIVIDE: 6,
  NEGATE: 7,
  STRINGIFY: 8,
  IS_TRUTHY: 8
}

const SYMBOLS: Readonly<Partial<Record<PrototypeOperator, string>>> = {
  OR: 'or',
  AND: 'and',
  EQUALS: '==',
  NOT_EQUAL: '!=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
  ADDITION: '+',
  SUBTRACTION: '-',
  MULTIPLY: '*',
  DIVIDE: '/'
}

function hex(value: Color): string {
  const channel = (c: number) =>
    Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16)
      .padStart(2, '0')
  const alpha = value.a < 1 ? channel(value.a) : ''
  return `#${channel(value.r)}${channel(value.g)}${channel(value.b)}${alpha}`.toUpperCase()
}

/** An expression as text that parses back to it, naming each variable through `nameOf`. */
export function formatPrototypeExpression(
  expression: PrototypeExpression,
  nameOf: (variableId: string) => string
): string {
  const format = (node: PrototypeExpression, parent: number): string => {
    if (node.type === 'VALUE') {
      const { value } = node
      if (typeof value === 'string') return `"${value}"`
      if (typeof value === 'object') return hex(value)
      return String(value)
    }
    if (node.type === 'VARIABLE') {
      const name = nameOf(node.variableId)
      const reserved = ['and', 'or', 'not', 'true', 'false'].includes(name.toLowerCase())
      return BARE_NAME.test(name) && !reserved ? name : `{${name}}`
    }
    const own = PRECEDENCE[node.operator]
    const [a, b] = node.operands
    let text: string
    if (node.operator === 'NOT') text = `not ${format(a, own)}`
    else if (node.operator === 'NEGATE') text = `-${format(a, own)}`
    else if (node.operator === 'STRINGIFY' || node.operator === 'IS_TRUTHY')
      text = format(a, parent)
    else text = `${format(a, own)} ${SYMBOLS[node.operator] ?? '?'} ${format(b, own + 1)}`
    return own < parent ? `(${text})` : text
  }
  return format(expression, 0)
}
