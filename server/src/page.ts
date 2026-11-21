import { CONSOLE_JS, ICONS_JS, KIT_CSS, KIT_JS } from './console/bundle'

/** The Kalka K on its blue tile, for the browser tab. */
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#2F5BEA"/><svg x="14" y="14" width="72" height="72" viewBox="14 14 72 72"><rect x="14" y="14" width="22" height="72" fill="#EFEFEC"/><path d="M40 50 L86 14 L86 50 Z" fill="#EFEFEC"/><path d="M40 50 A46 36 0 0 0 86 86 L86 50 Z" fill="#EFEFEC"/></svg></svg>`

function escapeHtml(text: string): string {
  return text.replace(/[<>&"]/g, (char) => `&#${char.charCodeAt(0)};`)
}

/** The console: one page drawn by src/console/console.js with the console kit. */
export function consolePage(serverName: string): string {
  // A `</` inside the embedded script or style would end its element early.
  const safe = (text: string) => text.replaceAll('</', '<\\/')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(serverName)}</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(ICON)}">
<link rel="preload" href="/assets/geist.woff2" as="font" type="font/woff2" crossorigin>
<style>${safe(KIT_CSS)}</style>
</head>
<body>
<div id="console"></div>
<script>${safe(ICONS_JS)}</script>
<script>${safe(KIT_JS)}</script>
<script>${safe(CONSOLE_JS)}</script>
</body>
</html>`
}
