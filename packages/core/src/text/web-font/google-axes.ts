import * as v from 'valibot'

const GOOGLE_FONTS_METADATA_URL = 'https://fonts.google.com/metadata/fonts'

const MetadataSchema = v.object({
  familyMetadataList: v.array(
    v.object({
      family: v.string(),
      axes: v.optional(
        v.array(v.object({ tag: v.string(), min: v.number(), max: v.number() })),
        () => []
      )
    })
  )
})

/** An axis range as Google Fonts' `css2` API names it: `12..96`. */
export type AxisRange = [string, string]

/**
 * The optical size range of each Google Fonts family that has one. Requested with that range,
 * a family comes as a variable font, and browsers pick the optical size for each font size, as
 * they do on the sites that use it; without it, Google serves the axis's default, drawn for
 * small text and wider at display sizes.
 */
export async function loadGoogleOpticalSizes(
  fetcher: (url: string) => Promise<Response>
): Promise<Map<string, AxisRange>> {
  const response = await fetcher(GOOGLE_FONTS_METADATA_URL)
  if (!response.ok) return new Map()
  const parsed = v.safeParse(MetadataSchema, await response.json())
  if (!parsed.success) return new Map()
  const ranges = new Map<string, AxisRange>()
  for (const { family, axes } of parsed.output.familyMetadataList) {
    const opsz = axes.find((axis) => axis.tag === 'opsz')
    if (opsz) ranges.set(family, [String(opsz.min), String(opsz.max)])
  }
  return ranges
}
