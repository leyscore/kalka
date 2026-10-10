import { fromUint8Array, isValid, toUint8Array } from 'js-base64'

import { colorToCSS, colorToHex } from '@open-pencil/scene-graph/color'
import type { Color } from '@open-pencil/scene-graph/primitives'

/** A value JSON can hold. */
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue }

const BYTES = '$bytes'
const MAP = '$map'
const SET = '$set'
const NUMBER = '$number'
const UNDEFINED = '$undefined'
const MARKERS = new Set([BYTES, MAP, SET, NUMBER, UNDEFINED])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Keys that start with `$` gain one more, so no layer data reads as one of the markers. */
function escapeKey(key: string): string {
  return key.startsWith('$') ? `$${key}` : key
}

function unescapeKey(key: string): string {
  return key.startsWith('$$') ? key.slice(1) : key
}

function encodeNumber(value: number): JSONValue {
  if (Number.isNaN(value)) return { [NUMBER]: 'NaN' }
  if (!Number.isFinite(value)) return { [NUMBER]: value > 0 ? 'Infinity' : '-Infinity' }
  if (Object.is(value, -0)) return { [NUMBER]: '-0' }
  return value
}

/**
 * A layer value as JSON, keys sorted so the text is stable: bytes as Base64, maps and sets as
 * entry lists, numbers JSON cannot spell by name. Undefined object members are left out.
 */
export function encodeValue(value: unknown): JSONValue {
  if (value === undefined) return { [UNDEFINED]: true }
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value
  if (typeof value === 'number') return encodeNumber(value)
  if (value instanceof Uint8Array) return { [BYTES]: fromUint8Array(value) }
  if (value instanceof Map)
    return { [MAP]: [...value].map(([key, entry]) => [encodeValue(key), encodeValue(entry)]) }
  if (value instanceof Set) return { [SET]: [...value].map(encodeValue) }
  if (Array.isArray(value)) return value.map(encodeValue)
  if (!isRecord(value)) throw new Error(`Cannot save a value of type ${typeof value}`)
  const encoded: Record<string, JSONValue> = {}
  for (const key of Object.keys(value).sort()) {
    const entry = value[key]
    if (entry !== undefined) encoded[escapeKey(key)] = encodeValue(entry)
  }
  return encoded
}

function decodeMarker(key: string, payload: unknown): unknown {
  if (key === UNDEFINED) return undefined
  if (key === NUMBER) return payload === '-0' ? -0 : Number(payload)
  if (key === BYTES) {
    if (typeof payload !== 'string' || !isValid(payload)) throw new Error('Invalid saved bytes')
    return toUint8Array(payload)
  }
  if (!Array.isArray(payload)) throw new Error(`Invalid saved ${key}`)
  if (key === SET) return new Set(payload.map(decodeValue))
  return new Map(
    payload.map((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2) throw new Error('Invalid saved map entry')
      return [decodeValue(entry[0]), decodeValue(entry[1])]
    })
  )
}

/** The value `encodeValue` wrote. */
export function decodeValue(json: unknown): unknown {
  if (Array.isArray(json)) return json.map(decodeValue)
  if (!isRecord(json)) return json
  const keys = Object.keys(json)
  if (keys.length === 1 && MARKERS.has(keys[0])) return decodeMarker(keys[0], json[keys[0]])
  const decoded: Record<string, unknown> = {}
  for (const key of keys) decoded[unescapeKey(key)] = decodeValue(json[key])
  return decoded
}

function isColor(value: Record<string, unknown>): value is Record<string, unknown> & Color {
  const keys = Object.keys(value)
  return keys.length === 4 && ['r', 'g', 'b', 'a'].every((key) => typeof value[key] === 'number')
}

/** A color as CSS writes it: hex when opaque, `rgba()` otherwise. */
function cssColorText(color: Color): string {
  return color.a >= 1 ? colorToHex(color) : colorToCSS(color)
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index])
}

function sameRecords(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (isColor(a) && isColor(b)) return cssColorText(a) === cssColorText(b)
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) if (!sameAsWritten(a[key], b[key])) return false
  return true
}

/**
 * Whether a value read back from CSS is the one the layer had, at the precision CSS keeps it:
 * colors as their CSS text, which holds 8 bits a channel, everything else exactly. An undefined
 * member and a missing one are the same.
 */
export function sameAsWritten(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b)
  if (a instanceof Uint8Array || b instanceof Uint8Array)
    return a instanceof Uint8Array && b instanceof Uint8Array && sameBytes(a, b)
  return sameCollections(a, b) ?? (isRecord(a) && isRecord(b) && sameRecords(a, b))
}

/** Maps, sets, and arrays compared entry by entry; undefined when neither value is one. */
function sameCollections(a: unknown, b: unknown): boolean | undefined {
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) return false
    return [...a].every(([key, value]) => b.has(key) && sameAsWritten(value, b.get(key)))
  }
  if (a instanceof Set || b instanceof Set)
    return a instanceof Set && b instanceof Set && sameAsWritten([...a], [...b])
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
    return a.every((value, index) => sameAsWritten(value, b[index]))
  }
  return undefined
}
