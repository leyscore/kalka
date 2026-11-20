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

  test('keeps an open details element open, and leaves out what a closed one hides', async ({
    page
  }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<details open><summary>Shown question</summary><p>Shown answer</p></details>
       <details><summary>Closed question</summary><p>Hidden answer</p></details>`
    )
    const texts = layers.filter((layer) => layer.type === 'TEXT').map((layer) => layer.text)
    expect(texts).toEqual(
      expect.arrayContaining(['Shown question', 'Shown answer', 'Closed question'])
    )
    expect(texts).not.toContain('Hidden answer')
  })

  test('keeps text for screen readers only as a hidden layer', async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<div style="position:relative;padding:20px"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Feature</span>Shown</div>`
    )
    expect(layers.find((layer) => layer.text === 'Feature')?.visible).toBe(false)
  })

  test('measures a scaled container before its scale, which it keeps', async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<div style="position:relative;width:400px;height:200px"><div class="zoomed" style="position:absolute;left:0;top:0;width:200px;height:100px;transform:scale(2);transform-origin:0 0"><div class="inner" style="position:absolute;left:10px;top:10px;width:50px;height:20px;background:#000"></div></div></div>`
    )
    const zoomed = layers.find((layer) => layer.name === 'zoomed')
    expect(zoomed).toMatchObject({ width: 200, height: 100 })
    expect(zoomed?.style.transform).toBe('scale(2)')
    expect(layers.find((layer) => layer.name === 'inner')).toMatchObject({
      x: 10,
      y: 10,
      width: 50
    })
  })

  test('places a child of a bordered box from inside its border, as CSS does', async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<div class="card" style="position:relative;width:300px;height:200px;border:4px solid #000"><div class="badge" style="position:absolute;left:20px;top:30px;width:40px;height:20px;background:#f00"></div></div>`
    )
    expect(layers.find((layer) => layer.name === 'badge')).toMatchObject({ x: 20, y: 30 })
  })

  test('places a translated layer where the layout put it, keeping its translation', async ({
    page
  }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<div style="position:relative;width:400px;height:200px"><div class="bar" style="position:absolute;left:50%;bottom:20px;transform:translateX(-50%);width:100px;height:40px;background:#000"></div></div>`
    )
    const bar = layers.find((layer) => layer.name === 'bar')
    expect(bar).toMatchObject({ x: 200, y: 140 })
    expect(bar?.style.transform).toBe('translateX(-50%)')
  })

  test("draws a field's placeholder, or its value, as the page shows it", async ({ page }) => {
    const layers = await publicBrowserHTMLLayers(
      page,
      `<style>input::placeholder{color:#888}</style><div style="padding:20px"><input style="width:300px;height:40px;padding:0 12px;border:1px solid #ccc;font-size:15px" placeholder="Describe a page"><input style="width:300px;height:40px;padding:0 12px;font-size:15px" value="Sam"></div>`
    )
    const texts = layers.filter((layer) => layer.type === 'TEXT').map((layer) => layer.text)
    expect(texts).toEqual(expect.arrayContaining(['Describe a page', 'Sam']))
  })
})
