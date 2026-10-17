import { sha1 } from '@noble/hashes/legacy.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'
import { isPlainObject, omit } from 'es-toolkit'

import type { Variable, VariableCollection } from '../types'

/** Hex digits a fingerprint keeps: enough to tell two states apart, short enough to send often. */
const FINGERPRINT_LENGTH = 12

interface TokenSource {
  variables: ReadonlyMap<string, Variable>
  variableCollections: ReadonlyMap<string, VariableCollection>
}

/** Object keys in sorted order, so the same tokens built in another order serialize the same. */
function sortedKeys(_key: string, value: unknown): unknown {
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.entries(value).toSorted(([a], [b]) => (a < b ? -1 : 1)))
}

function byId<T extends { id: string }>(items: Iterable<T>): T[] {
  return [...items].toSorted((a, b) => (a.id < b.id ? -1 : 1))
}

/**
 * A short fingerprint of a document's tokens: its variable collections, their modes and every
 * variable's name, type, values, unit and code syntax. It changes whenever a token is added,
 * removed, renamed or set to another value, so an agent that read the tokens can tell they are
 * stale; plugin data does not count.
 */
export function tokensFingerprint(graph: TokenSource): string {
  const text = JSON.stringify(
    {
      collections: byId(graph.variableCollections.values()).map((c) => omit(c, ['pluginData'])),
      variables: byId(graph.variables.values()).map((v) => omit(v, ['pluginData']))
    },
    sortedKeys
  )
  return bytesToHex(sha1(utf8ToBytes(text))).slice(0, FINGERPRINT_LENGTH)
}
