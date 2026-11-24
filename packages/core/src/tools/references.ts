import * as v from 'valibot'

import type { AgentQuestionImage } from '#core/figma-api'

import { defineTool } from './schema'
import { getActiveProvider, type StockPhotoProvider } from './stock-photo/providers'

/**
 * Visual references come from the stock photo service the person connected in Images and photos
 * (Pexels or Unsplash), the same one stock_photo uses, so they look like the pictures a real
 * page would carry. Each reference names its photographer and links to its page. References are
 * shown for inspiration only, never placed in the design.
 */
export const REFERENCE_COUNT = { min: 4, max: 8, default: 6 } as const

/** The side of the picture the chat shows, small enough to load fast in a grid. */
const THUMBNAIL_SIZE = 400

/** One reference, in the shape ask_user shows as a picture the person can pick. */
export type VisualReference = AgentQuestionImage

const SERVICES: Partial<Record<string, { title: string; page: (id: string) => string }>> = {
  pexels: {
    title: 'Pexels',
    page: (id) => `https://www.pexels.com/photo/${encodeURIComponent(id)}/`
  },
  unsplash: {
    title: 'Unsplash',
    page: (id) => `https://unsplash.com/photos/${encodeURIComponent(id)}`
  }
}

/** Searches the connected service and returns up to `count` references. */
export async function searchReferences(
  provider: StockPhotoProvider,
  query: string,
  count: number
): Promise<VisualReference[]> {
  const photos = await provider.search(query, {
    perPage: count,
    orientation: 'landscape',
    targetDim: THUMBNAIL_SIZE
  })
  const service = SERVICES[provider.name]
  const source = service?.title ?? provider.name
  return photos
    .filter((photo) => photo.url.startsWith('https://'))
    .slice(0, count)
    .map((photo) => {
      const reference: VisualReference = { url: photo.url, label: query }
      if (service) reference.link = service.page(photo.sourceId)
      reference.credit = photo.photographer ? `${photo.photographer}, ${source}` : source
      return reference
    })
}

export const findReferences = defineTool({
  name: 'find_references',
  description:
    'Search the stock photo service the person connected, when they connected one, for mood photos that match a style or a subject, such as "bauhaus poster", "minimal coffee packaging", "bakery interior warm light". Use it during the kickoff, then pass the references to ask_user as the images of one question so the person picks those they like, refuses them all, or sends their own picture. Screenshots of real sites from a connected design-reference library come first and need no photo service; these photos are an extra. References are for direction only: never put them in the design. Write the query in English from the style and the subject, never with a person\'s or a client\'s name.',
  execution: { kind: 'async', mutation: 'none' },
  capabilities: ['network:access'],
  exposure: { webmcp: false },
  input: v.strictObject({
    query: v.pipe(
      v.string(),
      v.minLength(2),
      v.maxLength(120),
      v.description('What to look for, in English: a style, a medium, a subject')
    ),
    count: v.optional(
      v.pipe(
        v.number(),
        v.integer(),
        v.minValue(REFERENCE_COUNT.min),
        v.maxValue(REFERENCE_COUNT.max),
        v.description(
          `How many references, ${REFERENCE_COUNT.min} to ${REFERENCE_COUNT.max}; ${REFERENCE_COUNT.default} by default`
        )
      )
    )
  }),
  execute: async (_figma, { query, count = REFERENCE_COUNT.default }) => {
    const provider = getActiveProvider()
    if (!provider) {
      return {
        references: [],
        note: "No photos to show here. Go on without them and do not mention it to the person: take references from a connected design-reference library when this session has one, or from the product's own world."
      }
    }
    const source = SERVICES[provider.name]?.title ?? provider.name
    try {
      const references = await searchReferences(provider, query.trim(), count)
      if (references.length === 0) {
        return {
          references,
          source,
          note: 'Nothing matched. Try a broader query, such as the subject alone.'
        }
      }
      return { references, source }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      return { error: `Could not search ${source}: ${reason}. Offer the styles in words instead.` }
    }
  }
})
