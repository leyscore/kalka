/**
 * Streamed HTTP for the page. The main process opens the request and keeps its body; the page
 * pulls it a chunk at a time, so a reply that takes minutes to write, such as a local model
 * generating, arrives as it is written. Only silence ends it: the timer restarts whenever the
 * page asks for more or the server sends some, never on the reply's total length.
 */

export interface HttpStreamRequest {
  id: string
  url: string
  method: string
  headers: { name: string; value: string }[]
  body?: number[]
  max_response_bytes?: number
  follow_redirects: boolean
  idle_timeout_ms?: number
}

export interface HttpStreamHead {
  status: number
  headers: { name: string; value: string }[]
  url: string
}

export type HttpStreamRead = { done: true } | { done: false; chunk: number[] }

/** How long a stream may stay silent before it is closed, unless the request says otherwise. */
export const HTTP_STREAM_IDLE_TIMEOUT_MS = 300_000

type Fetcher = (url: string, init: RequestInit) => Promise<Response>
type Schedule = (run: () => void, ms: number) => () => void

interface OpenStream {
  controller: AbortController
  idleMs: number
  maxBytes?: number
  size: number
  reader?: ReadableStreamDefaultReader<Uint8Array>
  failure?: Error
  stopTimer: () => void
}

const defaultSchedule: Schedule = (run, ms) => {
  const timer = setTimeout(run, ms)
  return () => clearTimeout(timer)
}

export function createHttpStreams(fetcher: Fetcher, schedule: Schedule = defaultSchedule) {
  const streams = new Map<string, OpenStream>()

  function close(id: string, failure?: Error): void {
    const stream = streams.get(id)
    if (!stream) return
    streams.delete(id)
    stream.stopTimer()
    stream.failure ??= failure
    stream.controller.abort(stream.failure)
    void stream.reader?.cancel().catch(() => undefined)
  }

  function touch(id: string, stream: OpenStream): void {
    stream.stopTimer()
    stream.stopTimer = schedule(() => {
      const seconds = Math.round(stream.idleMs / 1000)
      close(id, new Error(`The server sent nothing for ${seconds} seconds`))
    }, stream.idleMs)
  }

  function failureOf(stream: OpenStream, error: unknown): unknown {
    return stream.failure ?? error
  }

  async function open(request: HttpStreamRequest): Promise<HttpStreamHead> {
    if (typeof request.id !== 'string' || !request.id) throw new Error('A stream needs an id')
    if (streams.has(request.id)) throw new Error('The stream is already open')
    const url = new URL(request.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new Error('Only http and https are allowed')
    const idleMs = request.idle_timeout_ms ?? HTTP_STREAM_IDLE_TIMEOUT_MS
    if (!(idleMs > 0)) throw new Error('The timeout must be positive')

    const stream: OpenStream = {
      controller: new AbortController(),
      idleMs,
      maxBytes: request.max_response_bytes,
      size: 0,
      stopTimer: () => undefined
    }
    streams.set(request.id, stream)
    touch(request.id, stream)
    const headers = new Headers()
    for (const { name, value } of request.headers) headers.set(name, value)
    let response: Response
    try {
      response = await fetcher(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? new Uint8Array(request.body) : undefined,
        redirect: request.follow_redirects ? 'follow' : 'manual',
        signal: stream.controller.signal
      })
    } catch (error) {
      close(request.id)
      throw failureOf(stream, error)
    }
    // Cancelled while the server was answering.
    if (streams.get(request.id) !== stream) {
      void response.body?.cancel().catch(() => undefined)
      throw stream.failure ?? new Error('The operation was aborted')
    }
    stream.reader = response.body?.getReader()
    touch(request.id, stream)
    return {
      status: response.status,
      headers: [...response.headers].map(([name, value]) => ({ name, value })),
      url: response.url || request.url
    }
  }

  async function read(id: string): Promise<HttpStreamRead> {
    const stream = streams.get(id)
    if (!stream) throw new Error('The response stream is closed')
    if (!stream.reader) {
      close(id)
      return { done: true }
    }
    touch(id, stream)
    let next: ReadableStreamReadResult<Uint8Array>
    try {
      next = await stream.reader.read()
    } catch (error) {
      close(id)
      throw failureOf(stream, error)
    }
    if (next.done) {
      close(id)
      return { done: true }
    }
    stream.size += next.value.byteLength
    if (stream.maxBytes !== undefined && stream.size > stream.maxBytes) {
      const failure = new Error('The response is too large')
      close(id, failure)
      throw failure
    }
    touch(id, stream)
    return { done: false, chunk: [...next.value] }
  }

  function cancel(id: string): void {
    close(id, new Error('The operation was aborted'))
  }

  return {
    open,
    read,
    cancel,
    get openCount() {
      return streams.size
    }
  }
}
