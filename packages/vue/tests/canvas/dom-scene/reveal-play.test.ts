import { describe, expect, test } from 'bun:test'

import type { DomSceneProjector } from '#vue/canvas/dom-scene/projector'
import type { RevealStep } from '#vue/canvas/dom-scene/reveal/plan'
import { HOLD_TIMEOUT_MS, RevealPlayer } from '#vue/canvas/dom-scene/reveal/play'

interface FakeAnimation {
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
  cancelled: boolean
}

/** An element as the player uses it: animated, styled, and drawn or not. */
class FakeElement {
  isConnected = true
  readonly animations: FakeAnimation[] = []
  readonly ownerDocument = {
    defaultView: { getComputedStyle: () => ({ opacity: '0.5', clipPath: 'none' }) }
  }

  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    const animation: FakeAnimation = { keyframes, options, cancelled: false }
    this.animations.push(animation)
    return {
      cancel: () => {
        animation.cancelled = true
      }
    }
  }

  /** Hidden now by a hold that is still running. */
  hiddenAt(now: number, heldAt: number): boolean {
    return this.animations.some(
      (animation) =>
        !animation.cancelled &&
        animation.keyframes.every((frame) => frame.opacity === 0) &&
        now - heldAt < Number(animation.options.duration)
    )
  }
}

/**
 * The player reads only `elementOf` from the projector, and only animations and style from the
 * elements, so the stand-ins cover just that; this is the one place they are widened.
 */
function standIn<T>(double: object): T {
  return double as T
}

function setup() {
  const elements = new Map<string, FakeElement>()
  const projector = standIn<DomSceneProjector>({
    elementOf: (id: string) => {
      const element = elements.get(id)
      return element ? standIn<Element>(element) : null
    }
  })
  return { elements, player: new RevealPlayer(projector) }
}

const appear = (id: string, delay = 0): RevealStep => ({ id, kind: 'appear', delay, duration: 200 })

describe('new layers held until their reveal', () => {
  test('a held layer is hidden as soon as it is drawn, and shows when its reveal starts', () => {
    const { elements, player } = setup()
    player.hold(['card'], 0)
    player.tick(10)
    const card = new FakeElement()
    elements.set('card', card)
    player.tick(20)
    expect(card.hiddenAt(20, 20)).toBe(true)

    player.play([appear('card', 100)], 30)
    player.tick(40)
    expect(card.hiddenAt(40, 20)).toBe(false)
    // The reveal fades it in to its own opacity, hidden until its delay by its first frame.
    const reveal = card.animations.at(-1)
    expect(reveal?.keyframes.at(-1)?.opacity).toBe('0.5')
    expect(reveal?.options).toMatchObject({ delay: 90, fill: 'backwards' })
    expect(player.busy).toBe(false)
  })

  test('the hiding ends by itself, so nothing stays hidden if the reveal never comes', () => {
    const { elements, player } = setup()
    const card = new FakeElement()
    elements.set('card', card)
    player.hold(['card'], 0)
    player.tick(0)
    expect(card.animations[0]?.options.duration).toBe(HOLD_TIMEOUT_MS)
    // No fill: the hiding lasts only while it runs.
    expect(card.animations[0]?.options.fill).toBeUndefined()
    player.tick(HOLD_TIMEOUT_MS)
    expect(player.holding.size).toBe(0)
    expect(player.busy).toBe(false)
  })

  test('released layers show at once, all of them when the view changes page', () => {
    const { elements, player } = setup()
    const a = new FakeElement()
    const b = new FakeElement()
    elements.set('a', a)
    elements.set('b', b)
    player.hold(['a', 'b'], 0)
    player.tick(0)
    player.release(['a'])
    expect(a.hiddenAt(1, 0)).toBe(false)
    expect(b.hiddenAt(1, 0)).toBe(true)
    player.release()
    expect(b.hiddenAt(1, 0)).toBe(false)
  })

  test('a layer redrawn as a new element is hidden again', () => {
    const { elements, player } = setup()
    elements.set('card', new FakeElement())
    player.hold(['card'], 0)
    player.tick(0)
    const redrawn = new FakeElement()
    elements.set('card', redrawn)
    player.tick(16)
    expect(redrawn.hiddenAt(16, 16)).toBe(true)
  })

  test('a step whose layer never draws gives up and shows it', () => {
    const { player } = setup()
    player.hold(['elsewhere'], 0)
    player.play([appear('elsewhere')], 0)
    player.tick(2000)
    expect(player.holding.size).toBe(0)
  })

  test('destroying the player shows everything it held', () => {
    const { elements, player } = setup()
    const card = new FakeElement()
    elements.set('card', card)
    player.hold(['card'], 0)
    player.tick(0)
    player.destroy()
    expect(card.hiddenAt(1, 0)).toBe(false)
  })
})
