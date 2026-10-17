import { fromUint8Array } from 'js-base64'

import { FigmaNodeProxy } from '#core/figma-api'

const MAX_DEPTH = 32

/** A layer a script returned, as an ID with what names it; scripts return IDs to refer to layers. */
function nodeSummary(node: FigmaNodeProxy): Record<string, unknown> {
  try {
    return { id: node.id, type: node.type, name: node.name }
  } catch {
    return { id: node.id, removed: true }
  }
}

function serializePrimitive(value: unknown): unknown {
  if (value === null || value === undefined || typeof value === 'function') return null
  if (typeof value === 'symbol') return value.description === 'mixed' ? 'figma.mixed' : null
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value)
  return value
}

function serialize(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (value === null || typeof value !== 'object') return serializePrimitive(value)
  if (value instanceof FigmaNodeProxy) return nodeSummary(value)
  if (value instanceof Uint8Array) return fromUint8Array(value)
  if (value instanceof Error) return { name: value.name, message: value.message }
  if (seen.has(value)) return '[Circular]'
  if (depth >= MAX_DEPTH) return '[Too deep]'
  seen.add(value)
  try {
    const toJSON = Reflect.get(value, 'toJSON')
    if (typeof toJSON === 'function') return serialize(toJSON.call(value), seen, depth + 1)
    if (value instanceof Map) {
      return Object.fromEntries(
        [...value].map(([key, entry]) => [String(key), serialize(entry, seen, depth + 1)])
      )
    }
    if (value instanceof Set || Array.isArray(value)) {
      return [...value].map((entry) => serialize(entry, seen, depth + 1))
    }
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      if (entry === undefined || typeof entry === 'function') continue
      result[key] = serialize(entry, seen, depth + 1)
    }
    return result
  } finally {
    seen.delete(value)
  }
}

/**
 * A script's return value as JSON, as Figma's `use_figma` hands it back: layers become
 * `{ id, type, name }`, `figma.mixed` the string `"figma.mixed"`, bytes Base64, and what JSON
 * cannot hold (functions, `undefined`) is left out.
 */
export function serializeScriptValue(value: unknown): unknown {
  return serialize(value, new WeakSet(), 0)
}

/** One `console` argument as text: strings as they are, anything else as JSON. */
export function formatLogArgument(value: unknown): string {
  if (typeof value === 'string') return value
  const serialized = serializeScriptValue(value)
  return typeof serialized === 'string' ? serialized : JSON.stringify(serialized)
}
