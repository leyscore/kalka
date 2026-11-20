import { afterAll, afterEach, describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { ArtboardTierWork, REST_MS, type TierProjector } from '#vue/canvas/dom-scene/tier-work'

const idle: Array<() => void> = []
const original = Reflect.get(globalThis, 'window')
Reflect.set(globalThis, 'window', {
  requestIdleCallback: (task: () => void) => idle.push(task),
  cancelIdleCallback: () => undefined
})
afterEach(() => {
  idle.length = 0
})
afterAll(() => {
  if (original === undefined) Reflect.deleteProperty(globalThis, 'window')
  else Reflect.set(globalThis, 'window', original)
})

/** A projector with one sleeping artboard's snapshot left to take. */
function projector() {
  const work = { captures: 0 }
  const stub: TierProjector = {
    get world(): HTMLElement {
      throw new Error('The view is not followed here')
    },
    setView: () => undefined,
    applyTiers: () => false,
    nextUnmeasured: () => null,
    markMeasured: () => undefined,
    get needsCapture() {
      return work.captures === 0
    },
    captureNext: async () => {
      work.captures++
      return true
    }
  }
  return { work, projector: stub }
}

describe('artboard idle work', () => {
  test('waits while a gesture edits layers and runs once it ends', async () => {
    const { work, projector: p } = projector()
    let transforming = true
    let redraws = 0
    const tiers = new ArtboardTierWork(
      p,
      () => new SceneGraph(),
      () => {
        redraws++
        tiers.apply()
      },
      () => transforming
    )
    tiers.apply()
    idle.shift()?.()
    await Bun.sleep(REST_MS + 20)
    expect(work.captures).toBe(0)
    expect(redraws).toBe(1)

    transforming = false
    idle.shift()?.()
    await Bun.sleep(0)
    expect(work.captures).toBe(1)
    tiers.destroy()
  })
})
