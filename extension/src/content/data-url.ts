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
