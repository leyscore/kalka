import { FRESH_COMPONENTS, FRESH_LIBRARY_ID, defaultFreshVariant, freshCredit } from './catalog'
import type { FreshCategory, FreshComponent, FreshSource } from './types'

export interface FreshSearchResult {
  library_id: string
  asset_key: string
  name: string
  category: FreshCategory
  description: string
  use: string
  /** Variant properties and their values, the first the default. */
  variants: Readonly<Record<string, readonly string[]>>
  /** Text properties and their default text. */
  text_properties: Readonly<Record<string, string>>
  live: boolean
  source: FreshSource
  credit: string
  score: number
  /** The default variant's HTML, to adapt by writing it with write_html. */
  html?: string
}

export interface FreshSearchOptions {
  category?: FreshCategory
  limit?: number
  includeHTML?: boolean
}

const STOP_WORDS = new Set(
  'a an and as at be by for from i in into is it me my of on or our page some something that the this to use want we with your'.split(
    ' '
  )
)

/** Words an intent may say for what a component is called or does. */
const SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  animated: ['motion', 'live', 'shader', 'moving'],
  animation: ['motion', 'live', 'shader'],
  moving: ['motion', 'live', 'animated'],
  motion: ['animated', 'live', 'shader'],
  background: ['backgrounds', 'ground', 'texture', 'pattern', 'gradient'],
  backdrop: ['backgrounds', 'ground'],
  bg: ['backgrounds'],
  tech: ['shader', 'developer', 'software', 'saas', 'product', 'live', 'webgl'],
  saas: ['tech', 'software', 'product'],
  startup: ['tech', 'saas', 'launch'],
  developer: ['tech', 'code', 'retro', 'pixel'],
  dev: ['developer', 'tech'],
  headline: ['headlines', 'type', 'display', 'title'],
  heading: ['headlines', 'type', 'title'],
  title: ['headlines', 'headline', 'type'],
  typography: ['type', 'headlines', 'variable font'],
  text: ['type', 'headlines'],
  card: ['cards', 'panel'],
  panel: ['cards', 'card'],
  tile: ['cards', 'card'],
  button: ['buttons', 'cta', 'action'],
  cta: ['buttons', 'button', 'action'],
  action: ['buttons', 'cta'],
  link: ['buttons', 'underline'],
  hero: ['hero-devices', 'headline', 'backgrounds'],
  visual: ['hero-devices'],
  showcase: ['hero-devices', 'collage', 'gallery'],
  divider: ['separators', 'rule', 'seam'],
  separator: ['separators', 'divider', 'rule'],
  transition: ['separators', 'seam', 'edge'],
  section: ['separators', 'backgrounds'],
  luxury: ['premium', 'chrome', 'glass'],
  premium: ['luxury', 'glass', 'chrome', 'metal'],
  playful: ['fun', 'blob', 'gooey', 'soft'],
  fun: ['playful'],
  food: ['playful', 'paper', 'ticket', 'menu'],
  restaurant: ['food', 'menu', 'paper', 'ticket'],
  editorial: ['print', 'serif', 'magazine', 'type'],
  magazine: ['editorial', 'print'],
  print: ['halftone', 'paper', 'grain', 'risograph'],
  retro: ['pixel', 'dither', 'brutalist', 'halftone'],
  dark: ['moody', 'night', 'stage'],
  glass: ['frosted', 'fluted', 'translucent'],
  texture: ['grain', 'noise', 'paper', 'halftone'],
  portfolio: ['gallery', 'collage', 'images'],
  gallery: ['portfolio', 'collage', 'images'],
  photo: ['images', 'gallery', 'media'],
  image: ['images', 'media'],
  integrations: ['orbit', 'ecosystem'],
  services: ['orbit', 'studio'],
  notification: ['status', 'live', 'dynamic island'],
  app: ['mobile', 'status', 'live'],
  mobile: ['app', 'status'],
  badge: ['seal', 'stamp', 'award'],
  stamp: ['badge', 'seal', 'circle'],
  marquee: ['ticker', 'band'],
  announcement: ['ticker', 'band', 'banner']
}

function stem(word: string): string {
  return word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}-]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .map(stem)
}

/** The intent's words with the words they stand for, the latter weighing less. */
function expand(query: string): Map<string, number> {
  const weights = new Map<string, number>()
  for (const word of words(query)) {
    weights.set(word, 1)
    for (const synonym of SYNONYMS[word] ?? []) {
      const key = stem(synonym)
      weights.set(key, Math.max(weights.get(key) ?? 0, 0.5))
    }
  }
  return weights
}

function scoreComponent(component: FreshComponent, terms: Map<string, number>): number {
  const name = new Set(words(component.name))
  const tags = new Set(component.tags.flatMap((tag) => [stem(tag.toLowerCase()), ...words(tag)]))
  const category = new Set([
    component.category,
    stem(component.category),
    ...words(component.category)
  ])
  const prose = words(`${component.description} ${component.use}`)
  let score = 0
  for (const [term, weight] of terms) {
    if (name.has(term)) score += 4 * weight
    if (tags.has(term)) score += 3 * weight
    if (category.has(term)) score += 3 * weight
    if (component.live && (term === 'live' || term === 'shader')) score += weight
    score += prose.filter((word) => word === term).length * weight
  }
  return Math.round(score * 10) / 10
}

function result(component: FreshComponent, score: number, includeHTML: boolean): FreshSearchResult {
  return {
    library_id: FRESH_LIBRARY_ID,
    asset_key: component.key,
    name: component.name,
    category: component.category,
    description: component.description,
    use: component.use,
    variants: component.variants,
    text_properties: component.texts,
    live: component.live ?? false,
    source: component.source,
    credit: freshCredit(component),
    score,
    ...(includeHTML ? { html: component.html(defaultFreshVariant(component)) } : {})
  }
}

/**
 * The built-in components that fit an intent such as "animated background for a tech landing",
 * best first. Words are matched against each component's name, category, tags and sentences,
 * with the words they commonly stand for; an empty intent lists the whole library.
 */
export function searchFreshComponents(
  query: string,
  options: FreshSearchOptions = {}
): FreshSearchResult[] {
  const terms = expand(query)
  const pool = FRESH_COMPONENTS.filter(
    (component) => !options.category || component.category === options.category
  )
  const scored = pool
    .map((component) => ({
      component,
      score: terms.size === 0 ? 0 : scoreComponent(component, terms)
    }))
    .filter((entry) => terms.size === 0 || entry.score > 0)
    .sort((left, right) => right.score - left.score)
  return scored
    .slice(0, options.limit ?? (terms.size === 0 ? pool.length : 6))
    .map(({ component, score }) => result(component, score, options.includeHTML ?? false))
}
