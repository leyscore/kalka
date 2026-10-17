import { randomBytes } from 'node:crypto'

import type { Context } from 'hono'
import { isValid, toUint8Array } from 'js-base64'

import type { RPCJSONObject } from '#mcp/json'

/** Where the server serves the files tools return, as `/assets/<id>.<ext>`. */
export const ASSET_ROUTE = '/assets'

/** How long a returned file stays available: long enough to fetch it, short enough to forget it. */
export const ASSET_TTL_MS = 5 * 60_000

/** At most this many files are kept; the oldest goes first. */
const MAX_ASSETS = 32

/** At most this many bytes of files are kept; the oldest go first. */
const MAX_ASSET_BYTES = 64 * 1024 * 1024

const EXTENSIONS: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf'
}

/** 128 random bits as hex: the name of a file is also what lets a client read it. */
const ASSET_NAME = /^([0-9a-f]{32})\.([a-z]+)$/

interface StoredAsset {
  bytes: Uint8Array
  mimeType: string
  extension: string
  expiresAt: number
}

/** A file a tool returned, as a client can fetch it from the server. */
export interface AssetLink {
  url: string
  mimeType: string
  expiresAt: string
}

export interface AssetStore {
  /** Keeps `bytes` for a while and returns the file name it is served under, or null if it cannot. */
  put: (bytes: Uint8Array, mimeType: string) => { name: string; expiresAt: number } | null
  get: (name: string) => StoredAsset | null
  clear: () => void
}

/**
 * The files tool calls returned, kept in memory for `ttlMs` and bounded in count and size. Each one
 * is named by 128 random bits, so only the client a tool call answered knows where to fetch it.
 */
export function createAssetStore(options: { ttlMs?: number; now?: () => number } = {}): AssetStore {
  const ttlMs = options.ttlMs ?? ASSET_TTL_MS
  const now = options.now ?? Date.now
  // Insertion order is age order, so eviction takes from the front.
  const assets = new Map<string, StoredAsset>()
  let totalBytes = 0

  function remove(id: string, asset: StoredAsset) {
    assets.delete(id)
    totalBytes -= asset.bytes.length
  }

  function prune(incoming: number) {
    const time = now()
    for (const [id, asset] of assets) {
      const full = assets.size >= MAX_ASSETS || totalBytes + incoming > MAX_ASSET_BYTES
      if (asset.expiresAt > time && !full) break
      remove(id, asset)
    }
  }

  return {
    put(bytes, mimeType) {
      const extension = EXTENSIONS[mimeType]
      if (!extension || bytes.length > MAX_ASSET_BYTES) return null
      prune(bytes.length)
      const id = randomBytes(16).toString('hex')
      const expiresAt = now() + ttlMs
      assets.set(id, { bytes, mimeType, extension, expiresAt })
      totalBytes += bytes.length
      return { name: `${id}.${extension}`, expiresAt }
    },
    get(name) {
      const match = ASSET_NAME.exec(name)
      if (!match) return null
      const [, id, extension] = match
      const asset = assets.get(id)
      if (!asset || asset.extension !== extension) return null
      if (asset.expiresAt <= now()) {
        remove(id, asset)
        return null
      }
      return asset
    },
    clear() {
      assets.clear()
      totalBytes = 0
    }
  }
}

/** Answers `GET /assets/<id>.<ext>` with the stored file, or 404 once it is gone. */
function serveAsset(store: AssetStore, c: Context): Response {
  const asset = store.get(c.req.param('file') ?? '')
  if (!asset) return c.json({ error: 'Asset not found or expired' }, 404)
  return c.body(asset.bytes.slice().buffer, 200, {
    'Content-Type': asset.mimeType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  })
}

type RPCSend = (msg: RPCJSONObject) => Promise<unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Sends to the app and keeps each file a tool call returns, adding where the server serves it as
 * `asset` beside the result. The tool result keeps its base64, so a client that shows files inline
 * still can; without a TCP listener there is no URL to give, and the response is left alone.
 */
function withAssetLinks(send: RPCSend, store: AssetStore, origin: () => string | null): RPCSend {
  return async (msg) => {
    const response = await send(msg)
    if (msg.command !== 'tool' || !isRecord(response) || !isRecord(response.result)) return response
    const base = origin()
    const { base64, mimeType } = response.result
    if (!base || typeof base64 !== 'string' || typeof mimeType !== 'string') return response
    if (!isValid(base64)) return response
    const stored = store.put(toUint8Array(base64), mimeType)
    if (!stored) return response
    const asset: AssetLink = {
      url: `${base}${ASSET_ROUTE}/${stored.name}`,
      mimeType,
      expiresAt: new Date(stored.expiresAt).toISOString()
    }
    return { ...response, asset }
  }
}

/** The server's side of returned files: where they are kept, served, and linked from responses. */
export interface AssetLinks {
  serve: (c: Context) => Response
  /** Wraps the server's calls into the app so the files they return get links. */
  wrap: (send: RPCSend) => RPCSend
  /** Links use the TCP listener's port; until it is known, or without one, there are none. */
  listenOn: (httpPort: number) => void
}

export function createAssetLinks(store: AssetStore = createAssetStore()): AssetLinks {
  let port = 0
  const origin = () => (port ? `http://127.0.0.1:${port}` : null)
  return {
    serve: (c) => serveAsset(store, c),
    wrap: (send) => withAssetLinks(send, store, origin),
    listenOn: (httpPort) => {
      port = httpPort
    }
  }
}
