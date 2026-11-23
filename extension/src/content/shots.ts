// What a copy cannot read from the page's markup it takes from the screen: the backdrop the
// page draws behind the element (an ancestor's pattern, guide lines, a WebGL gradient) and
// canvases drawn with WebGL or shaders, whose pixels the page does not hand out.

import { seeThrough } from './see-through'

/** A picture of the visible part of the tab, as a data URL at the screen's pixel ratio. */
export type Shoot = () => Promise<string>

/** What the screen gives a copy: the backdrop behind its root, and pictures of its canvases. */
export interface Shots {
  backdrop: string | null
  canvases: Map<Element, string>
}

/** Chrome lets an extension take two pictures of a tab a second. */
const SHOT_INTERVAL_MS = 550

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

async function pause(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** How an element is kept out of a picture: see `withVisibility`. */
type Showing = 'hidden' | 'visible' | 'gone' | 'onWhite' | 'onBlack'

/** What each way of showing sets; the transition is cut so the picture does not catch a fade. */
const SHOWING: Record<Showing, readonly (readonly [string, string])[]> = {
  hidden: [['visibility', 'hidden']],
  visible: [['visibility', 'visible']],
  gone: [
    ['opacity', '0'],
    ['transition', 'none']
  ],
  onWhite: [
    ['visibility', 'visible'],
    ['background-color', '#fff'],
    ['transition', 'none']
  ],
  onBlack: [
    ['visibility', 'visible'],
    ['background-color', '#000'],
    ['transition', 'none']
  ]
}

/**
 * Shows or hides elements for the time of `run`, then gives each its own styles back. `hidden`
 * leaves a descendant that asks to be visible on the screen, which is how one canvas is shot
 * alone; `gone` takes the element out with everything in it, whatever its descendants ask.
 */
async function withVisibility<T>(
  changes: readonly (readonly [HTMLElement | SVGElement, Showing])[],
  run: () => Promise<T>
): Promise<T> {
  const set = changes.flatMap(([element, showing]) =>
    SHOWING[showing].map(([property, value]) => [element, property, value] as const)
  )
  const saved = set.map(
    ([element, property]) =>
      [
        element,
        property,
        element.style.getPropertyValue(property),
        element.style.getPropertyPriority(property)
      ] as const
  )
  for (const [element, property, value] of set)
    element.style.setProperty(property, value, 'important')
  try {
    await nextFrame()
    return await run()
  } finally {
    for (const [element, property, value, priority] of saved) {
      if (value) element.style.setProperty(property, value, priority)
      else element.style.removeProperty(property)
    }
  }
}

/** Fixed and sticky boxes outside the element, which would cover it on the screen. */
function overlays(element: Element): HTMLElement[] {
  const found: HTMLElement[] = []
  for (const candidate of document.body.querySelectorAll<HTMLElement>('*')) {
    if (candidate.contains(element) || element.contains(candidate)) continue
    const position = getComputedStyle(candidate).position
    if (position === 'fixed' || position === 'sticky') found.push(candidate)
  }
  return found
}

async function bitmap(url: string): Promise<ImageBitmap> {
  const blob = await (await fetch(url)).blob()
  return createImageBitmap(blob)
}

/**
 * A picture of a part of the page, in page pixels: the page scrolls it into view piece by piece
 * when it is taller than the window, then goes back to where it was.
 */
async function pictureOf(rect: DOMRect, shoot: Shoot): Promise<OffscreenCanvas | null> {
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)
  if (width < 1 || height < 1) return null
  const start = { x: scrollX, y: scrollY }
  const top = rect.top + scrollY
  const left = rect.left + scrollX
  let canvas: OffscreenCanvas | null = null
  try {
    for (let done = 0; done < height; done += innerHeight) {
      // Instantly, whatever the page's own scrolling: the picture is taken right after.
      window.scrollTo({ left, top: top + done, behavior: 'instant' })
      await nextFrame()
      const shot = await bitmap(await shoot())
      // The picture's own scale: the screen's pixel ratio, or what the browser chose.
      const scale = shot.width / innerWidth
      canvas ??= new OffscreenCanvas(Math.round(width * scale), Math.round(height * scale))
      const context = canvas.getContext('2d')
      if (!context) return null
      // Where the wanted part landed in this picture, in page pixels.
      const offsetY = top + done - scrollY
      const offsetX = left - scrollX
      const slice = Math.min(innerHeight - offsetY, height - done)
      context.drawImage(
        shot,
        offsetX * scale,
        offsetY * scale,
        width * scale,
        slice * scale,
        0,
        done * scale,
        width * scale,
        slice * scale
      )
      if (done + innerHeight < height) await pause(SHOT_INTERVAL_MS)
    }
  } finally {
    window.scrollTo({ left: start.x, top: start.y, behavior: 'instant' })
  }
  return canvas
}

