/**
 * Loads a page in Chromium, takes its screenshots and reads back what the browser computed for
 * every visible element. Metrics, lint and the style vector are all computed from these records,
 * so a baseline page written in raw CSS and a genome page are measured in exactly the same way.
 */
import { pathToFileURL } from 'node:url'

import { chromium, type Browser } from '@playwright/test'

export type Box = {
  tag: string
  x: number
  y: number
  w: number
  h: number
  depth: number
  text: string
  ownText: number
  fontSize: number
  fontFamily: string
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  textTransform: string
  textAlign: string
  fontStyle: string
  color: string
  bg: string
  bgImage: string
  bgClipText: boolean
  radius: number
  shadow: string
  backdrop: boolean
  borderWidths: number[]
  borderColor: string
  padding: number[]
  margin: number[]
  gap: number[]
  display: string
  position: string
  childCount: number
  childSignature: string
  clipped: boolean
  effectiveBg: string | null
  parent: number
  fontLoaded: boolean
}

export type Measurement = {
  width: number
  height: number
  viewport: { width: number; height: number }
  scrollWidth: number
  boxes: Box[]
  text: string
  fontsFailed: string[]
  images: number
}

function measureInPage(): Measurement {
  const parse = (value: string): number[] | null => {
    const match = /rgba?\(([^)]+)\)/.exec(value)
    if (!match) return null
    const parts = match[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1]
  }
  const px = (value: string) => Number.parseFloat(value) || 0
  const elements = [document.body, ...document.body.querySelectorAll('*')].slice(0, 4000)
  const index = new Map<Element, number>()
  const boxes: Box[] = []
  const effectiveBg = (element: Element | null): string | null => {
    let current = element
    while (current) {
      const style = getComputedStyle(current)
      if (style.backgroundImage !== 'none' && !style.backgroundImage.startsWith('url(')) return null
      if (style.backgroundImage.startsWith('url(')) return null
      if (current.tagName === 'IMG') return null
      const color = parse(style.backgroundColor)
      if (color && color[3] >= 0.95) return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      current = current.parentElement
    }
    return 'rgb(255, 255, 255)'
  }
  const overImage = (element: Element): boolean => {
    // Text placed over a picture has no single background colour to measure against.
    let current: Element | null = element
    while (current && current !== document.body) {
      const position = getComputedStyle(current).position
      if (position === 'absolute' || position === 'fixed') {
        const host = current.parentElement
        if (host?.querySelector('img')) return true
      }
      current = current.parentElement
    }
    return false
  }
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    if (rect.width < 1 || rect.height < 1) continue
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
    if (['SCRIPT', 'STYLE', 'BR', 'PATH', 'G', 'DEFS'].includes(element.tagName.toUpperCase())) continue
    let ownText = ''
    for (const node of element.childNodes)
      if (node.nodeType === Node.TEXT_NODE) ownText += node.textContent ?? ''
    ownText = ownText.replace(/\s+/g, ' ').trim()
    let depth = 0
    for (let parent = element.parentElement; parent; parent = parent.parentElement) depth++
    const family = style.fontFamily.split(',')[0].replaceAll('"', '').trim()
    const html = element as HTMLElement
    const children = [...element.children]
    index.set(element, boxes.length)
    boxes.push({
      tag: element.tagName.toLowerCase(),
      x: Math.round(rect.left + scrollX),
      y: Math.round(rect.top + scrollY),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      depth,
      text: ownText.slice(0, 160),
      ownText: ownText.length,
      fontSize: px(style.fontSize),
      fontFamily: family,
      fontWeight: Number(style.fontWeight) || 400,
      lineHeight: px(style.lineHeight),
      letterSpacing: px(style.letterSpacing) / (px(style.fontSize) || 1),
      textTransform: style.textTransform,
      textAlign: style.textAlign,
      fontStyle: style.fontStyle,
      color: style.color,
      bg: style.backgroundColor,
      bgImage: style.backgroundImage === 'none' ? '' : style.backgroundImage.slice(0, 200),
      bgClipText: style.webkitBackgroundClip === 'text' || style.backgroundClip === 'text',
      radius: Math.max(px(style.borderTopLeftRadius), px(style.borderBottomRightRadius)),
      shadow: style.boxShadow === 'none' ? '' : style.boxShadow.slice(0, 120),
      backdrop: style.backdropFilter !== 'none' && style.backdropFilter !== '',
      borderWidths: [
        px(style.borderTopWidth),
        px(style.borderRightWidth),
        px(style.borderBottomWidth),
        px(style.borderLeftWidth)
      ],
      borderColor: style.borderLeftColor,
      padding: [px(style.paddingTop), px(style.paddingRight), px(style.paddingBottom), px(style.paddingLeft)],
      margin: [px(style.marginTop), px(style.marginRight), px(style.marginBottom), px(style.marginLeft)],
      gap: style.display.includes('flex') || style.display.includes('grid') ? [px(style.rowGap), px(style.columnGap)] : [0, 0],
      display: style.display,
      position: style.position,
      childCount: children.length,
      childSignature: children
        .slice(0, 8)
        .map((child) => `${child.tagName}:${child.children.length}`)
        .join('|'),
      clipped:
        (html.scrollWidth > html.clientWidth + 2 && style.overflowX !== 'visible' && ownText.length > 0) ||
        rect.right > document.documentElement.clientWidth + 2,
      effectiveBg: ownText && !overImage(element) ? effectiveBg(element) : null,
      parent: element.parentElement ? (index.get(element.parentElement) ?? -1) : -1,
      fontLoaded: ownText ? document.fonts.check(`${style.fontWeight} 16px "${family}"`) : true
    })
  }
  const generic = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', '-apple-system'])
  const failed = new Set<string>()
  for (const box of boxes)
    if (box.ownText && !box.fontLoaded && !generic.has(box.fontFamily.toLowerCase())) failed.add(box.fontFamily)
  return {
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    boxes,
    text: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
    fontsFailed: [...failed],
    images: document.querySelectorAll('img, picture, video').length
  }
}

