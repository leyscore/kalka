import { expect, setDefaultTimeout, test } from 'bun:test'

import { baselineFor, fingerprintKalkaFolder } from '#tests/helpers/fig/regression'
import { repoPath } from '#tests/helpers/paths'

setDefaultTimeout(120_000)

// Kalka's own landing page, drawn in Kalka in nine languages and opened by `/demo`: a real
// document we own the rights to.
test('kalka-design opens and projects as its baseline', () => {
  const current = fingerprintKalkaFolder(repoPath('assets/demo/kalka-design'))
  expect(current).toEqual(baselineFor('kalka-design', current))
})
