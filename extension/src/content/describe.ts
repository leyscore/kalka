// What the inspector panel says about an element: its name, size, type, colors and layout.

export interface Description {
  label: string
  size: string
  typography: [string, string][]
  colors: [string, string][]
  layout: [string, string][]
  inside: [string, string][]
}

/** `tag.first-class.second-class`, as the inspector and the path name an element. */
export function elementLabel(element: Element): string {
  const classes = [...element.classList].slice(0, 2).map((name) => `.${name}`)
  return `${element.tagName.toLowerCase()}${classes.join('')}`
}

function px(value: string): string {
  return value.endsWith('px') ? String(Math.round(Number.parseFloat(value) * 10) / 10) : value
}

const TRANSPARENT = new Set(['rgba(0, 0, 0, 0)', 'transparent'])

/** `rgb(27, 36, 64)` as `#1B2440`, alpha kept as a percentage. */
export function hexColor(value: string): string {
  const parts = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(value)
  if (!parts) return value
  const hex = [parts[1], parts[2], parts[3]]
    .map((part) => Math.round(Number(part)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  const alpha = parts[4] === undefined ? 1 : Number(parts[4])
  return alpha < 1 ? `#${hex} ${Math.round(alpha * 100)}%` : `#${hex}`
}

export function describe(element: Element): Description {
  const style = getComputedStyle(element)
  const box = element.getBoundingClientRect()
  const family =
    style.fontFamily
      .split(',')[0]
      ?.trim()
      .replace(/^["']|["']$/g, '') ?? ''
  const colors: [string, string][] = []
  if (!TRANSPARENT.has(style.backgroundColor))
    colors.push([hexColor(style.backgroundColor), 'background'])
  colors.push([hexColor(style.color), 'text'])
  if (style.borderTopStyle !== 'none' && !TRANSPARENT.has(style.borderTopColor)) {
    colors.push([hexColor(style.borderTopColor), 'border'])
  }
  const layout: [string, string][] = [
    ['Display', style.display === 'flex' ? `flex, ${style.flexDirection}` : style.display]
  ]
  if (style.gap !== 'normal') layout.push(['Gap', px(style.columnGap)])
  const padding = [
    style.paddingTop,
    style.paddingRight,
    style.paddingBottom,
    style.paddingLeft
  ].map(px)
  layout.push([
    'Padding',
    padding.every((value) => value === padding[0]) ? (padding[0] ?? '0') : padding.join(' ')
  ])
  if (style.borderTopLeftRadius !== '0px') layout.push(['Radius', px(style.borderTopLeftRadius)])
  const descendants = element.querySelectorAll('*').length
  const images = element.querySelectorAll('img, picture, svg, video, canvas').length
  return {
    label: elementLabel(element),
    size: `${Math.round(box.width)} × ${Math.round(box.height)}`,
    typography: [
      ['Font', family],
      ['Size, line', `${px(style.fontSize)} / ${px(style.lineHeight)}`],
      ['Weight', style.fontWeight]
    ],
    colors,
    layout,
    inside: [
      ['Layers', String(descendants + 1)],
      ['Images', String(images)]
    ]
  }
}
