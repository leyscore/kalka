import { afterAll } from 'bun:test'

import { installHostLayout } from '#tests/helpers/layout/host'

/**
 * Test preload: every `bun test` process lays out in Chromium, as the canvas does, through one
 * render host started on the first layout and kept for the whole process, so a suite pays for
 * one browser, not one per test (`installHostLayout`). A run that isolates each file
 * (`--isolate`) gets a host per file, closed with it.
 */
const layout = installHostLayout()

// Once after the run, or after each file of a run that isolates them.
afterAll(() => layout.close())
