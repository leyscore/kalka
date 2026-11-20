import { afterEach, describe, expect, test } from 'bun:test'

import { effectScope, ref } from 'vue'

import { useCanvasOverlayObstacles } from '@/app/editor/canvas/obstacles'

import { asDouble } from '#tests/helpers/doubles'

/** An element whose box reads count, as reading one forces a layout. */
function element(rect: { left: number; top: number; width: number; height: number }) {
  const box = { ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height }
  const reads = { count: 0 }
  return {
    reads,
    getBoundingClientRect: () => {
      reads.count++
      return box
    }
  }
}

const listeners = new Map<string, () => void>()
afterEach(() => {
  listeners.clear()
  Reflect.deleteProperty(globalThis, 'document')
  Reflect.deleteProperty(globalThis, 'window')
})

function install(obstacles: () => unknown[]) {
  Object.assign(globalThis, {
    document: { querySelectorAll: obstacles },
    window: {
      addEventListener: (name: string, listener: () => void) => listeners.set(name, listener),
      removeEventListener: (name: string) => listeners.delete(name)
    }
  })
}

describe('obstacles over the canvas', () => {
  test('are read once, and again only when the floating UI changes', () => {
    const toolbar = element({ left: 100, top: 500, width: 200, height: 40 })
    let shown: unknown[] = [toolbar]
    install(() => shown)
    const canvas = element({ left: 50, top: 0, width: 800, height: 600 })
    const scope = effectScope()
    const read = scope.run(() => useCanvasOverlayObstacles(ref(asDouble<HTMLElement>(canvas))))
    if (!read) throw new Error('No reader')

    expect(read()).toEqual([{ x: 50, y: 500, width: 200, height: 40 }])
    for (let frame = 0; frame < 30; frame++) read()
    expect(toolbar.reads.count).toBe(1)

    // Another toolbar, such as the mobile one, is read anew.
    const mobile = element({ left: 60, top: 560, width: 100, height: 30 })
    shown = [mobile]
    expect(read()).toEqual([{ x: 10, y: 560, width: 100, height: 30 }])
    read()
    expect(mobile.reads.count).toBe(1)

    shown = []
    expect(read()).toEqual([])
    scope.stop()
  })
})
