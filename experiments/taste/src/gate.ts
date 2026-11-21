/**
 * The gate every written section passes: a class that names a value outside the system is
 * snapped to the nearest value the system has, or refused when there is nothing to snap to
 * (a gradient, a blur, a style attribute). It is the prototype of what `write_html`,
 * `update_styles` and `update_css_class` would do once a document has committed to a system.
 */
import { differenceEuclidean, parse } from 'culori'

import { COLOR_ROLES, type ColorRole, type System } from './genome'

export type GateAction = {
  kind: 'snap' | 'refuse'
  from: string
  to: string | null
  reason: string
}

export type GateResult = { html: string; actions: GateAction[]; snapped: number; refused: number }

const NEUTRALS = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone'])
const CHROMATICS = new Set([
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'primary',
  'secondary',
  'brand'
])
const SHADCN: Record<string, ColorRole> = {
  background: 'ground',
  foreground: 'ink',
  card: 'surface',
  'card-foreground': 'ink',
  popover: 'surface',
  'popover-foreground': 'ink',
  'primary-foreground': 'on-accent',
  'secondary-foreground': 'ink',
  'muted-foreground': 'muted',
  'accent-foreground': 'ink',
  destructive: 'support',
  border: 'line',
  input: 'line',
  ring: 'accent',
  'base-100': 'ground',
  'base-200': 'surface',
  'base-300': 'line',
  'base-content': 'ink',
  'primary-content': 'on-accent',
  neutral: 'ink',
  'neutral-content': 'ground'
}
const COLOR_PREFIXES = [
  'bg',
  'text',
  'border-x',
  'border-y',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-s',
  'border-e',
  'border',
  'divide',
  'ring-offset',
  'ring',
  'outline',
  'fill',
  'stroke',
  'decoration',
  'accent',
  'caret',
  'placeholder'
]
const TEXT_SIZES: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128
}
const WEIGHTS: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
}
const RADII: Record<string, number> = {
  none: 0,
  xs: 2,
  sm: 4,
  '': 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  full: 9999
}
const SPACING_PREFIX =
  /^(-?)(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end)-(.+)$/
