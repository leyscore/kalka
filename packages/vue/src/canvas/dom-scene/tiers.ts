import type { ViewportTransform } from '@kalka/core/geometry'
import type { Rect, Size } from '@kalka/scene-graph/primitives'

/**
 * How much of an artboard the canvas keeps, from how far it lies from what the view shows:
 *
 * - `visible`: on screen, a live iframe that paints.
 * - `pictured`: on screen, but drawn so small, the view zoomed far out, that a snapshot at full
 *   resolution shows it as well as its iframe would: the snapshot, without an iframe.
 * - `near`: within about a view of the screen, a live iframe that does not paint, so it shows
 *   at once when it comes on screen.
 * - `far`: a few views away, a snapshot bitmap in place of an iframe; the iframe's document and
 *   script realm are freed. It wakes again on approach, before it comes on screen.
 * - `dormant`: farther still, or never approached: neither iframe nor snapshot, only a
 *   placeholder of its fill and size.
 */
export type ArtboardTier = 'visible' | 'pictured' | 'near' | 'far' | 'dormant'

/** The tiers by distance from the screen; a pictured artboard is visible at this step. */
type DistanceTier = Exclude<ArtboardTier, 'pictured'>

const ORDER: readonly DistanceTier[] = ['visible', 'near', 'far', 'dormant']

/** Pixels a snapshot holds at most: a mebibyte, at four bytes a pixel. */
export const SNAPSHOT_MAX_PIXELS = 262_144

/**
 * The zoom at or below which an artboard on screen is pictured, when a snapshot of it at full
 * resolution fits {@link SNAPSHOT_MAX_PIXELS}. One pictured stays so up to `leave`.
 */
export const PICTURE_ZOOM = { enter: 0.25, leave: 0.3 } as const

/** The screen the canvas shows: its pan and zoom, and its size in CSS pixels. */
export type TierView = ViewportTransform & Size

/**
 * How far past each edge of the screen a tier reaches, in screens. An artboard enters a tier
 * within `enter` and leaves it only past `leave`, so one sitting on a boundary does not wake and
 * sleep on every frame of a pan.
 */
export const TIER_REACH = {
  enter: { visible: 0, near: 1, far: 3 },
  leave: { visible: 0.25, near: 1.5, far: 4 }
} as const satisfies Record<'enter' | 'leave', Record<Exclude<DistanceTier, 'dormant'>, number>>

/** Whether `bounds`, in canvas units, overlaps the screen grown by `reach` screens on each side. */
function within(bounds: Rect, view: TierView, reach: number): boolean {
  const left = bounds.x * view.zoom + view.panX
  const top = bounds.y * view.zoom + view.panY
  const right = left + bounds.width * view.zoom
  const bottom = top + bounds.height * view.zoom
  const marginX = view.width * reach
  const marginY = view.height * reach
  return (
    right >= -marginX &&
    left <= view.width + marginX &&
    bottom >= -marginY &&
    top <= view.height + marginY
  )
}

/**
 * The tier of an artboard whose drawn bounds, in canvas units, are `bounds`, given the tier it
 * has now (null for one not placed yet). Coming closer takes the nearest tier it enters; moving
 * away keeps the nearest tier it has not yet left. On screen, it is pictured while the view is
 * zoomed out far enough that a snapshot of it at `pixelRatio` shows every pixel it draws.
 */
export function artboardTier(
  bounds: Rect,
  view: TierView,
  current: ArtboardTier | null,
  pixelRatio = 1
): ArtboardTier {
  if (view.width <= 0 || view.height <= 0 || !(view.zoom > 0)) return current ?? 'visible'
  const tier = distanceTier(bounds, view, current === 'pictured' ? 'visible' : current)
  if (tier !== 'visible') return tier
  return pictured(bounds, view, pixelRatio, current === 'pictured') ? 'pictured' : 'visible'
}

function distanceTier(bounds: Rect, view: TierView, current: DistanceTier | null): DistanceTier {
  const entered =
    ORDER.find((tier) => tier !== 'dormant' && within(bounds, view, TIER_REACH.enter[tier])) ??
    'dormant'
  if (current === null || ORDER.indexOf(entered) <= ORDER.indexOf(current)) return entered
  return (
    ORDER.slice(ORDER.indexOf(current)).find(
      (tier) => tier !== 'dormant' && within(bounds, view, TIER_REACH.leave[tier])
    ) ?? 'dormant'
  )
}

/** Whether a snapshot at full resolution draws the artboard as well as its iframe does. */
function pictured(bounds: Rect, view: TierView, pixelRatio: number, was: boolean): boolean {
  if (view.zoom > (was ? PICTURE_ZOOM.leave : PICTURE_ZOOM.enter)) return false
  const scale = view.zoom * pixelRatio
  // One pictured keeps its snapshot a little past the budget, so a zoom does not flip it.
  return bounds.width * bounds.height * scale * scale <= SNAPSHOT_MAX_PIXELS * (was ? 1.5 : 1)
}

/** How far `bounds` lie from the screen, in CSS pixels; 0 when on it. */
export function screenDistance(bounds: Rect, view: TierView): number {
  const left = bounds.x * view.zoom + view.panX
  const top = bounds.y * view.zoom + view.panY
  const dx = Math.max(0, -(left + bounds.width * view.zoom), left - view.width)
  const dy = Math.max(0, -(top + bounds.height * view.zoom), top - view.height)
  return Math.hypot(dx, dy)
}

/** Lower is closer to the screen; a pictured artboard is on it. */
export function rank(tier: ArtboardTier): number {
  return tier === 'pictured' ? 0 : ORDER.indexOf(tier)
}

/** Whether a tier holds a live iframe. */
export function isLive(tier: ArtboardTier): boolean {
  return tier === 'visible' || tier === 'near'
}
