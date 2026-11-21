import { BACKGROUNDS } from './backgrounds'
import { BUTTONS } from './buttons'
import { CARDS } from './cards'
import { HEADLINES } from './headlines'
import { HERO_DEVICES } from './heroes'
import { SEPARATORS } from './separators'
import type { FreshComponent, VariantValues } from './types'

/** The built-in library of fresh components every document can use. */
export const FRESH_LIBRARY_ID = 'kalka-fresh'
export const FRESH_LIBRARY_NAME = 'Kalka Fresh'
/** Bumped by hand when a component changes, so documents see an update. */
export const FRESH_LIBRARY_REVISION = 'fresh-2026.11.1'
export const FRESH_LIBRARY_PUBLISHED_AT = '2026-11-22T00:00:00.000Z'
export const FRESH_LIBRARY_DESCRIPTION =
  'Design-forward pieces ported to HTML and CSS from Paper Shaders, Fancy Components, Cult UI and Codrops. Their colours follow the document variables ground, ink, accent, muted and line.'

export const FRESH_COMPONENTS: readonly FreshComponent[] = [
  ...BACKGROUNDS,
  ...HEADLINES,
  ...CARDS,
  ...BUTTONS,
  ...HERO_DEVICES,
  ...SEPARATORS
]

export function findFreshComponent(key: string): FreshComponent | undefined {
  return FRESH_COMPONENTS.find((component) => component.key === key)
}

/** Every variant of a component, in the order of its properties and their values. */
export function freshVariants(component: FreshComponent): VariantValues[] {
  return Object.entries(component.variants).reduce<VariantValues[]>(
    (combinations, [property, values]) =>
      combinations.flatMap((combination) =>
        values.map((value) => ({ ...combination, [property]: value }))
      ),
    [{}]
  )
}

/** The variant every property's first value makes. */
export function defaultFreshVariant(component: FreshComponent): VariantValues {
  return Object.fromEntries(
    Object.entries(component.variants).map(([property, values]) => [property, values[0] ?? ''])
  )
}

/** The credit a component carries in its description and in tool results. */
export function freshCredit(component: FreshComponent): string {
  const { library, author, license, original } = component.source
  return `Ported from ${original} in ${library} by ${author}, ${license}.`
}
