import { randomHex } from '@kalka/scene-graph/random'

import type { FetchFunction } from '@/app/http/types'

export interface ProxyHttpHeader {
  name: string
  value: string
}

export interface ProxyHttpRequest {
  url: string
  method?: string
  headers?: ProxyHttpHeader[]
  body?: number[]
  max_response_bytes?: number
  follow_redirects?: boolean
  timeout_ms?: number
}

export interface ProxyHttpStreamRequest extends Omit<ProxyHttpRequest, 'timeout_ms'> {
  id: string
  idle_timeout_ms?: number
}

export type ProxyHttpStreamHead = Omit<ProxyHttpResponse, 'body'>

export type ProxyHttpStreamRead = { done: true } | { done: false; chunk: number[] }

export interface ProxyHttpResponse {
  status: number
  headers: ProxyHttpHeader[]
  body: number[]
  url: string
}

const NULL_BODY_STATUS_CODES = new Set([204, 205, 304])

function responseBodyForStatus(response: ProxyHttpResponse): BodyInit | null {
  if (NULL_BODY_STATUS_CODES.has(response.status)) return null
  return Uint8Array.from(response.body)
}

function headersToProxyHeaders(headers: Headers): ProxyHttpHeader[] {
  return [...headers.entries()].map(([name, value]) => ({ name, value }))
}

function abortReason(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new DOMException('The operation was aborted', 'AbortError')
}

export function withAbortSignal<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    void promise.catch(() => undefined)
    return Promise.reject(abortReason(signal))
  }

  return new Promise<T>((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort)
    const onAbort = () => {
      cleanup()
      reject(abortReason(signal))
    }
    signal.addEventListener('abort', onAbort, { once: true })
    void (async () => {
      try {
        const value = await promise
        cleanup()
        resolve(value)
      } catch (error) {
        cleanup()
        reject(
          error instanceof Error
            ? error
            : new Error('Desktop HTTP request failed', { cause: error })
        )
      }
    })()
  })
}

export interface TauriFetchOptions {
  timeoutMs?: number
  maxResponseBytes?: number
  nativeFetch?: FetchFunction
  /**
   * Streams the body as the server writes it instead of after it ends. `timeoutMs` is then how
   * long the server may stay silent, not how long the whole response may take.
   */
  stream?: boolean
}

const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis)

export function createTauriFetch(options: TauriFetchOptions = {}): FetchFunction {
  const fetcher = options.nativeFetch ?? nativeFetch
  if (options.stream) {
    return (input, init) => executeStreamingFetch(fetcher, input, init, options)
  }
  return (input, init) =>
    executeTauriFetch(fetcher, input, init, options.maxResponseBytes, options.timeoutMs)
}

export async function tauriFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxResponseBytes?: number,
  timeoutMs?: number
): Promise<Response> {
  return executeTauriFetch(nativeFetch, input, init, maxResponseBytes, timeoutMs)
}

function isIPCRequest(input: RequestInfo | URL): boolean {
  const parsedURL = new URL(input instanceof Request ? input.url : input.toString())
  return (
    parsedURL.protocol === 'ipc:' ||
    ((parsedURL.protocol === 'http:' || parsedURL.protocol === 'https:') &&
      parsedURL.hostname === 'ipc.localhost')
  )
}

/** Loads the desktop bridge and reads the request into the form the main process takes. */
async function prepareProxy(request: Request) {
  request.signal.throwIfAborted()
  const { invoke } = await import('@tauri-apps/api/core')
  request.signal.throwIfAborted()
  return { invoke, base: await proxyRequest(request) }
}

async function proxyRequest(request: Request): Promise<Omit<ProxyHttpRequest, 'timeout_ms'>> {
  // Capture generated multipart headers before consuming the Request body.
  const headers = headersToProxyHeaders(request.headers)
  let bodyData: Uint8Array | undefined
  if (request.body != null) {
    const buffer = await request.arrayBuffer()
    request.signal.throwIfAborted()
    bodyData = new Uint8Array(buffer)
  }
  return {
    url: request.url,
    method: request.method,
    headers,
    body: bodyData ? Array.from(bodyData) : undefined,
    follow_redirects: request.redirect === 'follow'
  }
}

function proxiedResponse(head: ProxyHttpStreamHead, body: BodyInit | null): Response {
  const response = new Response(NULL_BODY_STATUS_CODES.has(head.status) ? null : body, {
    status: head.status,
    headers: head.headers.map(({ name, value }): [string, string] => [name, value])
  })
  Object.defineProperty(response, 'url', { value: head.url })
  return response
}

async function executeTauriFetch(
  fetcher: FetchFunction,
  input: RequestInfo | URL,
  init?: RequestInit,
  maxResponseBytes?: number,
  timeoutMs?: number
): Promise<Response> {
  if (isIPCRequest(input)) return fetcher(input, init)

  const request = new Request(input, init)
  const { invoke, base } = await prepareProxy(request)
  const payload: ProxyHttpRequest = {
    ...base,
    max_response_bytes: maxResponseBytes,
    timeout_ms: timeoutMs
  }
  request.signal.throwIfAborted()
  const response = await withAbortSignal(
    invoke<ProxyHttpResponse>('proxy_http_request', { request: payload }),
    request.signal
  )
  return proxiedResponse(response, responseBodyForStatus(response))
}

/**
 * The main process holds the response; the body is pulled from it a chunk at a time, and
 * aborting the request or cancelling the body closes it there too.
 */
async function executeStreamingFetch(
  fetcher: FetchFunction,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: TauriFetchOptions
): Promise<Response> {
  if (isIPCRequest(input)) return fetcher(input, init)

  const request = new Request(input, init)
  const { invoke, base } = await prepareProxy(request)
  const id = randomHex(16)
  const payload: ProxyHttpStreamRequest = {
    ...base,
    id,
    max_response_bytes: options.maxResponseBytes,
    idle_timeout_ms: options.timeoutMs
  }
  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    request.signal.removeEventListener('abort', close)
    void invoke('proxy_http_stream_cancel', { id }).catch(() => undefined)
  }
  // Ends the stream in the main process however the request ends; reading to the end closes it
  // there by itself.
  const finish = () => {
    closed = true
    request.signal.removeEventListener('abort', close)
  }
  request.signal.addEventListener('abort', close, { once: true })
  let head: ProxyHttpStreamHead
  try {
    head = await withAbortSignal(
      invoke<ProxyHttpStreamHead>('proxy_http_stream_open', { request: payload }),
      request.signal
    )
  } catch (error) {
    close()
    throw error
  }
  if (NULL_BODY_STATUS_CODES.has(head.status)) {
    close()
    return proxiedResponse(head, null)
  }
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await withAbortSignal(
          invoke<ProxyHttpStreamRead>('proxy_http_stream_read', { id }),
          request.signal
        )
        if (next.done) {
          finish()
          controller.close()
        } else {
          controller.enqueue(Uint8Array.from(next.chunk))
        }
      } catch (error) {
        if (request.signal.aborted) close()
        else finish()
        controller.error(error)
      }
    },
    cancel: close
  })
  return proxiedResponse(head, body)
}
