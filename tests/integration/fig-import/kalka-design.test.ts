import { expect, setDefaultTimeout, test } from 'bun:test'

import { baselineFor, fingerprintKalkaFolder } from '#tests/helpers/fig/regression'
import { repoPath } from '#tests/helpers/paths'

setDefaultTimeout(120_000)

// Kalka's own landing page, drawn in Kalka in nine languages: a real document we own the rights
// to, kept as a fixture since `/demo` opens Learn the basics instead.
test('kalka-design opens and projects as its baseline', () => {
  const current = fingerprintKalkaFolder(repoPath('tests/fixtures/kalka-design'))
  expect(current).toEqual(baselineFor('kalka-design', current))
})
