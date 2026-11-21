/**
 * Turns gated section HTML into one static, self-contained page: the genome's Tailwind theme
 * compiled against the classes the page uses, the fonts, and nothing else. The result is plain
 * HTML and CSS, which is what Kalka imports and what `write_html` takes.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { compile } from 'tailwindcss'

import { fontLinks, themeCSS, type System } from './genome'

const require = createRequire(import.meta.url)
const TAILWIND_DIR = dirname(require.resolve('tailwindcss/package.json'))

export function candidates(html: string): string[] {
  const found = new Set<string>()
  for (const match of html.matchAll(/\sclass\s*=\s*"([^"]*)"/g))
    for (const token of match[1].split(/\s+/)) if (token) found.add(token)
  return [...found]
}

export async function compileCSS(system: System, html: string): Promise<string> {
  const compiler = await compile(themeCSS(system), {
    base: TAILWIND_DIR,
    loadStylesheet: async (id, base) => {
      const path = id === 'tailwindcss' ? join(TAILWIND_DIR, 'index.css') : join(base, id)
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
    }
  })
  return compiler.build(candidates(html))
}

/** Phone screens sit side by side on a neutral board, each at 390 px, as a designer presents them. */
const MOBILE_BOARD = `
  body { background: color-mix(in oklab, var(--color-ink) 14%, var(--color-ground)); }
  main[data-board] { display: flex; gap: 40px; padding: 48px; align-items: flex-start; justify-content: center; }
  main[data-board] > section { width: 390px; min-height: 844px; flex: none; overflow: hidden; background: var(--color-ground); display: flex; flex-direction: column; }
`

export async function buildPage(system: System, sections: string, title: string): Promise<string> {
  const css = await compileCSS(system, sections)
  const body =
    system.surface === 'mobile' ? `<main data-board>\n${sections}\n</main>` : sections
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replaceAll('<', '&lt;')}</title>
${fontLinks(system)}
<style>
${css}
${system.surface === 'mobile' ? MOBILE_BOARD : ''}
</style>
</head>
<body>
${body}
</body>
</html>
`
}
