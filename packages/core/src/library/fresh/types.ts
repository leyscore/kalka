/** Where a Fresh component comes from: every one is a port, credited to its source. */
export interface FreshSource {
  library: 'Paper Shaders' | 'Fancy Components' | 'Cult UI' | 'Codrops'
  author: string
  license: 'Apache-2.0' | 'MIT'
  /** The original component or demo, by its name in the source. */
  original: string
  url: string
}

export const FRESH_CATEGORIES = [
  'backgrounds',
  'headlines',
  'cards',
  'buttons',
  'hero-devices',
  'separators'
] as const
export type FreshCategory = (typeof FRESH_CATEGORIES)[number]

/** The variant property values of one variant, by property name. */
export type VariantValues = Readonly<Record<string, string>>

export interface FreshComponent {
  /** Stable library asset key. */
  key: string
  name: string
  category: FreshCategory
  /** What it is, in one sentence. */
  description: string
  /** The page moment it is for, in one sentence. */
  use: string
  /** Words an intent is matched against, besides the name, category and sentences. */
  tags: readonly string[]
  source: FreshSource
  /** Variant properties: name to values, the first value the default. */
  variants: Readonly<Record<string, readonly string[]>>
  /** Text properties: name to default text; every text showing the default is bound to it. */
  texts: Readonly<Record<string, string>>
  /** Runs a live Paper shader in Kalka; elsewhere its stand-in gradient shows. */
  live?: boolean
  /** The HTML of one variant: one root element with its size set. */
  html(values: VariantValues): string
}