/** Whether a picture is one flat color, which a plain background already says. */
function flat(canvas: OffscreenCanvas): boolean {
  const context = canvas.getContext('2d')
  if (!context) return true
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
  const step = Math.max(4, Math.floor(data.length / 4 / 4000) * 4)
  const [r = 0, g = 0, b = 0] = data
  for (let index = 0; index < data.length; index += step) {
    const far =
      Math.abs((data[index] ?? 0) - r) > 4 ||
      Math.abs((data[index + 1] ?? 0) - g) > 4 ||
      Math.abs((data[index + 2] ?? 0) - b) > 4
    if (far) return false
  }
  return true
}

async function dataURL(canvas: OffscreenCanvas): Promise<string> {
  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.92 })
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : '')
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('The picture could not be read.'))
    })
    reader.readAsDataURL(blob)
  })
}

/**
 * What the page draws behind an element, the element itself hidden for a moment: null when
 * that is one flat color, which the copy gives as its background color.
 */
async function backdropOf(element: HTMLElement | SVGElement, shoot: Shoot): Promise<string | null> {
  const covering = overlays(element).map((overlay) => [overlay, 'gone'] as const)
  const picture = await withVisibility([[element, 'gone'], ...covering], () =>
    pictureOf(element.getBoundingClientRect(), shoot)
  )
  if (!picture || flat(picture)) return null
  return dataURL(picture)
}

/** Whether a canvas hands out its pixels: a WebGL canvas usually gives a blank picture. */
async function readable(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const image = await bitmap(canvas.toDataURL('image/png'))
    const probe = new OffscreenCanvas(
      Math.min(64, image.width) || 1,
      Math.min(64, image.height) || 1
    )
    const context = probe.getContext('2d')
    if (!context) return false
    context.drawImage(image, 0, 0, probe.width, probe.height)
    const { data } = context.getImageData(0, 0, probe.width, probe.height)
    for (let index = 3; index < data.length; index += 4) if ((data[index] ?? 0) > 0) return true
    return false
  } catch {
    // A canvas that drew another site's image refuses to give its pixels.
    return false
  }
}

/** A canvas alone on the screen, shown as `showing` says, everything else hidden for a moment. */
async function canvasAlone(
  canvas: HTMLCanvasElement,
  showing: Showing,
  shoot: Shoot
): Promise<OffscreenCanvas | null> {
  return withVisibility(
    [
      [document.documentElement, 'hidden'],
      [canvas, showing],
      // A bar that stays on the screen would be drawn over the canvas.
      ...overlays(canvas).map((overlay) => [overlay, 'gone'] as const)
    ],
    () => pictureOf(canvas.getBoundingClientRect(), shoot)
  )
}

/** Whether a canvas has no background of its own, so what lies under it shows through it. */
function bare(canvas: HTMLCanvasElement): boolean {
  const style = getComputedStyle(canvas)
  const color = style.backgroundColor
  return style.backgroundImage === 'none' && (color === 'transparent' || /,\s*0\)$/.test(color))
}

/**
 * A canvas as the screen shows it. One with no background of its own is shot over white, then
 * over black, so the picture is clear where the canvas is: see `seeThrough`.
 */
async function canvasPicture(canvas: HTMLCanvasElement, shoot: Shoot): Promise<string | null> {
  if (!bare(canvas)) {
    const picture = await canvasAlone(canvas, 'visible', shoot)
    return picture ? dataURL(picture) : null
  }
  const onWhite = await canvasAlone(canvas, 'onWhite', shoot)
  if (!onWhite) return null
  await pause(SHOT_INTERVAL_MS)
  const onBlack = await canvasAlone(canvas, 'onBlack', shoot)
  const white = onWhite.getContext('2d')
  const black = onBlack?.getContext('2d')
  const same = onBlack?.width === onWhite.width && onBlack.height === onWhite.height
  if (!white || !black || !same) return dataURL(onWhite)
  const { width, height } = onWhite
  const clear = seeThrough(
    white.getImageData(0, 0, width, height).data,
    black.getImageData(0, 0, width, height).data
  )
  white.putImageData(new ImageData(clear, width, height), 0, 0)
  return dataURL(onWhite)
}

/**
 * Takes from the screen what the copy of `element` needs: its backdrop when the page draws more
 * than a color behind it, and its canvases that keep their pixels to themselves. `hide` is the
 * inspector's own overlay, out of every picture.
 */
export async function takeShots(
  element: Element,
  shoot: Shoot,
  hide?: HTMLElement
): Promise<Shots> {
  const shots: Shots = { backdrop: null, canvases: new Map() }
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return shots
  const run = async () => {
    for (const canvas of element.querySelectorAll('canvas')) {
      if (await readable(canvas)) continue
      const picture = await canvasPicture(canvas, shoot)
      if (picture) shots.canvases.set(canvas, picture)
      await pause(SHOT_INTERVAL_MS)
    }
    shots.backdrop = await backdropOf(element, shoot)
  }
  if (hide) await withVisibility([[hide, 'hidden']], run)
  else await run()
  return shots
}
