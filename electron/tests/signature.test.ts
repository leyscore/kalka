import { describe, expect, test } from 'bun:test'

import { isAdhocSignature } from '../src/handlers/signature'

describe('isAdhocSignature', () => {
  test('recognizes the ad-hoc signature of an unsigned build', () => {
    const output = [
      'Executable=/Applications/Kalka.app/Contents/MacOS/Kalka',
      'Identifier=design.kalka.app',
      'CodeDirectory v=20400 size=297 flags=0x2(adhoc) hashes=3+3 location=embedded',
      'Signature=adhoc'
    ].join('\n')
    expect(isAdhocSignature(output)).toBe(true)
  })

  test('accepts a build signed with a certificate', () => {
    const output = [
      'Identifier=design.kalka.app',
      'Authority=Developer ID Application: Example (TEAM123456)',
      'Signature size=9000'
    ].join('\n')
    expect(isAdhocSignature(output)).toBe(false)
  })
})
