import { expect, setDefaultTimeout, test } from 'bun:test'

import { baselineFor, fingerprintFixture } from '#tests/helpers/fig/regression'

setDefaultTimeout(120_000)

for (const file of [
  'gold-preview.fig',
  'slots.fig',
  'circle-text.fig',
  'variable-override-precedence.fig'
]) {
  test(`${file} imports and projects as its baseline`, async () => {
    const current = await fingerprintFixture(file)
    expect(current).toEqual(baselineFor(file, current))
  })
}
