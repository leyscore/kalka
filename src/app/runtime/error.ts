import { uniq } from 'es-toolkit'

/**
 * What an error says, whatever shape it arrived in. ACP agents reject requests with plain
 * JSON-RPC error objects (`{ code, message, data }`), not Error instances, and wrappers add
 * their own message over a `cause`; `String()` on either loses everything but `[object Object]`.
 */
export interface ErrorFacts {
  /** The outermost error's name, `JSONRPCError` for a plain error object. */
  name: string
  /** The first readable message, outermost first. */
  message: string
  /** The readable messages joined, such as `Request failed: Authentication required`. */
  summary: string
  /** The first code found on the error or its causes: a JSON-RPC code, a status, `ENOENT`. */
  code: string | number | null
  /** The JSON-RPC `data` of the first error that has one. */
  data: unknown
  /** Every readable message of the error, its causes and their details, outermost first. */
  messages: string[]
}

export const UNKNOWN_ERROR_MESSAGE = 'Unknown error'

/**
 * The JSON-RPC code ACP agents answer with until they are signed in, as the ACP SDK's
 * `RequestError.authRequired` sends it.
 */
export const JSONRPC_AUTH_REQUIRED_CODE = -32000

const MAX_DEPTH = 6
const MAX_SUMMARY_PARTS = 3
const OBJECT_STRING = /^\[object \w+\]$/

type Fields = Record<string, unknown>

function fieldsOf(value: unknown): Fields | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Fields)
    : null
}

function readable(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text && !OBJECT_STRING.test(text) ? text : null
}

function codeOf(value: unknown): string | number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return readable(value)
}

/** The texts a JSON-RPC `data` payload carries, such as `{ details }` from an internal error. */
function dataTexts(data: unknown): string[] {
  const text = readable(data)
  if (text) return [text]
  const fields = fieldsOf(data)
  if (!fields) return []
  return [fields.message, fields.details, fields.error, fields.reason]
    .map(readable)
    .filter((value): value is string => value !== null)
}

function nameOf(value: unknown, fields: Fields | null): string {
  if (value instanceof Error) return value.name || 'Error'
  if (!fields) return 'UnknownError'
  const name = readable(fields.name)
  if (name) return name
  return 'code' in fields || 'message' in fields ? 'JSONRPCError' : 'UnknownError'
}

/** The text of a thrown string or number; arrays and functions say nothing readable. */
function primitiveText(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return `${value}`
  }
  return null
}

/** A JSON-RPC response that failed, `{ error: { code, message } }`, stands for its error. */
function unwrapResponse(value: unknown): unknown {
  const fields = fieldsOf(value)
  if (!fields || value instanceof Error || 'message' in fields) return value
  return fieldsOf(fields.error) ? fields.error : value
}

export function errorFacts(error: unknown): ErrorFacts {
  const messages: string[] = []
  let code: string | number | null = null
  let data: unknown
  let name: string | null = null
  const seen = new Set<unknown>()
  let current = unwrapResponse(error)
  for (let depth = 0; depth < MAX_DEPTH && current != null && !seen.has(current); depth++) {
    seen.add(current)
    const fields = fieldsOf(current)
    name ??= nameOf(current, fields)
    if (!fields) {
      const text = readable(primitiveText(current))
      if (text) messages.push(text)
      break
    }
    const message = readable(fields.message)
    if (message) messages.push(message)
    code ??= codeOf(fields.code)
    if (data === undefined && fields.data !== undefined) data = fields.data
    messages.push(...dataTexts(fields.data))
    current = unwrapResponse(fields.cause)
  }
  const distinct = uniq(messages)
  return {
    name: name ?? 'UnknownError',
    message: distinct[0] ?? UNKNOWN_ERROR_MESSAGE,
    summary: distinct.slice(0, MAX_SUMMARY_PARTS).join(': ') || UNKNOWN_ERROR_MESSAGE,
    code,
    data,
    messages: distinct
  }
}

/** A readable message for any thrown value, never `[object Object]`. */
export function errorSummary(error: unknown): string {
  return errorFacts(error).summary
}
