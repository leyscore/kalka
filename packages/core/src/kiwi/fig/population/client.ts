import type { SceneGraph } from '@open-pencil/scene-graph'

import { getLazyFigImportContext } from '#core/kiwi/fig/lazy-import'
import { randomHex } from '#core/random'

import { applyFigPopulationDelta, type FigPopulationDelta } from './delta'

interface PopulationResult {
  type: 'population-result'
  requestId: string
  baseRevision: number
  populated: boolean
  delta: FigPopulationDelta
}
type WorkerResult = PopulationResult | { type: 'population-error'; error: string }

const MAX_FIG_POPULATION_WORKER_NODES = 200_000
const populationWorkers = new WeakMap<SceneGraph, Worker>()

export interface FigPopulationWorkerTelemetry {
  event: 'registered' | 'populate' | 'fallback' | 'stale' | 'terminated'
  reason?: 'oversized' | 'graph-mutation' | 'worker-error'
  durationMs?: number
  applyMs?: number
  created?: number
  updated?: number
  deleted?: number
}

function emitTelemetry(detail: FigPopulationWorkerTelemetry): void {
  if (typeof globalThis.dispatchEvent !== 'function') return
  globalThis.dispatchEvent(new CustomEvent('openpencil:fig-population-worker', { detail }))
}

export function registerFigPopulationWorker(graph: SceneGraph, worker: Worker): void {
  if (graph.nodes.size > MAX_FIG_POPULATION_WORKER_NODES) {
    emitTelemetry({ event: 'fallback', reason: 'oversized' })
    worker.terminate()
    return
  }
  populationWorkers.set(graph, worker)
  emitTelemetry({ event: 'registered' })
}

export function canUseFigPopulationWorker(graph: SceneGraph): boolean {
  return (
    import.meta.env.DEV &&
    populationWorkers.has(graph) &&
    getLazyFigImportContext(graph) !== undefined
  )
}

export interface FigPopulationWorker {
  populate: (pageId: string) => Promise<boolean | null>
  terminate: () => void
}

export function createFigPopulationWorker(graph: SceneGraph): FigPopulationWorker | null {
  if (!canUseFigPopulationWorker(graph)) return null
  const worker = populationWorkers.get(graph)
  if (!worker) return null
  const pending = new Map<
    string,
    { resolve: (value: boolean | null) => void; revision: number; startedAt: number }
  >()
  let revision = 0
  let stale = false
  let applyingDelta = false
  const invalidate = () => {
    if (applyingDelta || stale) return
    revision++
    stale = true
    emitTelemetry({ event: 'stale', reason: 'graph-mutation' })
  }
  const unbind = graph.onNodeEvents({
    created: invalidate,
    updated: invalidate,
    deleted: invalidate,
    reparented: invalidate,
    reordered: invalidate
  })
  const fail = (emit = true) => {
    stale = true
    if (emit) emitTelemetry({ event: 'fallback', reason: 'worker-error' })
    for (const request of pending.values()) request.resolve(null)
    pending.clear()
    worker.terminate()
    populationWorkers.delete(graph)
  }
  worker.onmessage = (event: MessageEvent<WorkerResult>) => {
    const result = event.data
    if (result.type === 'population-error') return fail()
    const request = pending.get(result.requestId)
    if (!request) return
    pending.delete(result.requestId)
    if (stale || revision !== request.revision || result.baseRevision !== request.revision) {
      emitTelemetry({ event: 'stale', reason: 'graph-mutation' })
      return request.resolve(null)
    }
    applyingDelta = true
    const applyStartedAt = performance.now()
    try {
      applyFigPopulationDelta(graph, result.delta)
      const context = getLazyFigImportContext(graph)
      if (context) context.populatedRootIds = new Set(result.delta.populatedRootIds)
    } catch {
      applyingDelta = false
      fail()
      return request.resolve(null)
    } finally {
      applyingDelta = false
    }
    request.resolve(result.populated)
    emitTelemetry({
      event: 'populate',
      durationMs: performance.now() - request.startedAt,
      applyMs: performance.now() - applyStartedAt,
      created: result.delta.created.length,
      updated: result.delta.updated.length,
      deleted: result.delta.deleted.length
    })
  }
  worker.onerror = () => fail()
  return {
    populate(pageId) {
      if (stale) return Promise.resolve(null)
      const requestId = randomHex()
      const baseRevision = revision
      return new Promise((resolve) => {
        pending.set(requestId, { resolve, revision: baseRevision, startedAt: performance.now() })
        worker.postMessage({ type: 'populate', requestId, baseRevision, pageId }, [])
      })
    },
    terminate() {
      emitTelemetry({ event: 'terminated' })
      unbind()
      fail(false)
    }
  }
}
