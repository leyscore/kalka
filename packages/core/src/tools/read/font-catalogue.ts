import * as v from 'valibot'

import { KalkaAPI } from '#core/kalka-api'
import { defineTool } from '#core/tools/schema'

const failure = (error: unknown) => ({
  error: error instanceof Error ? error.message : String(error)
})

export const searchFonts = defineTool({
  name: 'search_fonts',
  description:
    'Search the free font catalogue (every Google Fonts family and other open-licence ones) by ' +
    'family name. Returns families with their category, licence, weights, styles, whether they ' +
    'are variable, and whether the document already carries them. Use it when choosing a ' +
    'typeface, then add_font to keep the one you pick with the document.',
  execution: { kind: 'async', mutation: 'none' },
  capabilities: ['document:read', 'network:access'],
  input: v.strictObject({
    query: v.pipe(v.string(), v.description('Family name or part of it, e.g. "grotesk"')),
    limit: v.optional(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(50), v.description('Default 20'))
    )
  }),
  execute: async (figma, { query, limit }) => {
    try {
      const fonts = await new KalkaAPI(figma).searchFonts(query, { limit })
      return { count: fonts.length, fonts }
    } catch (error) {
      return failure(error)
    }
  }
})

export const addFont = defineTool({
  name: 'add_font',
  description:
    'Download an open-licence family from the free font catalogue into the document, with its ' +
    'licence file, and load it, so text set in it draws the same offline, for teammates and in ' +
    'exported HTML. Call it for every family you set text in that the computer may not have. ' +
    'Returns the weights and styles it carries; an unknown name returns close names instead.',
  execution: { kind: 'async', mutation: 'document' },
  capabilities: ['document:write', 'network:access'],
  input: v.strictObject({
    family: v.pipe(
      v.string(),
      v.minLength(1),
      v.description('Exact family name, e.g. "Inter Tight"')
    )
  }),
  execute: async (figma, { family }) => {
    try {
      return { font: await new KalkaAPI(figma).addFont(family) }
    } catch (error) {
      return failure(error)
    }
  }
})
