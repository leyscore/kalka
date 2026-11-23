// Files the page loaded, fetched again as data URLs so a copy carries them: Kalka lays a paste
// out on its own page, which may not load other sites' files.

/** A file as a data URL, or null when the page cannot fetch it or it is larger than `maxBytes`. */
export async function dataURL(url: string, maxBytes: number): Promise<string | null> {
  try {
    const response = await fetch(url, { credentials: 'omit' })
    if (!response.ok) return null
    const blob = await response.blob()
    if (blob.size > maxBytes) return null
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        resolve(typeof reader.result === 'string' ? reader.result : null)
      })
      reader.addEventListener('error', () => {
        resolve(null)
      })
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Reads files through the extension, for the ones their site refuses to the page: each file's
 * text, or the file as a data URL, by its address. A file it cannot read is left out.
 */
export type ReadFiles = (urls: string[], kind: 'text' | 'data') => Promise<Record<string, string>>

/** A data URL is about a third longer than the file it holds. */
const DATA_URL_GROWTH = 1.37

/**
 * Files as data URLs, by address: fetched by the page where their site lets it, and read by
 * `read` otherwise. A file neither can get, or larger than `maxBytes`, is left out.
 */
export async function dataURLs(
  urls: readonly string[],
  maxBytes: number,
  read?: ReadFiles,
  load: (url: string) => Promise<string | null> = (url) => dataURL(url, maxBytes)
): Promise<Map<string, string>> {
  const files = new Map<string, string>()
  await Promise.all(
    urls.map(async (url) => {
      const data = await load(url)
      if (data) files.set(url, data)
    })
  )
  const refused = urls.filter((url) => !files.has(url))
  if (!read || refused.length === 0) return files
  // Without the extension's reading, the refused files stay links.
  const again = await read(refused, 'data').catch(() => ({}))
  for (const [url, data] of Object.entries(again))
    if (data.length <= maxBytes * DATA_URL_GROWTH) files.set(url, data)
  return files
}
