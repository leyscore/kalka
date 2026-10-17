import { uniq } from 'es-toolkit'

import type { SceneGraph } from '@kalka/scene-graph'

import { UNSUPPORTED_PLUGIN_API, type FigmaAPI } from '#core/figma-api'

import { formatLogArgument, serializeScriptValue } from './serialize'
import { compileScript, type ScriptConsole } from './wrap'

const MAX_LOG_ENTRIES = 200
const MAX_LOG_LENGTH = 2000

export type ScriptLogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

export interface ScriptLogEntry {
  level: ScriptLogLevel
  message: string
}

/** What a script did to the document, by layer ID. */
export interface ScriptChanges {
  createdNodeIds: string[]
  changedNodeIds: string[]
  removedNodeIds: string[]
}

export interface FigmaScriptResult extends ScriptChanges {
  /** The script's return value as JSON. */
  result: unknown
  /** What the script wrote to `console`, and `figma.notify` messages. */
  logs: ScriptLogEntry[]
}

/**
 * A script that threw. As Figma's `use_figma` reports it, `safeToRetryWithoutCanvasRead` says
 * whether the document is as it was: when it is false the script changed layers before it failed,
 * and those changes stay (one undo step reverts them).
 */
export class FigmaScriptError extends Error {
  readonly safeToRetryWithoutCanvasRead: boolean

  constructor(
    readonly scriptError: unknown,
    readonly changes: ScriptChanges,
    readonly logs: ScriptLogEntry[]
  ) {
    const changed =
      changes.createdNodeIds.length + changes.changedNodeIds.length + changes.removedNodeIds.length
    super(scriptErrorMessage(scriptError, changes, logs, changed === 0))
    this.name = 'FigmaScriptError'
    this.safeToRetryWithoutCanvasRead = changed === 0
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return `Error: ${formatLogArgument(error)}`
}

function scriptErrorMessage(
  cause: unknown,
  changes: ScriptChanges,
  logs: readonly ScriptLogEntry[],
  safe: boolean
): string {
  const lines = [`The script failed: ${describeError(cause)}`]
  lines.push(`safeToRetryWithoutCanvasRead: ${safe}`)
  if (!safe) {
    lines.push(
      'It changed the document before failing, and those changes stay; read the layers below before writing again.',
      `createdNodeIds: ${JSON.stringify(changes.createdNodeIds)}`,
      `changedNodeIds: ${JSON.stringify(changes.changedNodeIds)}`,
      `removedNodeIds: ${JSON.stringify(changes.removedNodeIds)}`
    )
  }
  if (logs.length > 0) {
    lines.push('Console output:', ...logs.map(({ level, message }) => `[${level}] ${message}`))
  }
  return lines.join('\n')
}

function captureConsole(logs: ScriptLogEntry[]): ScriptConsole {
  const write =
    (level: ScriptLogLevel) =>
    (...args: unknown[]) => {
      if (logs.length >= MAX_LOG_ENTRIES) return
      const message = args.map(formatLogArgument).join(' ')
      logs.push({
        level,
        message: message.length > MAX_LOG_LENGTH ? `${message.slice(0, MAX_LOG_LENGTH)}…` : message
      })
      if (logs.length === MAX_LOG_ENTRIES) {
        logs.push({ level: 'warn', message: `Output stopped after ${MAX_LOG_ENTRIES} entries` })
      }
    }
  return {
    log: write('log'),
    info: write('info'),
    warn: write('warn'),
    error: write('error'),
    debug: write('debug')
  }
}

/** Records the layers a script creates, changes, and removes, from the graph's own reports. */
function trackChanges(graph: SceneGraph): { stop: () => ScriptChanges } {
  const created = new Set<string>()
  const touched = new Set<string>()
  const stopObserving = graph.observeNodeChanges({
    created: (node) => created.add(node.id),
    before: (node) => touched.add(node.id)
  })
  const deleted = new Set<string>()
  const stopEvents = graph.onNodeEvents({ deleted: (id) => deleted.add(id) })
  return {
    stop() {
      stopObserving()
      stopEvents()
      const removed = uniq([...touched, ...deleted]).filter(
        (id) => !created.has(id) && !graph.getNode(id)
      )
      const isLayer = (id: string) => {
        const node = graph.getNode(id)
        // Pages hold what the script made; the document root is not a layer either.
        return node !== undefined && node.type !== 'CANVAS' && id !== graph.rootId
      }
      return {
        createdNodeIds: [...created].filter((id) => graph.getNode(id) !== undefined),
        changedNodeIds: [...touched].filter((id) => !created.has(id) && isLayer(id)),
        removedNodeIds: removed
      }
    }
  }
}

function unsupportedMember(name: string): TypeError {
  const reason: string = Reflect.get(UNSUPPORTED_PLUGIN_API, name)
  return new TypeError(`figma.${name} is not supported in Kalka: ${reason}`)
}

/**
 * The `figma` a script sees: the document's API, where a Plugin API member Kalka lacks throws a
 * `TypeError` that says why rather than reading as `undefined`, and `figma.notify` writes to the
 * script's output, as there is no toast to show.
 */
function scriptGlobal(figma: FigmaAPI, output: ScriptConsole): FigmaAPI {
  return new Proxy(figma, {
    get(target, property, receiver) {
      if (property === 'notify') {
        return (message: unknown) => {
          output.info(`figma.notify: ${formatLogArgument(message)}`)
          return { cancel: () => undefined }
        }
      }
      if (
        typeof property === 'string' &&
        !(property in target) &&
        Object.hasOwn(UNSUPPORTED_PLUGIN_API, property)
      ) {
        throw unsupportedMember(property)
      }
      return Reflect.get(target, property, receiver)
    }
  })
}

/**
 * Runs a Figma Plugin API script against the document, as Figma's `use_figma` does: top-level
 * `await` and `return`, the `figma` and `kalka` globals, and a result that carries the return
 * value, the layers the script created, changed, and removed, and its console output.
 */
export async function runFigmaScript(figma: FigmaAPI, code: string): Promise<FigmaScriptResult> {
  const logs: ScriptLogEntry[] = []
  const output = captureConsole(logs)
  const tracking = trackChanges(figma.graph)
  let value: unknown
  try {
    value = await compileScript(code, { console: output })(scriptGlobal(figma, output))
  } catch (error) {
    throw new FigmaScriptError(error, tracking.stop(), logs)
  }
  return { result: serializeScriptValue(value), ...tracking.stop(), logs }
}
