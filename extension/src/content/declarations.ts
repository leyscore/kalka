// The declarations an element's copy carries, as "property: value; ..." text, and what the copy
// does with them before they are written: a transform that only moves becomes offsets, and an
// element faded out to nothing becomes hidden.
export type Declarations = Map<string, string>

export function parseDeclarations(declared: string): Declarations {
  const out: Declarations = new Map()
  for (const part of declared.split('; ')) {
    const colon = part.indexOf(': ')
    if (colon > 0) out.set(part.slice(0, colon), part.slice(colon + 2))
  }
  return out
}

export function writeDeclarations(declarations: Declarations): string {
  return [...declarations].map(([property, value]) => `${property}: ${value}`).join('; ')
}

const NUMBER = String.raw`(-?\d+(?:\.\d+)?(?:e-?\d+)?)`
/** A transform that only moves the element, as `translate(-50%, -50%)` computes. */
const TRANSLATION = new RegExp(String.raw`^matrix\(1, 0, 0, 1, ${NUMBER}, ${NUMBER}\)$`)
const PIXELS = new RegExp(String.raw`^${NUMBER}px$`)
const OFFSET_POSITIONS = new Set(['relative', 'absolute', 'fixed'])

/**
 * Moves an element its transform only moves by its offsets instead, so the layer sits where the
 * page draws it, at the x and y Kalka shows: an icon centred with `translate(-50%)` keeps its
 * place without the transform. Anything else a transform does stays a transform.
 */
export function foldTranslation(declared: string): string {
  const style = parseDeclarations(declared)
  const move = TRANSLATION.exec(style.get('transform') ?? '')
  if (!move || !OFFSET_POSITIONS.has(style.get('position') ?? '')) return declared
  if (['translate', 'rotate', 'scale'].some((property) => style.has(property))) return declared
  const moved = shifted(style, Number(move[1]), Number(move[2]))
  if (!moved) return declared
  moved.delete('transform')
  moved.delete('transform-origin')
  return writeDeclarations(moved)
}

/** Declarations with the offsets moving the box by `x` and `y`, or null where they cannot. */
export function shifted(style: Declarations, x: number, y: number): Declarations | null {
  const shifts = [
    ['left', x],
    ['right', -x],
    ['top', y],
    ['bottom', -y]
  ] as const
  const moved = new Map(style)
  for (const [property, shift] of shifts) {
    const value = style.get(property)
    if (value === undefined) continue
    const pixels = PIXELS.exec(value)
    if (!pixels) return null
    moved.set(property, `${Math.round((Number(pixels[1]) + shift) * 1000) / 1000}px`)
  }
  return moved.has('left') && moved.has('top') ? moved : null
}

/**
 * An element the page fades out entirely is written hidden instead: it comes in as a hidden
 * layer, which shows at its full opacity, rather than as a layer that cannot be seen. It keeps
 * its place among its siblings, so copies at other widths still pair up.
 */
export function hideFaded(declared: string): string {
  const style = parseDeclarations(declared)
  if (style.get('opacity') !== '0') return declared
  style.delete('opacity')
  style.set('visibility', 'hidden')
  return writeDeclarations(style)
}

/** What every element's copy does with its declarations before they are written. */
export function finalDeclarations(declared: string): string {
  return hideFaded(foldTranslation(declared))
}

/**
 * What frees a copy's root from where the page put it: the copy is the artboard, so a root the
 * page pinned or placed is not placed anywhere in it, and still holds the children it places.
 */
export function unplaced(position: string): string[] {
  if (position !== 'fixed' && position !== 'absolute' && position !== 'sticky') return []
  return ['position: relative', 'top: auto', 'right: auto', 'bottom: auto', 'left: auto']
}

/** What lets a copy of the page's root hold the whole page, where rules style the copy. */
export const UNSCROLLED = ['height: auto', 'overflow: visible']

/**
 * The declarations of the page's root without the height and the scrolling that keep it one
 * window tall: on the page the window scrolls the rest, where an artboard is as tall as what
 * it holds.
 */
export function unscrolled(declared: string): string {
  const declarations = parseDeclarations(declared)
  declarations.delete('height')
  declarations.delete('overflow')
  return writeDeclarations(declarations)
}

/** A page as its window shows it: how wide the window is and how tall the page scrolls. */
export interface PageSize {
  width: number
  height: number
}

/**
 * What makes a copy of the page's root the whole page. The root may be narrower than the window,
 * as a `<body>` with a `max-width` centred by its margins is, or shorter than what the window
 * scrolls, as one whose content is all placed over it is: the artboard is the window, so the
 * copy takes the window's width with the room on each side as padding, and is at least as tall
 * as the page. `sides` is the root's left and right edge in the window, `padding` its own.
 */
export function wholePage(
  page: PageSize,
  sides: { left: number; right: number },
  padding: { left: number; right: number }
): string[] {
  const out = [`width: ${page.width}px`, 'max-width: none', `min-height: ${page.height}px`]
  const room = { left: sides.left, right: page.width - sides.right }
  for (const side of ['left', 'right'] as const)
    if (room[side] > 0.5) out.push(`padding-${side}: ${padding[side] + room[side]}px`)
  return out
}

/**
 * Whether a copy states the point an element turns and scales about: whenever something turns,
 * scales or moves it. A box scaled from its corner would otherwise scale about its middle.
 */
export function statesOrigin(transforms: readonly string[]): boolean {
  return transforms.some((value) => value !== '' && value !== 'none')
}

/**
 * `present` with every item of `before` it lacks put back ahead of the next item of `before`
 * it still holds, or at the end: the order `before` had, whatever else `present` gained.
 */
export function backInPlace<T>(present: readonly T[], before: readonly T[]): T[] {
  const out = [...present]
  before.forEach((item, index) => {
    if (out.includes(item)) return
    const next = before.slice(index + 1).find((later) => out.includes(later))
    out.splice(next === undefined ? out.length : out.indexOf(next), 0, item)
  })
  return out
}
