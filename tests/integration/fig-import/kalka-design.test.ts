import { expect, setDefaultTimeout, test } from 'bun:test'

import { baselineFor, fingerprintFixture } from '#tests/helpers/fig/regression'

setDefaultTimeout(120_000)

// Kalka's own landing page, drawn in Kalka in nine languages: a real document we own the rights to.
test('kalka-design opens and projects as its baseline', async () => {
  const current = await fingerprintFixture('kalka-design')
  expect(current).toEqual(baselineFor('kalka-design', current))
})
