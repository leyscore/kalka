// Puts the images a copy shows inside it. Kalka does not load images from other sites into a
// design, so a copy that only links them would paste as empty layers. The page may fetch its
// own images again: the copy carries those as data URLs, the others stay links.
import { dataURL } from './data-url'

/** Images larger than this stay links: a copy is meant to fit in the clipboard. */
const MAX_IMAGE_BYTES = 4_000_000
/** All the images of a copy together, as data URLs, stop growing it past this. */
const MAX_TOTAL_CHARACTERS = 24_000_000

const IMAGE_SOURCE = /(<img\b[^>]*?\ssrc=")(https?:[^"]+)"/g

/** An attribute value as the serializer escaped it, back to the URL it names. */
function unescapeAttribute(value: string): string {
  return value.replaceAll('&quot;', '"').replaceAll('&nbsp;', ' ').replaceAll('&amp;', '&')
}

/**
 * Replaces each `<img>`'s link with the file itself, in every copy the HTML carries. Each file
 * is fetched once, however many copies show it; one the page cannot fetch stays a link.
 */
export async function inlineImages(
  html: string,
  load: (url: string) => Promise<string | null> = (url) => dataURL(url, MAX_IMAGE_BYTES)
): Promise<string> {
  const found = [...html.matchAll(IMAGE_SOURCE)].map((match) => match[2] ?? '')
  const urls = new Set(found)
  if (urls.size === 0) return html
  const files = new Map<string, string>()
  await Promise.all(
    [...urls].map(async (url) => {
      const data = await load(unescapeAttribute(url))
      if (data) files.set(url, data)
    })
  )
  let budget = MAX_TOTAL_CHARACTERS
  const inlined = new Set<string>()
  for (const url of urls) {
    const data = files.get(url)
    const size = (data?.length ?? 0) * found.filter((each) => each === url).length
    if (!data || size > budget) continue
    budget -= size
    inlined.add(url)
  }
  return html.replace(IMAGE_SOURCE, (match, start: string, url: string) => {
    const data = inlined.has(url) ? files.get(url) : undefined
    return data ? `${start}${data}"` : match
  })
}
