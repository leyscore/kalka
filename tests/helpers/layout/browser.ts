import { afterAll } from 'bun:test'
import { readFileSync } from 'node:fs'

import { fromUint8Array } from 'js-base64'

import { BrowserLayoutEngine, installLayoutEngine, scriptLayoutPage } from '@kalka/core/layout'
import type { PageFontFace } from '@kalka/dom-css/export'

import { RenderHost } from '#cli/render/host/session'

import { publicPath } from '#tests/helpers/paths'

/**
 * Test preload: every `bun test` process lays out in Chromium, as the canvas does, through one
 * render host (`electron/dist/render-host.js`) started on the first layout and kept for the
 * whole process, so a suite pays for one browser, not one per test. Requests are synchronous,
 * as layout is; the host keeps its iframes and fonts between them. A run that isolates each file
 * (`--isolate`) gets a host per file, closed with it.
 *
 * Text lays out in the Inter the app bundles whatever fonts the machine has, so sizes are the
 * same on every platform and on the canvas. A layout the host cannot do fails the test that asked for it.
 */

/** Long enough for the host to start on a loaded machine; a layout itself takes milliseconds. */
const LAYOUT_TIMEOUT = 60_000

/** The Inter faces the app bundles and draws its canvas with. */
const INTER: PageFontFace[] = [
  ['Regular', '400'],
  ['Medium', '500'],
  ['SemiBold', '600'],
  ['Bold', '700'],
  ['ExtraBold', '800']
].map(([style, weight]) => ({
  family: 'Inter',
  weight,
  style: 'normal',
  data: fromUint8Array(readFileSync(publicPath(`Inter-${style}.ttf`)))
}))

let host: RenderHost | null = null
/** Whether the running host has the fixture fonts yet. */
let hasFonts = false

function hostAnswer(script: string): { result: unknown } | null {
  if (!host || host.closed) {
    host = RenderHost.start()
    hasFonts = false
  }
  if (!host) {
    throw new Error(
      'Layout needs the render host: run `node electron/node_modules/electron/install.js` and `bun run --cwd electron build:render-host` (on Linux, run tests under `xvfb-run`).'
    )
  }
  return host.request({ type: 'evaluate', script }, LAYOUT_TIMEOUT)
}

const evaluate = scriptLayoutPage(hostAnswer)

installLayoutEngine(
  new BrowserLayoutEngine((request) => {
    const fonts = hasFonts ? request.fonts : [...INTER, ...request.fonts]
    const result = evaluate({ ...request, fonts })
    if (!result) {
      // The next layout starts a new host rather than failing every test after this one.
      host?.close()
      throw new Error('The render host did not lay the document out')
    }
    hasFonts = true
    return result
  })
)

// Once after the run, or after each file of a run that isolates them.
afterAll(() => host?.close())
