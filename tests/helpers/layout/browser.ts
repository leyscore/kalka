import { afterAll, beforeAll } from 'bun:test'

import { installHostLayout } from '#tests/helpers/layout/host'

/**
 * Test preload: every `bun test` process lays out in Chromium, as the canvas does, through one
 * render host started on the first layout and kept for the whole process, so a suite pays for
 * one browser, not one per test (`installHostLayout`). A run that isolates each file
 * (`--isolate`) gets a host per file, closed with it.
 */
const layout = installHostLayout()

/** Long enough for a CI runner to start the host. */
const HOST_START_TIMEOUT = 60_000

// A CI runner takes seconds to start the host; waiting here keeps that out of whichever test
// lays out first, which would otherwise outrun its own timeout. Locally the host starts on demand.
if (process.env.CI) beforeAll(() => layout.warm(), HOST_START_TIMEOUT)

// Once after the run, or after each file of a run that isolates them.
afterAll(() => layout.close())