/** Fills `<img data-photo>` with the same neutral plate for every condition: no stock provider runs here. */
function fillPhotos() {
  for (const image of document.querySelectorAll<HTMLImageElement>('img')) {
    const source = image.getAttribute('src') ?? ''
    if (source && !source.startsWith('data:') && image.complete && image.naturalWidth > 0) continue
    const label = (image.dataset.photo ?? image.alt ?? '').slice(0, 60).replace(/[<&>"]/g, '')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="#808080" fill-opacity="0.28"/><path d="M0 900 L1200 0" stroke="#808080" stroke-opacity="0.35" stroke-width="2"/><text x="32" y="868" font-family="sans-serif" font-size="26" fill="#808080">${label}</text></svg>`
    image.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    if (!image.style.objectFit) image.style.objectFit = 'cover'
  }
}

let shared: Browser | undefined

export async function closeBrowser() {
  await shared?.close()
  shared = undefined
}

export type RenderOptions = { width: number; height: number; full: string; fold: string }

export async function renderPage(file: string, options: RenderOptions): Promise<Measurement> {
  shared ??= await chromium.launch()
  const context = await shared.newContext({
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: 1
  })
  const page = await context.newPage()
  try {
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load', timeout: 45_000 })
    await page.evaluate(fillPhotos)
    await page.evaluate(() => document.fonts.ready.then(() => true))
    await page.waitForTimeout(400)
    await page.screenshot({ path: options.fold, type: 'jpeg', quality: 88 })
    const measurement = await page.evaluate(measureInPage)
    // Very long pages are cropped: nobody judges a first draft 12 screens down.
    const height = Math.min(measurement.height, 9000)
    await page.screenshot({
      path: options.full,
      type: 'jpeg',
      quality: 82,
      clip: { x: 0, y: 0, width: options.width, height }
    })
    return measurement
  } finally {
    await context.close()
  }
}
