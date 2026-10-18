import { expect, test, type Locator, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

/** A MacBook Pro 14" at its default scaling, and the smallest common laptop window. */
const VIEWPORTS = [
  { width: 1512, height: 982 },
  { width: 1280, height: 800 }
]
const LOCALES = ['en-US', 'fr-FR']
/** Side panels at their old 10% floor, as a layout dragged narrow on a wider screen saves them. */
const NARROW_SAVED_LAYOUT = JSON.stringify([10, 80, 10])
/** The width, in CSS pixels, below which a truncated label no longer reads as a name. */
const MIN_READABLE_WIDTH = 40

interface TextLayoutIssue {
  kind: 'overlap' | 'clipped' | 'squeezed'
  text: string
  other?: string
}

/**
 * Lists the visible text inside `panel` that overlaps other text, that its panel cuts off without
 * an ellipsis, or that an ellipsis leaves too short to read. Text in a horizontal scroller, such as
 * the menubar, may scroll out of view.
 */
function textLayoutIssues(panel: Locator): Promise<TextLayoutIssue[]> {
  return panel.evaluate((root, minReadableWidth) => {
    const intersect = (a: DOMRect, b: DOMRect) => {
      const left = Math.max(a.left, b.left)
      const top = Math.max(a.top, b.top)
      return new DOMRect(
        left,
        top,
        Math.max(0, Math.min(a.right, b.right) - left),
        Math.max(0, Math.min(a.bottom, b.bottom) - top)
      )
    }

    /** The element's own text: its full extent, what an ellipsis shows, and what stays visible. */
    function measure(element: Element) {
      const nodes = [...element.childNodes].filter(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      )
      if (nodes.length === 0) return null
      if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null
      const own = element.getBoundingClientRect()
      // Screen-reader-only text is a 1px box by design.
      if (own.width <= 1 || own.height <= 1) return null

      const range = document.createRange()
      range.setStartBefore(nodes[0])
      range.setEndAfter(nodes[nodes.length - 1])
      const glyphs = range.getBoundingClientRect()
      let shown = glyphs
      let box = glyphs
      let scrolled = false
      for (let node: Element | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node)
        const clips = style.overflowX !== 'visible'
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') scrolled = true
        if (clips && style.textOverflow === 'ellipsis') {
          shown = intersect(shown, node.getBoundingClientRect())
        }
        if (clips || node === root) box = intersect(box, node.getBoundingClientRect())
        if (node === root) break
      }
      if (box.width < 1 || box.height < 1) return null
      return { element, text: (element.textContent ?? '').trim(), glyphs, shown, box, scrolled }
    }

    const issues: TextLayoutIssue[] = []
    const texts = [...root.querySelectorAll('*')].flatMap((element) => measure(element) ?? [])
    for (const { text, glyphs, shown, box, scrolled } of texts) {
      if (!scrolled && box.width < shown.width - 1) issues.push({ kind: 'clipped', text })
      // An ellipsis that leaves a letter or two is no more readable than clipped text.
      if (shown.width < Math.min(glyphs.width, minReadableWidth) - 1) {
        issues.push({ kind: 'squeezed', text })
      }
    }
    for (const [index, a] of texts.entries()) {
      for (const b of texts.slice(index + 1)) {
        if (a.element.contains(b.element) || b.element.contains(a.element)) continue
        const overlap = intersect(a.box, b.box)
        if (overlap.width > 1 && overlap.height > 1) {
          issues.push({ kind: 'overlap', text: a.text, other: b.text })
        }
      }
    }
    return issues
  }, MIN_READABLE_WIDTH)
}

async function openEditor(page: Page) {
  await page.goto('/demo?fixture')
  await new CanvasHelper(page).waitForInit()

  // Open a few levels of the tree so rows indent, then select a nested layer for its properties.
  const tree = page.getByTestId('layers-tree')
  for (let level = 0; level < 3; level++) {
    await tree.locator('[data-slot="disclosure"][aria-expanded="false"]').first().click()
  }
  await tree.getByTestId('layers-item').nth(3).click()
  await expect(page.getByTestId('design-panel-single')).toBeVisible()
  // Hover nothing, so row actions and tooltips stay out of the measured layout.
  await page.mouse.move(0, 0)
}

async function expectReadablePanels(page: Page) {
  for (const panel of [page.getByTestId('layers-panel'), page.getByTestId('properties-panel')]) {
    await expect(panel).toBeVisible()
    expect(await textLayoutIssues(panel)).toEqual([])
  }
}

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.width}×${viewport.height} in ${locale}`, () => {
      test.use({ viewport, locale })

      test('side panels show their text without overlap', async ({ page }) => {
        await openEditor(page)
        await expectReadablePanels(page)
      })
    })

    test.describe(`${viewport.width}×${viewport.height} in ${locale}, saved narrow`, () => {
      test.use({
        viewport,
        locale,
        // The shared state's preferences, plus side panels saved at the old 10% floor.
        storageState: async ({ baseURL }, use) => {
          if (!baseURL) throw new Error('Browser test baseURL is required')
          await use({
            cookies: [],
            origins: [
              {
                origin: new URL(baseURL).origin,
                localStorage: [
                  {
                    name: 'kalka:preferences:v1',
                    value: JSON.stringify({
                      version: 1,
                      onboarding: { aiSetup: 'done', welcome: 'done', tour: 'done' },
                      rendering: { canvasMode: 'retained', canvasBackground: 'document' }
                    })
                  },
                  { name: 'kalka:editor-layout', value: NARROW_SAVED_LAYOUT }
                ]
              }
            ]
          })
        }
      })

      test('a layout saved on a wider screen keeps the side panels readable', async ({ page }) => {
        await openEditor(page)
        await expectReadablePanels(page)
      })
    })
  }
}
