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
 * The families with an optical size axis as of November 2026, for browsers, where Google's
 * metadata cannot be read across origins: without it their fonts would come at the default size.
 */
const KNOWN_OPTICAL_SIZES: ReadonlyArray<[string, AxisRange]> = [
  ['Ballet', ['16', '72']],
  ['Big Shoulders', ['10', '72']],
  ['Big Shoulders Inline', ['10', '72']],
  ['Big Shoulders Stencil', ['10', '72']],
  ['Bodoni Moda', ['6', '96']],
  ['Bodoni Moda SC', ['6', '96']],
  ['Bricolage Grotesque', ['12', '96']],
  ['DM Sans', ['9', '40']],
  ['Fraunces', ['9', '144']],
  ['Google Sans', ['17', '18']],
  ['Google Sans Flex', ['1', '144']],
  ['Hedvig Letters Serif', ['12', '24']],
  ['Imbue', ['10', '100']],
  ['Inter', ['14', '32']],
  ['Jaro', ['6', '72']],
  ['Literata', ['7', '72']],
  ['Merriweather', ['18', '144']],
  ['Montagu Slab', ['16', '144']],
  ['Newsreader', ['6', '72']],
  ['Nunito Sans', ['6', '12']],
  ['Pathway Extreme', ['8', '144']],
  ['Piazzolla', ['8', '30']],
  ['Playfair', ['5', '1200']],
  ['Roboto Flex', ['8', '144']],
  ['Roboto Serif', ['8', '144']],
  ['Source Serif 4', ['8', '60']],
  ['Texturina', ['12', '72']],
  ['TikTok Sans', ['12', '36']],
  ['Truculenta', ['12', '72']]
]

/**
 * The optical size range of each Google Fonts family that has one. Requested with that range,
 * a family comes as a variable font, and browsers pick the optical size for each font size, as
 * they do on the sites that use it; without it, Google serves the axis's default, drawn for
 * small text and wider at display sizes.
 */
export async function loadGoogleOpticalSizes(
  fetcher: (url: string) => Promise<Response>
): Promise<Map<string, AxisRange>> {
  const known = () => new Map(KNOWN_OPTICAL_SIZES)
  const response = await fetcher(GOOGLE_FONTS_METADATA_URL).catch(() => null)
  if (!response?.ok) return known()
  const parsed = v.safeParse(MetadataSchema, await response.json())
  if (!parsed.success) return known()
  const ranges = new Map<string, AxisRange>()
  for (const { family, axes } of parsed.output.familyMetadataList) {
    const opsz = axes.find((axis) => axis.tag === 'opsz')
    if (opsz) ranges.set(family, [String(opsz.min), String(opsz.max)])
  }
  return ranges
}
