import type { Page } from '@playwright/test'

/** How the canvas draws one artboard: its live iframe, or what stands in for it while it sleeps. */
export interface ArtboardDrawing {
  /** The tier the projector holds it at. */
  tier: string | null
  /** Whether it has a live iframe. */
  live: boolean
  /** Whether that iframe paints on screen. */
  painted: boolean
  /** The element standing in for it: a snapshot `canvas` or a placeholder `div`; null when none. */
  standIn: string | null
  /** Whether everything that draws it is hidden, as while a preview stands in for it. */
  hidden: boolean
  /** The text its live document draws, empty without one. */
  text: string
}

/** Probes how the canvas draws an artboard, by its layer id. */
export function artboardDrawing(page: Page, id: string): Promise<ArtboardDrawing> {
  return page.evaluate((artboardId) => {
    const frame = document.querySelector<HTMLIFrameElement>(
      `iframe[data-kalka-artboard="${artboardId}"]`
    )
    const standIn = document.querySelector<HTMLElement>(`[data-kalka-stand-in="${artboardId}"]`)
    const drawn = [frame, standIn].filter((element): element is HTMLElement => element !== null)
    const tier = drawn[0]?.dataset.kalkaTier ?? null
    return {
      tier,
      live: frame !== null,
      painted: frame !== null && getComputedStyle(frame).visibility !== 'hidden',
      standIn: standIn?.localName ?? null,
      hidden: drawn.length > 0 && drawn.every((el) => getComputedStyle(el).visibility === 'hidden'),
      text: frame?.contentDocument?.body?.textContent ?? ''
    }
  }, id)
}

/** Shows an artboard's top-left corner at 100 %, as navigating to it does. */
export async function showArtboard(page: Page, id: string): Promise<void> {
  await page.evaluate((artboardId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const position = store.graph.getAbsolutePosition(artboardId)
    store.state.zoom = 1
    store.state.panX = 40 - position.x
    store.state.panY = 40 - position.y
    store.requestRepaint()
  }, id)
}