const FREE_ARBITRARY =
  /^(grid-cols|grid-rows|col-span|row-span|aspect|max-w|min-w|w|h|min-h|max-h|size|basis|columns|flex|order|z|line-clamp|content)-\[/
const DROPPED =
  /^(bg-gradient-|bg-linear-|bg-radial|bg-conic|from-|via-|to-|backdrop-|blur|drop-shadow|animate-|transition|duration-|ease-|delay-|tracking-|leading-\[|shadow-\[|mix-blend-|filter|saturate-|brightness-|contrast-|hue-rotate-|bg-clip-text|text-transparent|ring-offset-\d|scale-|rotate-|translate-|skew-|transform|will-change-|scroll-smooth|antialiased|subpixel-antialiased|prose)/

function nearest<T>(items: T[], distance: (item: T) => number): T {
  return items.reduce((best, item) => (distance(item) < distance(best) ? item : best))
}

function neutralRole(prefix: string, shade: number): string {
  if (prefix === 'text' || prefix === 'fill' || prefix === 'stroke' || prefix === 'decoration') {
    if (shade >= 700) return 'ink'
    if (shade >= 400) return 'muted'
    return 'ground'
  }
  if (prefix === 'bg') {
    if (shade <= 50) return 'ground'
    if (shade <= 100) return 'surface'
    if (shade <= 300) return 'line'
    if (shade <= 600) return 'muted'
    return 'ink'
  }
  if (shade <= 400) return 'line'
  if (shade <= 600) return 'muted'
  return 'ground/20'
}

function chromaticRole(prefix: string, shade: number): string {
  if (prefix === 'bg') return shade <= 200 ? 'tint' : 'accent'
  if (prefix === 'text') return shade <= 300 ? 'on-accent' : 'accent'
  return shade <= 200 ? 'line' : 'accent'
}

type Context = {
  system: System
  actions: GateAction[]
  /** Whether the element's own classes put it on a chromatic or accent fill. */
  onFill: boolean
}

function snapColor(prefix: string, value: string, context: Context): string | null {
  const [name, opacity] = value.split('/')
  const suffix = opacity && /^\d+$/.test(opacity) ? `/${opacity}` : ''
  if ((COLOR_ROLES as readonly string[]).includes(name)) return `${prefix}-${name}${suffix}`
  if (name === 'transparent' || name === 'current' || name === 'inherit') return `${prefix}-${name}`
  if (name === 'white') {
    if (prefix === 'bg') return `bg-ground${suffix}`
    if (prefix === 'text') return context.onFill ? 'text-on-accent' : `text-ground${suffix}`
    return `${prefix}-ground${suffix || '/20'}`
  }
  if (name === 'black') return `${prefix}-ink${suffix}`
  if (name in SHADCN) return `${prefix}-${SHADCN[name]}${suffix}`
  if (name === 'muted' || name === 'accent') return `${prefix}-${name}${suffix}`
  const arbitrary = /^\[(#[0-9a-fA-F]{3,8}|rgb.+|hsl.+|oklch.+)\]$/.exec(name)
  if (arbitrary) {
    const color = parse(arbitrary[1].replaceAll('_', ' '))
    if (!color) return null
    const distance = differenceEuclidean('oklab')
    const role = nearest([...COLOR_ROLES], (candidate) =>
      distance(color, context.system.colors[candidate])
    )
    return `${prefix}-${role}`
  }
  const scaled = /^([a-z]+)(?:-(\d{2,3}))?$/.exec(name)
  if (!scaled) return null
  const shade = scaled[2] ? Number(scaled[2]) : 500
  if (NEUTRALS.has(scaled[1])) {
    const role = neutralRole(prefix, shade)
    return `${prefix}-${role}${role.includes('/') ? '' : suffix}`
  }
  if (CHROMATICS.has(scaled[1])) return `${prefix}-${chromaticRole(prefix, shade)}${suffix}`
  return null
}

function snapSpacingStep(value: string, system: System): string | null {
  if (value === 'auto' || value === 'px' || value === '0' || value === 'full') return value
  if (/^\d+\/\d+$/.test(value)) return value
  let steps: number
  const arbitrary = /^\[(-?[\d.]+)(px|rem)?\]$/.exec(value)
  if (arbitrary) steps = (Number(arbitrary[1]) * (arbitrary[2] === 'rem' ? 16 : 1)) / 4
  else if (/^[\d.]+$/.test(value)) steps = Number(value)
  else return null
  if (steps === 0) return '0'
  if (steps <= 0.5) return system.grid === 4 ? '0.5' : String(system.spacing[0])
  return String(nearest(system.spacing, (step) => Math.abs(step - steps)))
}

function gateUtility(utility: string, context: Context): string | null {
  const { system } = context
  const surface = system.surface
  if (system.motion.includes(utility)) return utility
  if (DROPPED.test(utility)) return null
  if (utility === 'shadow' || /^shadow-(2xs|xs|sm|md|lg|xl|2xl|inner)$/.test(utility)) {
    const names = Object.keys(system.shadow)
    return names.length ? `shadow-${names[0]}` : null
  }
  if (utility === 'shadow-none') return utility
  if (/^shadow-/.test(utility)) return utility.slice(7) in system.shadow ? utility : null

  const font = /^font-(.+)$/.exec(utility)
  if (font) {
    if (font[1] === 'display' || font[1] === 'text') return utility
    if (font[1] === 'sans' || font[1] === 'mono' || font[1] === 'body') return 'font-text'
    if (font[1] === 'serif' || font[1] === 'heading') return 'font-display'
    const arbitrary = /^\[(\d{3})\]$/.exec(font[1])
    const weight = arbitrary ? Number(arbitrary[1]) : WEIGHTS[font[1]]
    if (weight === undefined) return null
    const snapped = nearest(system.weights, (allowed) => Math.abs(allowed - weight))
    const name = Object.entries(WEIGHTS).find(([, value]) => value === snapped)?.[0]
    return name ? `font-${name}` : null
  }

  const text = /^text-(.+)$/.exec(utility)
  if (text) {
    const styles = system.type
    if (styles.some((style) => style.role === text[1])) return utility
    if (/^(left|right|center|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/.test(text[1]))
      return utility
    const arbitrarySize = /^\[([\d.]+)(px|rem)\]$/.exec(text[1])
    const size = arbitrarySize
      ? Number(arbitrarySize[1]) * (arbitrarySize[2] === 'rem' ? 16 : 1)
      : TEXT_SIZES[text[1].split('/')[0]]
    if (size !== undefined) {
      const scaled = surface === 'web' ? size : size * 0.8
      const style = nearest(styles, (candidate) => Math.abs(Math.log(candidate.size / scaled)))
      return `text-${style.role}`
    }
    return snapColor('text', text[1], context)
  }

  const rounded = /^rounded(?:-([trblse]{1,2}))?(?:-(.+))?$/.exec(utility)
  if (rounded) {
    const side = rounded[1] ? `-${rounded[1]}` : ''
    const key = rounded[2] ?? ''
    const tokens = system.radius
    if (key in tokens) return utility
    const arbitrary = /^\[([\d.]+)px\]$/.exec(key)
    const px = arbitrary ? Number(arbitrary[1]) : RADII[key]
    if (px === undefined) return null
    if (px >= 9999) return `rounded${side}-full`
    const name = nearest(
      Object.entries(tokens).filter(([token]) => token !== 'full'),
      ([, value]) => Math.abs(value - px)
    )[0]
    return `rounded${side}-${name}`
  }

  const spacing = SPACING_PREFIX.exec(utility)
  if (spacing) {
    const step = snapSpacingStep(spacing[3], system)
    return step === null ? null : `${spacing[1]}${spacing[2]}-${step}`
  }

  for (const prefix of COLOR_PREFIXES) {
    if (!utility.startsWith(`${prefix}-`)) continue
    const value = utility.slice(prefix.length + 1)
    if (prefix.startsWith('border') || prefix === 'divide' || prefix === 'ring' || prefix === 'outline') {
      // Widths, styles and sides share the prefix with colours.
      if (/^(\d+|[xytrblse]|[xytrblse]-\d+|solid|dashed|dotted|double|none|hidden|collapse|separate|inset|reverse|[xy]-reverse|offset-\d+)$/.test(value))
        return utility
    }
    if (prefix === 'bg' && /^(cover|contain|center|top|bottom|left|right|no-repeat|repeat|fixed|local|scroll|none|auto)$/.test(value))
      return utility
    if (prefix === 'fill' && value === 'none') return utility
    if (prefix === 'stroke' && /^\d+$/.test(value)) return utility
    if (prefix === 'accent' && value === 'auto') return utility
    if (prefix === 'decoration' && /^(\d+|auto|from-font|solid|dashed|dotted|double|wavy)$/.test(value)) return utility
    return snapColor(prefix, value, context)
  }

  if (utility.includes('[') && !FREE_ARBITRARY.test(utility)) return null
  return utility
}

function gateClass(token: string, context: Context): string | null {
  const parts = token.split(':')
  const rawUtility = parts[parts.length - 1]
  const variants = parts.slice(0, -1)
  if (variants.some((variant) => variant === 'dark' || variant.startsWith('group-hover') || variant === 'motion-safe'))
    return null
  const important = rawUtility.startsWith('!') || rawUtility.endsWith('!')
  const utility = rawUtility.replace(/^!|!$/g, '')
  const gated = gateUtility(utility, context)
  if (gated === null) return null
  return [...variants, important ? `${gated}!` : gated].join(':')
}

function isOnFill(tokens: string[]): boolean {
  return tokens.some((token) => {
    const utility = token.split(':').pop() ?? ''
    const match = /^bg-([a-z-]+?)(?:-(\d{2,3}))?(?:\/\d+)?$/.exec(utility)
    if (!match) return false
    if (match[1] === 'accent' || match[1] === 'support' || match[1] === 'ink') return true
    if (NEUTRALS.has(match[1])) return Number(match[2] ?? 500) >= 600
    return CHROMATICS.has(match[1]) && Number(match[2] ?? 500) >= 400
  })
}

function reasonFor(token: string): string {
  const utility = token.split(':').pop() ?? token
  if (/gradient|^from-|^via-|^to-|bg-linear|bg-radial|bg-conic|bg-clip-text|text-transparent/.test(utility))
    return 'gradients are not in the system'
  if (/blur|backdrop/.test(utility)) return 'blur and glass are not in the system'
  if (/^shadow/.test(utility)) return 'this shadow is not in the system'
  if (/^(animate|transition|duration|ease|delay)/.test(utility)) return 'motion is not part of a static draft'
  if (/^tracking-|^leading-\[/.test(utility)) return 'the type role already sets tracking and leading'
  if (token.startsWith('dark:')) return 'one theme per system'
  if (utility.includes('[')) return 'arbitrary value outside the system'
  return 'not in the system'
}

/** Snaps or refuses every class, and strips what bypasses classes entirely. */
export function gate(html: string, system: System): GateResult {
  const actions: GateAction[] = []
  let out = html
  out = out.replace(/<style\b[\s\S]*?<\/style>/gi, () => {
    actions.push({ kind: 'refuse', from: '<style>', to: null, reason: 'styles come from the system only' })
    return ''
  })
  out = out.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  if (!system.images)
    out = out.replace(/<img\b[^>]*>/gi, () => {
      actions.push({ kind: 'refuse', from: '<img>', to: null, reason: 'this genome is type-only' })
      return ''
    })
  out = out.replace(/\p{Extended_Pictographic}\uFE0F?/gu, (glyph) => {
    if ('©®™'.includes(glyph[0])) return glyph
    actions.push({ kind: 'refuse', from: glyph, to: null, reason: 'emoji are not icons' })
    return ''
  })
  out = out.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, (_match, value: string) => {
    actions.push({ kind: 'refuse', from: `style=${value.slice(0, 60)}`, to: null, reason: 'style attributes bypass the system' })
    return ''
  })
  out = out.replace(/\sclass(?:Name)?\s*=\s*"([^"]*)"/g, (_match, value: string) => {
    const tokens = value.split(/\s+/).filter(Boolean)
    const context: Context = { system, actions, onFill: isOnFill(tokens) }
    const kept: string[] = []
    for (const token of tokens) {
      const gated = gateClass(token, context)
      if (gated === null) {
        actions.push({ kind: 'refuse', from: token, to: null, reason: reasonFor(token) })
        continue
      }
      if (gated !== token)
        actions.push({ kind: 'snap', from: token, to: gated, reason: 'nearest value in the system' })
      if (!kept.includes(gated)) kept.push(gated)
    }
    return kept.length ? ` class="${kept.join(' ')}"` : ''
  })
  return {
    html: out,
    actions,
    snapped: actions.filter((action) => action.kind === 'snap').length,
    refused: actions.filter((action) => action.kind === 'refuse').length
  }
}

/** A short, deduplicated account of what the gate changed, as a tool result would return it. */
export function describeActions(actions: GateAction[], limit = 30): string {
  const counts = new Map<string, { action: GateAction; count: number }>()
  for (const action of actions) {
    const key = `${action.from}→${action.to}`
    const entry = counts.get(key)
    if (entry) entry.count++
    else counts.set(key, { action, count: 1 })
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ action, count }) =>
      action.kind === 'snap'
        ? `snapped ${action.from} → ${action.to} (×${count})`
        : `refused ${action.from} (×${count}): ${action.reason}`
    )
    .join('\n')
}
