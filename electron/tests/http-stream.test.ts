import { describe, expect, test } from 'bun:test'

import { createHttpStreams, type HttpStreamRequest } from '../src/handlers/http-stream'

/** Timers fired by hand: each entry is one silence the streams are waiting out. */
function manualClock() {
  const timers = new Map<number, () => void>()
  let next = 0
  return {
    schedule: (run: () => void) => {
      const id = next++
      timers.set(id, run)
      return () => timers.delete(id)
    },
    fire: () => {
      const due = [...timers.values()]
      timers.clear()
      for (const run of due) run()
    },
    get pending() {
      return timers.size
    }
  }
}

/** A server that writes a chunk whenever the test says so. */
function slowServer() {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null
  const body = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value
    }
  })
  let signal: AbortSignal | undefined
  return {
    fetcher: async (_url: string, init: RequestInit) => {
      signal = init.signal ?? undefined
      signal?.addEventListener('abort', () => controller?.error(signal?.reason))
      return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } })
    },
    write: (text: string) => controller?.enqueue(new TextEncoder().encode(text)),
    end: () => controller?.close(),
    get aborted() {
      return signal?.aborted ?? false
    }
  }
}

function request(overrides: Partial<HttpStreamRequest> = {}): HttpStreamRequest {
  return {
    id: 'stream-1',
    url: 'http://localhost:1234/v1/chat/completions',
    method: 'POST',
    headers: [],
    follow_redirects: true,
    idle_timeout_ms: 30_000,
    ...overrides
  }
}

const text = (chunk: number[]) => new TextDecoder().decode(new Uint8Array(chunk))

describe('streamed desktop HTTP', () => {
  test('a reply longer than the idle timeout keeps going while the server writes', async () => {
    const clock = manualClock()
    const server = slowServer()
    const streams = createHttpStreams(server.fetcher, clock.schedule)

    const head = await streams.open(request())
    expect(head.status).toBe(200)
    // Each chunk restarts the silence timer, so many timeouts' worth of writing never trips it.
    for (const word of ['one', 'two', 'three']) {
      const pending = streams.read('stream-1')
      server.write(word)
      const next = await pending
      expect(next.done ? null : text(next.chunk)).toBe(word)
      expect(clock.pending).toBe(1)
    }
    const last = streams.read('stream-1')
    server.end()
    expect(await last).toEqual({ done: true })
    expect(streams.openCount).toBe(0)
    expect(clock.pending).toBe(0)
  })

  test('a silent server is cut off after the idle timeout', async () => {
    const clock = manualClock()
    const server = slowServer()
    const streams = createHttpStreams(server.fetcher, clock.schedule)

    await streams.open(request())
    const waiting = streams.read('stream-1')
    clock.fire()

    await expect(waiting).rejects.toThrow('The server sent nothing for 30 seconds')
    expect(server.aborted).toBe(true)
    expect(streams.openCount).toBe(0)
  })

  test('cancelling aborts the request and forgets the stream', async () => {
    const clock = manualClock()
    const server = slowServer()
    const streams = createHttpStreams(server.fetcher, clock.schedule)

    await streams.open(request())
    const waiting = streams.read('stream-1')
    streams.cancel('stream-1')

    await expect(waiting).rejects.toThrow('The operation was aborted')
    expect(server.aborted).toBe(true)
    expect(clock.pending).toBe(0)
    await expect(streams.read('stream-1')).rejects.toThrow('The response stream is closed')
  })

  test('stops a response over its size limit', async () => {
    const clock = manualClock()
    const server = slowServer()
    const streams = createHttpStreams(server.fetcher, clock.schedule)

    await streams.open(request({ max_response_bytes: 4 }))
    const pending = streams.read('stream-1')
    server.write('too long')

    await expect(pending).rejects.toThrow('The response is too large')
    expect(streams.openCount).toBe(0)
  })

  test('refuses other protocols', async () => {
    const streams = createHttpStreams(slowServer().fetcher, manualClock().schedule)
    await expect(streams.open(request({ url: 'file:///etc/passwd' }))).rejects.toThrow(
      'Only http and https are allowed'
    )
    expect(streams.openCount).toBe(0)
  })
})
