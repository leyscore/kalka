import { expect, setDefaultTimeout, test } from 'bun:test'

import { baselineFor, fingerprintFixture } from '#tests/helpers/fig/regression'

setDefaultTimeout(300_000)

// Parsing material3.fig takes gigabytes, more than a laptop running the editor can spare; it runs on CI.
test.skipIf(!process.env.CI)('material3.fig imports and projects as its baseline', async () => {
  const current = await fingerprintFixture('material3.fig')
  expect(current).toEqual(baselineFor('material3.fig', current))
})
