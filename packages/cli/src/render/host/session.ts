import { MessageChannel, receiveMessageOnPort, Worker, type MessagePort } from 'node:worker_threads'

import * as v from 'valibot'

import type { Color } from '@kalka/scene-graph'

import { electronExecutable, hostEntry } from './locate'
import { ANSWERED, HOST_PID, relayProgram } from './relay'

const AnswerSchema = v.object({
  id: v.number(),
  result: v.optional(v.unknown()),
  error: v.optional(v.string())
})

/** A request to the render host, as `electron/src/render-host.ts` reads it, without its id. */
export type HostRequest =
  | {
      type: 'render'
      file: string
      output: string
      width: number
      height: number
      scale: number
      format: 'PNG' | 'JPG' | 'PDF'
      quality?: number
      background?: Color
    }
  | { type: 'evaluate'; script: string }

/** Linux draws only with a display; CI gives it one with `xvfb-run`. */
function hasDisplay(): boolean {
  return process.platform !== 'linux' || !!process.env.DISPLAY || !!process.env.WAYLAND_DISPLAY
}

/**
 * The CLI's one render host: an Electron process started on the first request and kept until
 * the CLI exits, which closes its input. Requests are synchronous, as layout is: the caller
 * waits on a worker thread that talks to the host. A request that fails or outlasts its timeout
 * stops the host for the rest of the run, and callers fall back to Yoga and CanvasKit.
 */
export class RenderHost {
  #nextId = 1
  #closed = false

  private constructor(
    private readonly worker: Worker,
    private readonly port: MessagePort,
    private readonly signal: Int32Array
  ) {
    process.once('exit', () => this.close())
  }

  static start(): RenderHost | null {
    const entry = hostEntry()
    const executable = entry ? electronExecutable(entry) : null
    if (!entry || !executable || !hasDisplay()) return null
    // Electron from `node_modules` cannot set up Chromium's sandbox on Linux without root, and
    // CI runners forbid the namespaces it falls back to. The host loads only the CLI's own pages,
    // offline (`electron/src/handlers/raster.ts`).
    const args = process.platform === 'linux' ? [entry, '--no-sandbox'] : [entry]
    const { port1, port2 } = new MessageChannel()
    const signal = new Int32Array(new SharedArrayBuffer(8))
    const worker = new Worker(`(${relayProgram.toString()})()`, {
      eval: true,
      workerData: { executable, args, port: port2, signal: signal.buffer },
      transferList: [port2]
    })
    // Neither keeps the CLI running: it exits when its work is done, and the host follows.
    worker.unref()
    port1.unref()
    return new RenderHost(worker, port1, signal)
  }

  get closed(): boolean {
    return this.#closed
  }

  /**
   * Sends one request and waits for its answer: the host's result, or null when the host
   * failed, answered with an error, or took longer than `timeout` milliseconds.
   */
  request(request: HostRequest, timeout: number): { result: unknown } | null {
    if (this.#closed) return null
    const id = this.#nextId++
    Atomics.store(this.signal, ANSWERED, 0)
    this.port.postMessage(JSON.stringify({ ...request, id }), [])
    const deadline = performance.now() + timeout
    for (;;) {
      const remaining = deadline - performance.now()
      if (remaining <= 0 || Atomics.wait(this.signal, ANSWERED, 0, remaining) === 'timed-out') {
        this.close()
        return null
      }
      Atomics.store(this.signal, ANSWERED, 0)
      for (let message = receiveMessageOnPort(this.port); message;) {
        const answer = v.safeParse(v.pipe(v.string(), v.parseJson(), AnswerSchema), message.message)
        if (!answer.success || answer.output.id === -1) {
          this.close()
          return null
        }
        if (answer.output.id === id) {
          return answer.output.error === undefined ? { result: answer.output.result } : null
        }
        message = receiveMessageOnPort(this.port)
      }
    }
  }

  /** Stops the host and the worker; later requests answer null. */
  close(): void {
    if (this.#closed) return
    this.#closed = true
    const pid = Atomics.load(this.signal, HOST_PID)
    if (pid > 0) {
      try {
        process.kill(pid)
      } catch (error) {
        // ESRCH: it exited on its own in the meantime.
        if (!(error instanceof Error && 'code' in error && error.code === 'ESRCH')) {
          console.warn('Could not stop the render host', error)
        }
      }
    }
    void this.worker.terminate()
  }
}

let shared: RenderHost | null | undefined

/** The render host of this run, started on first use; null without Electron or once it failed. */
export function renderHost(): RenderHost | null {
  if (shared === undefined) shared = RenderHost.start()
  if (shared?.closed) shared = null
  return shared
}
