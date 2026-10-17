/** Slots of the relay's shared signal: whether an answer is posted, and the host's process id. */
export const ANSWERED = 0
export const HOST_PID = 1

/**
 * The worker thread between the CLI and its render host. Layout is synchronous, the host is
 * another process: the main thread posts a request and blocks on the shared signal while this
 * thread writes it to the host, reads the answer line and posts it back, then wakes it.
 *
 * Self-contained, since the worker runs its source: it reaches Node through
 * `process.getBuiltinModule` and is handed the host, the port and the signal as worker data.
 */
export function relayProgram(): void {
  const { parentPort, workerData, MessagePort } = process.getBuiltinModule('node:worker_threads')
  const { spawn } = process.getBuiltinModule('node:child_process')
  const { createInterface } = process.getBuiltinModule('node:readline')
  const data: unknown = workerData
  if (!parentPort || typeof data !== 'object' || data === null) return
  const executable: unknown = Reflect.get(data, 'executable')
  const args: unknown = Reflect.get(data, 'args')
  const port: unknown = Reflect.get(data, 'port')
  const signalBuffer: unknown = Reflect.get(data, 'signal')
  if (typeof executable !== 'string' || !Array.isArray(args)) return
  const argv = args.filter((arg): arg is string => typeof arg === 'string')
  if (!(port instanceof MessagePort) || !(signalBuffer instanceof SharedArrayBuffer)) return
  const signal = new Int32Array(signalBuffer)

  const answer = (line: string) => {
    port.postMessage(line)
    Atomics.store(signal, 0, 1)
    Atomics.notify(signal, 0)
  }
  const fail = (message: string) => answer(JSON.stringify({ id: -1, error: message }))

  let exited = false
  const start = () => {
    const env = { ...process.env }
    delete env.ELECTRON_RUN_AS_NODE
    const child = spawn(executable, argv, { env, stdio: ['pipe', 'pipe', 'ignore'] })
    if (child.pid) Atomics.store(signal, 1, child.pid)
    child.on('error', (error) => {
      exited = true
      fail(error.message)
    })
    child.on('exit', (code) => {
      exited = true
      // Its id may go to another process from now on.
      Atomics.store(signal, 1, 0)
      fail(`The render host exited (${code ?? 'signal'})`)
    })
    // Writing to a host that died fails; its exit answers the request.
    child.stdin.on('error', () => {
      exited = true
    })
    // The host's answers are the lines that start as its answers do; anything else Electron
    // prints is not for us.
    createInterface({ input: child.stdout, crlfDelay: Infinity }).on('line', (line) => {
      if (line.startsWith('{"id":')) answer(line)
    })
    return child
  }
  let host: ReturnType<typeof start> | null = null

  port.on('message', (message: unknown) => {
    if (typeof message !== 'string') return
    if (exited) return fail('The render host is not running')
    host ??= start()
    host.stdin.write(`${message}\n`)
  })
}
