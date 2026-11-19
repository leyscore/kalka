import { publicBrowserHTMLLayers } from '#tests/helpers/dom-css-browser'

import { expect, test } from '../fixtures'

test.describe('HTML import draws as the page does', () => {
  test('keeps what a stylesheet rule says that the layer fields cannot', async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<style>:root{--dot:#33aa33}.dots{width:200px;height:100px;background-image:radial-gradient(circle,var(--dot) 0 1px,transparent 1.5px);background-size:8px 8px;transition:opacity 1s}</style>
       <div class="dots"></div>`
    )
    const dots = layers.find((layer) => layer.name === 'dots')
    expect(dots?.style['background-size']).toBe('8px 8px')
    // A variable stays with the page, so its value is kept as computed; motion is not kept.
    expect(dots?.style['background-image']).toContain('radial-gradient')
    expect(dots?.style['background-image']).not.toContain('var(')
    expect(dots?.style.transition).toBeUndefined()
  })

  test('imports an inline SVG as the image it draws, its colors resolved', async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<div style="color:#2F5BEA"><svg width="24" height="24" viewBox="0 0 24 24" aria-label="Check"><path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>`
    )
    const svg = layers.find((layer) => layer.name === 'Check')
    expect(svg).toMatchObject({ fills: ['IMAGE'], height: 24 })
    expect(layers.filter((layer) => layer.name === 'path')).toHaveLength(0)
  })

  test('places the words of a button taller than its line where the browser drew them', async ({
    page
  }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<a style="display:block;width:160px;height:48px;line-height:48px;background:#000;color:#fff;font-size:16px;text-align:center">Play 10 more</a>`
    )
    const label = layers.find((layer) => layer.type === 'TEXT')
    expect(label?.text).toBe('Play 10 more')
    // The line is 48px tall and its words sit in its middle, not at the top of the box.
    expect(label?.y).toBeGreaterThan(10)
    expect(label?.y).toBeLessThan(20)
  })
})
