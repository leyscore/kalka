/** What a page draws that no element's box or text node says: SVG drawings and field text. */
import type { DesignElement, LayoutBox } from '../types'

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** What paints an SVG shape, which a stylesheet or `currentColor` may set and a file must state. */
const SVG_PAINT_PROPERTIES = [
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stop-color',
  'stop-opacity',
  'opacity',
  'font-family',
  'font-size',
  'font-weight'
]

/**
 * An inline SVG as a standalone file that draws as the page drew it: every shape carries its
 * computed paint, and the root its measured size and none of the page's layout or animation.
 */
export function drawnSVG(svg: Element, box: LayoutBox): string | undefined {
  const view = svg.ownerDocument.defaultView
  if (!view) return undefined
  const clone = svg.cloneNode(true)
  if (!(clone instanceof view.Element)) return undefined
  const sources = [svg, ...svg.querySelectorAll('*')]
  const copies = [clone, ...clone.querySelectorAll('*')]
  for (const [index, source] of sources.entries()) {
    const copy = copies.at(index)
    if (!copy) continue
    const computed = view.getComputedStyle(source)
    const paint = SVG_PAINT_PROPERTIES.map(
      (property) => `${property}:${computed.getPropertyValue(property)}`
    ).join(';')
    // The root's own style places and animates it on the page; the layer does that now.
    const own = copy === clone ? '' : (copy.getAttribute('style') ?? '')
    copy.setAttribute('style', own ? `${own};${paint}` : paint)
  }
  clone.setAttribute('xmlns', SVG_NAMESPACE)
  clone.setAttribute('width', String(box.width))
  clone.setAttribute('height', String(box.height))
  clone.removeAttribute('class')
  return new view.XMLSerializer().serializeToString(clone)
}

/** Input types that show a line of text: their value, or their placeholder while empty. */
const TEXT_FIELD_TYPES = new Set([
  '',
  'text',
  'search',
  'email',
  'url',
  'tel',
  'number',
  'password'
])

/**
 * The words a text field shows, which live in no text node: its value, or its placeholder in
 * the placeholder's color, as a line of text in its content box, centered as a field draws it.
 */
export function readFieldText(designElement: DesignElement, domElement: Element) {
  const view = domElement.ownerDocument.defaultView
  if (!view || !(domElement instanceof view.HTMLInputElement)) return
  if (!TEXT_FIELD_TYPES.has(domElement.type) || domElement.type === 'password') return
  const shown = domElement.value || domElement.placeholder
  if (!shown || !designElement.layoutBox) return
  const style = view.getComputedStyle(domElement)
  const px = (value: string) => Number.parseFloat(value) || 0
  const box = designElement.layoutBox
  const left = px(style.borderLeftWidth) + px(style.paddingLeft)
  const right = px(style.borderRightWidth) + px(style.paddingRight)
  const top = px(style.borderTopWidth) + px(style.paddingTop)
  const bottom = px(style.borderBottomWidth) + px(style.paddingBottom)
  const fontSize = px(style.fontSize)
  const lineHeight = style.lineHeight === 'normal' ? fontSize * 1.2 : px(style.lineHeight)
  const inner = box.height - top - bottom
  if (!domElement.value && designElement.computedStyle) {
    designElement.computedStyle.color = view.getComputedStyle(domElement, '::placeholder').color
  }
  designElement.children = [
    {
      type: 'text',
      text: shown,
      layoutBox: {
        x: box.x + left,
        y: box.y + top + Math.max(0, (inner - lineHeight) / 2),
        width: Math.max(1, box.width - left - right),
        height: lineHeight
      }
    }
  ]
}
