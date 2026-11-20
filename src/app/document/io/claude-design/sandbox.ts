import type { DesignValues } from '@kalka/core/io/formats/claude-design'

import { SANDBOX_PATH } from '@/app/code/sandbox/document'

/** How long one component's logic may run before its holes fall back to their defaults. */
const RUN_TIMEOUT_MS = 2_000
const READY_TIMEOUT_MS = 5_000

/**
 * A Design Component's logic (`class Component extends DCLogic`) runs in a worker of the Design
 * JSX sandbox page, an opaque-origin iframe with no network: the page runs whatever worker source
 * the editor sends. The worker stands in for the DCLogic base class, mounts the component on a
 * clock of its own so the timers a design animates with advance at once to five seconds after it
 * mounted, and returns what `renderVals()` gives then, without handlers or anything else that is
 * not data.
 */
const WORKER_SOURCE = String.raw`
self.onmessage = ({ data }) => {
  const { id } = data
  const blocked = () => { throw new Error('Network access is unavailable.') }
  self.fetch = blocked
  self.XMLHttpRequest = undefined
  self.WebSocket = undefined
  self.EventSource = undefined
  self.importScripts = blocked
  const SETTLE_AT = 5000
  const MAX_FIRES = 5000
  const MAX_DEPTH = 24
  const MAX_ITEMS = 2000
  try {
    const { script, props } = JSON.parse(data.code)
    let now = 0
    let nextTimer = 1
    const timers = new Map()
    const schedule = (fn, delay, repeat) => {
      if (typeof fn !== 'function') return 0
      const wait = Math.max(0, Number(delay) || 0)
      const timer = nextTimer++
      timers.set(timer, { fn, at: now + wait, every: repeat ? Math.max(16, wait) : 0 })
      return timer
    }
    const cancel = (timer) => { timers.delete(timer) }
    self.setTimeout = (fn, delay) => schedule(fn, delay, false)
    self.setInterval = (fn, delay) => schedule(fn, delay, true)
    self.clearTimeout = cancel
    self.clearInterval = cancel
    self.requestAnimationFrame = (fn) => schedule(() => fn(now), 16, false)
    self.cancelAnimationFrame = cancel

    class DCLogic {
      constructor(props) {
        this.props = props || {}
        this.state = {}
      }
      setState(update, done) {
        const next = typeof update === 'function' ? update(this.state, this.props) : update
        if (next && typeof next === 'object') this.state = Object.assign({}, this.state, next)
        if (typeof done === 'function') done()
      }
      forceUpdate(done) {
        if (typeof done === 'function') done()
      }
    }
    const Component = new Function('DCLogic', script + '\n;return typeof Component === "function" ? Component : undefined')(DCLogic)
    if (typeof Component !== 'function') throw new Error('No Component class')
    // Logic that listens to the window or measures the page finds a stand-in for both; a mount
    // that still fails leaves the state its constructor set.
    self.window = self
    self.document = { addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, documentElement: { clientWidth: 1440, clientHeight: 900 }, body: null }
    self.innerWidth = 1440
    self.innerHeight = 900
    const instance = new Component(props)
    if (typeof instance.componentDidMount === 'function') {
      try { instance.componentDidMount() } catch {}
    }

    // Advance the design's own clock to a fixed moment, as a person who opened it and waited
    // a few seconds sees it.
    let fires = 0
    while (timers.size > 0 && fires < MAX_FIRES) {
      let nextId = 0
      let next = null
      for (const [timer, entry] of timers) if (!next || entry.at < next.at) { next = entry; nextId = timer }
      if (next.at > SETTLE_AT) break
      now = next.at
      if (next.every) next.at = now + next.every
      else timers.delete(nextId)
      fires++
      try { next.fn() } catch {}
    }

    const values = instance.renderVals()
    const seen = new Set()
    const plain = (value, depth) => {
      if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
      if (typeof value === 'number') return Number.isFinite(value) ? value : null
      if (typeof value !== 'object' || depth > MAX_DEPTH || seen.has(value)) return undefined
      seen.add(value)
      let out
      if (Array.isArray(value)) out = value.slice(0, MAX_ITEMS).map((item) => { const v = plain(item, depth + 1); return v === undefined ? null : v })
      else {
        out = {}
        for (const key of Object.keys(value).slice(0, MAX_ITEMS)) {
          const v = plain(value[key], depth + 1)
          if (v !== undefined) out[key] = v
        }
      }
      seen.delete(value)
      return out
    }
    self.postMessage({ id, ok: true, value: plain(values, 0) })
  } catch (error) {
    self.postMessage({ id, ok: false, error: String(error && error.message || error) })
  }
}
`

type SandboxMessage = { type?: string; id?: string; ok?: boolean; value?: unknown }

function isValues(value: unknown): value is DesignValues {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** One sandbox page for an import's components, which runs each component's logic in turn. */
export interface DesignLogicSandbox {
  /** What the component's `renderVals()` returns with these props; null when it cannot run. */
  run(script: string, props: DesignValues): Promise<DesignValues | null>
  close(): void
}

/** A value that arrives after `ms`, to race a reply that may never come. */
function after<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

export function openDesignLogicSandbox(): DesignLogicSandbox {
  const iframe = document.createElement('iframe')
  iframe.hidden = true
  iframe.setAttribute('sandbox', 'allow-scripts')
  iframe.src = new URL(SANDBOX_PATH, window.location.origin).href

  const waiting = new Map<string, (value: DesignValues | null) => void>()
  let ready: Promise<boolean> | null = null
  let markReady: ((value: boolean) => void) | null = null

  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow || event.origin !== 'null') return
    const message = (event.data ?? {}) as SandboxMessage
    if (message.type === 'kalka-design-jsx-ready') {
      markReady?.(true)
      return
    }
    if (message.type !== 'kalka-design-jsx-result' || !message.id) return
    waiting.get(message.id)?.(message.ok && isValues(message.value) ? message.value : null)
  }

  function start(): Promise<boolean> {
    ready ??= Promise.race([
      new Promise<boolean>((resolve) => {
        markReady = resolve
        window.addEventListener('message', onMessage)
        document.body.append(iframe)
      }),
      after(READY_TIMEOUT_MS, false)
    ])
    return ready
  }

  return {
    async run(script, props) {
      if (!(await start())) return null
      const id = crypto.randomUUID()
      const reply = new Promise<DesignValues | null>((resolve) => {
        waiting.set(id, resolve)
      })
      iframe.contentWindow?.postMessage(
        {
          type: 'kalka-design-jsx-run',
          id,
          code: JSON.stringify({ script, props }),
          workerSource: WORKER_SOURCE
        },
        '*'
      )
      try {
        return await Promise.race([reply, after(RUN_TIMEOUT_MS, null)])
      } finally {
        waiting.delete(id)
      }
    },
    close() {
      window.removeEventListener('message', onMessage)
      iframe.remove()
      for (const resolve of waiting.values()) resolve(null)
      waiting.clear()
    }
  }
}
