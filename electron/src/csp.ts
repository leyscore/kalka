/** Content policies of the pages the desktop app serves from `kalka-app://`, without Electron imports. */

/**
 * What the editor's pages may load and run: their own files, CanvasKit's WebAssembly, images and
 * fonts from data, blobs and HTTPS, and requests to HTTPS services and the local MCP server.
 * Artboards add their own, stricter policy.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: blob: https:",
  "connect-src 'self' data: blob: https: http://127.0.0.1:* ws://127.0.0.1:*",
  "media-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "frame-src 'self' about: blob: data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ')

/**
 * The Design JSX sandbox page (`public/sandbox/design-jsx.html`) runs agents' and the code panel's
 * code in an opaque-origin iframe, so it gets its own policy instead of the editor's: scripts and
 * `eval` there, and nothing else. The page repeats it in a meta tag for the web app (`electron/tests/csp.test.ts`).
 */
export const SANDBOX_PATH = '/sandbox/design-jsx.html'
export const SANDBOX_CONTENT_SECURITY_POLICY =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; style-src 'none'; object-src 'none'; frame-src 'none'; worker-src blob:; base-uri 'none'; form-action 'none'"
