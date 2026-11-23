import { compact } from 'es-toolkit/array'

/** Where web font stylesheets come from; the only links an import reads. */
const WEB_FONT_STYLESHEET_HOST = 'fonts.googleapis.com'

/**
 * The web font stylesheets a page links, as text for the page an import measures in: the import
 * reads only the page's own styles, and text measured in a fallback font sizes boxes and wraps
 * lines as the design never does. A stylesheet that cannot be read is left out.
 */
export function webFontCSS(
  links: readonly string[],
  cache: Map<string, Promise<string>> = new Map()
): Promise<string> {
  return Promise.all(
    links.map((href) => {
      let url: URL
      try {
        url = new URL(href)
      } catch {
        return ''
      }
      if (url.protocol !== 'https:' || url.hostname !== WEB_FONT_STYLESHEET_HOST) return ''
      let css = cache.get(url.href)
      if (!css) {
        css = fetch(url.href, { credentials: 'omit' })
          .then((response) => (response.ok ? response.text() : ''))
          .catch(() => '')
        cache.set(url.href, css)
      }
      return css
    })
  ).then((sheets) => compact(sheets).join('\n'))
}

/** The stylesheets an HTML page links, as written in its `<link rel="stylesheet">` tags. */
export function linkedStylesheets(html: string): string[] {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  return compact(
    Array.from(parsed.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet" i][href]')).map(
      (link) => link.getAttribute('href')
    )
  )
}
