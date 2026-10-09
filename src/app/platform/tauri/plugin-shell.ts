import { call, native } from './bridge'

export interface SpawnOptions {
  cwd?: string
  env?: Record<string, string>
  /** 'raw' for bytes; otherwise text, one line per event. */
  encoding?: string
}

export interface TerminatedPayload {
  code: number | null
  signal: number | null
}

type Listener = (...args: never[]) => void

class Listeners {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, listener: Listener): this {
    let set = this.listeners.get(event)
    if (!set) this.listeners.set(event, (set = new Set()))
    set.add(listener)
    return this
  }

  off(event: string, listener: Listener): this {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  emit(event: string, ...args: unknown[]): void {
    for (const listener of this.listeners.get(event) ?? [])
      (listener as (...rest: unknown[]) => void)(...args)
  }
}

export class Child {
  constructor(readonly pid: number) {}

  write(data: string | Uint8Array | number[]): Promise<void> {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : Uint8Array.from(data)
    return call('shell.write', this.pid, bytes)
  }

  kill(): Promise<void> {
    return call('shell.kill', this.pid)
  }
}

/**
 * A process the main process may start: `name` is an entry of the desktop shell allowlist,
 * which pins the program and the arguments it accepts.
 */
export class Command extends Listeners {
  readonly stdout = new Listeners()
  readonly stderr = new Listeners()

  private constructor(
    private readonly name: string,
    private readonly args: string[],
    private readonly options: SpawnOptions
  ) {
    super()
  }

  static create(name: string, args: string | string[] = [], options: SpawnOptions = {}): Command {
    return new Command(name, Array.isArray(args) ? args : [args], options)
  }

  async spawn(): Promise<Child> {
    const raw = this.options.encoding === 'raw'
    const pid = await call<number>('shell.spawn', this.name, this.args, {
      cwd: this.options.cwd,
      env: this.options.env ?? {},
      raw
    })
    const stops: (() => void)[] = []
    const on = (event: string, handler: (payload: unknown) => void) =>
      stops.push(native().on(`shell:${pid}:${event}`, handler))
    const data = (payload: unknown) =>
      raw ? new Uint8Array(payload as ArrayBuffer) : (payload as string)
    on('stdout', (payload) => this.stdout.emit('data', data(payload)))
    on('stderr', (payload) => this.stderr.emit('data', data(payload)))
    on('error', (payload) => this.emit('error', payload))
    on('close', (payload) => {
      for (const stop of stops) stop()
      this.emit('close', payload as TerminatedPayload)
    })
    return new Child(pid)
  }
}
