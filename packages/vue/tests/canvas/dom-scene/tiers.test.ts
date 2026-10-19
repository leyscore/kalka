import { describe, expect, test } from 'bun:test'

import {
  PICTURE_ZOOM,
  TIER_REACH,
  artboardTier,
  isLive,
  screenDistance,
  type TierView
} from '#vue/canvas/dom-scene/tiers'

/** A 1000 × 800 screen at 100 %, showing the canvas from its origin. */
const view: TierView = { panX: 0, panY: 0, zoom: 1, width: 1000, height: 800 }

/** A 100 × 100 artboard whose left edge lies `screens` screen widths right of the screen's. */
const artboardAt = (screens: number) => ({ x: screens * 1000, y: 100, width: 100, height: 100 })

describe('artboard tiers', () => {
  test('an artboard on screen is visible, then near, far and dormant as it lies farther', () => {
    expect(artboardTier(artboardAt(0.5), view, null)).toBe('visible')
    expect(artboardTier(artboardAt(1.5), view, null)).toBe('near')
    expect(artboardTier(artboardAt(3), view, null)).toBe('far')
    expect(artboardTier(artboardAt(6), view, null)).toBe('dormant')
  })

  test('an artboard straddling the screen edge is visible', () => {
    expect(artboardTier({ x: -50, y: -50, width: 100, height: 100 }, view, null)).toBe('visible')
  })

  test('moving away keeps an artboard in its tier until it is past the tier it leaves', () => {
    // Just past the screen: entered as near, but one that was visible stays so a little longer.
    const justOff = artboardAt(1 + TIER_REACH.leave.visible / 2)
    expect(artboardTier(justOff, view, null)).toBe('near')
    expect(artboardTier(justOff, view, 'visible')).toBe('visible')
    // Past the margin it leaves.
    expect(artboardTier(artboardAt(1 + TIER_REACH.leave.visible + 0.1), view, 'visible')).toBe(
      'near'
    )
    // Between the near tier's reach and where it leaves it.
    const pastNear = artboardAt(1 + (TIER_REACH.enter.near + TIER_REACH.leave.near) / 2)
    expect(artboardTier(pastNear, view, null)).toBe('far')
    expect(artboardTier(pastNear, view, 'near')).toBe('near')
    const pastFar = artboardAt(1 + (TIER_REACH.enter.far + TIER_REACH.leave.far) / 2)
    expect(artboardTier(pastFar, view, null)).toBe('dormant')
    expect(artboardTier(pastFar, view, 'far')).toBe('far')
  })

  test('coming closer takes the nearest tier it enters at once', () => {
    expect(artboardTier(artboardAt(0.5), view, 'dormant')).toBe('visible')
    expect(artboardTier(artboardAt(1.5), view, 'dormant')).toBe('near')
  })

  test('an artboard that drops more than one tier lands in the nearest it has not left', () => {
    // Jumped from on screen to far away, as when the view moves to another spot at once.
    expect(artboardTier(artboardAt(1 + TIER_REACH.leave.near + 0.2), view, 'visible')).toBe('far')
    expect(artboardTier(artboardAt(10), view, 'visible')).toBe('dormant')
  })

  test('a pan back and forth over a boundary keeps the tier instead of flapping', () => {
    const bounds = artboardAt(1)
    let tier = artboardTier(bounds, view, null)
    const seen = new Set([tier])
    for (let step = 0; step < 20; step++) {
      const panX = step % 2 === 0 ? -40 : 40
      tier = artboardTier(bounds, { ...view, panX }, tier)
      seen.add(tier)
    }
    expect(seen.size).toBe(1)
  })

  test('zooming out brings far artboards closer', () => {
    const bounds = artboardAt(5)
    expect(artboardTier(bounds, view, null)).toBe('dormant')
    expect(artboardTier(bounds, { ...view, zoom: 0.2 }, 'dormant')).toBe('pictured')
  })

  test('a view of no size yet holds artboards live', () => {
    expect(artboardTier(artboardAt(10), { ...view, width: 0 }, null)).toBe('visible')
    expect(artboardTier(artboardAt(10), { ...view, width: 0 }, 'far')).toBe('far')
  })

  test('an artboard on screen is pictured once zoomed out so far a snapshot shows every pixel', () => {
    const card = { x: 0, y: 0, width: 1400, height: 1000 }
    expect(artboardTier(card, { ...view, zoom: 0.1 }, null, 2)).toBe('pictured')
    // Zoomed in closer, it is live again.
    expect(artboardTier(card, { ...view, zoom: 0.5 }, 'pictured', 2)).toBe('visible')
    // Far out but large, a snapshot at full resolution would be too big: it stays live.
    const poster = { x: 0, y: 0, width: 8000, height: 8000 }
    expect(artboardTier(poster, { ...view, zoom: 0.2 }, null, 2)).toBe('visible')
    // Off screen, distance decides.
    expect(artboardTier({ ...card, x: 20_000 }, { ...view, zoom: 0.1 }, null, 2)).toBe('near')
  })

  test('a pictured artboard stays pictured a little past the zoom it entered at', () => {
    const card = { x: 0, y: 0, width: 400, height: 300 }
    const between = { ...view, zoom: (PICTURE_ZOOM.enter + PICTURE_ZOOM.leave) / 2 }
    expect(artboardTier(card, between, 'visible', 1)).toBe('visible')
    expect(artboardTier(card, between, 'pictured', 1)).toBe('pictured')
  })

  test('only the visible and near tiers are live', () => {
    expect(isLive('pictured')).toBe(false)
    expect(isLive('visible')).toBe(true)
    expect(isLive('near')).toBe(true)
    expect(isLive('far')).toBe(false)
    expect(isLive('dormant')).toBe(false)
  })

  test('the distance from the screen orders what to snapshot first', () => {
    expect(screenDistance(artboardAt(0.5), view)).toBe(0)
    expect(screenDistance(artboardAt(2), view)).toBe(1000)
    expect(screenDistance({ x: -300, y: -500, width: 100, height: 100 }, view)).toBe(
      Math.hypot(200, 400)
    )
  })
})
