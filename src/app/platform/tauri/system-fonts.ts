/**
 * Installed fonts through Chromium's Local Font Access API, which Electron grants the editor
 * without a prompt. It returns the same data the Tauri build read natively: families with
 * their styles, and each face's sfnt bytes.
 */
type LocalFontData = FontData

let fonts: Promise<LocalFontData[]> | null = null

function query(): Promise<LocalFontData[]> {
  // Only the Electron build reaches this, on Chromium, which ships the API.
  // eslint-disable-next-line compat/compat -- Chromium-only desktop code path
  fonts ??= (window.queryLocalFonts?.() ?? Promise.resolve([])).catch(() => {
    fonts = null
    return []
  })
  return fonts
}

export async function listSystemFonts(): Promise<{ family: string; styles: string[] }[]> {
  const families = new Map<string, Set<string>>()
  for (const font of await query()) {
    let styles = families.get(font.family)
    if (!styles) families.set(font.family, (styles = new Set()))
    styles.add(font.style)
  }
  return [...families]
    .map(([family, styles]) => ({ family, styles: [...styles] }))
    .sort((a, b) => a.family.localeCompare(b.family))
}

/** A face's bytes; rejects with `code: 'not-found'` as Tauri did when it is not installed. */
export async function loadSystemFont(family: string, style: string): Promise<ArrayBuffer> {
  const all = await query()
  const font =
    all.find((candidate) => candidate.family === family && candidate.style === style) ??
    all.find(
      (candidate) =>
        candidate.family === family && candidate.style.toLowerCase() === style.toLowerCase()
    )
  // Callers read `code`, as on the error the native command returned.
  if (!font)
    throw Object.assign(new Error(`${family} ${style} is not installed`), { code: 'not-found' })
  return (await font.blob()).arrayBuffer()
}
