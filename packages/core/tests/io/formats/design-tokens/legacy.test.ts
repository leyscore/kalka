import { expect, test } from 'bun:test'

import { KALKA_EXTENSION, kalkaExtension } from '#core/io/formats/design-tokens/types'

test('tokens keep reading Kalka fields saved under the extension key from before the rename', () => {
  expect(KALKA_EXTENSION).toBe('design.kalka')
  expect(kalkaExtension({ 'dev.openpencil': { unit: 'rem' } })).toEqual({ unit: 'rem' })
  expect(
    kalkaExtension({ 'design.kalka': { unit: 'px' }, 'dev.openpencil': { unit: 'rem' } })
  ).toEqual({ unit: 'px' })
  expect(kalkaExtension(undefined)).toBeUndefined()
})
