import { describe, expect, test } from 'bun:test'

import { isTrustedServer, parseServerLaunch } from '@/app/collab/server/launch'

const CODE = 'a'.repeat(64)
const ROOM = 'abcdefghijklmnopqrstuvwxyz012345'
const OWN = 'https://edit.kalka.design'

describe('parseServerLaunch', () => {
  test('reads a Kalka Cloud workspace, its code and the document to open', () => {
    const launch = parseServerLaunch(
      `#kalka-server=${encodeURIComponent('https://app.kalka.design/w/0123456789abcdef')}&code=${CODE}&open=${ROOM}`,
      OWN
    )
    expect(launch).toEqual({
      url: 'https://app.kalka.design/w/0123456789abcdef',
      code: CODE,
      open: ROOM
    })
  })

  test('creates a new document when asked', () => {
    expect(
      parseServerLaunch(`#kalka-server=https://app.kalka.design/w/x&code=${CODE}&open=new`, OWN)
        ?.open
    ).toBe('new')
  })

  test('opens nothing for an id that is not a room', () => {
    expect(
      parseServerLaunch(`#kalka-server=https://app.kalka.design/w/x&code=${CODE}&open=../x`, OWN)
        ?.open
    ).toBeNull()
  })

  test('refuses a server the app does not trust, so a link cannot sign it in elsewhere', () => {
    expect(parseServerLaunch(`#kalka-server=https://evil.example&code=${CODE}`, OWN)).toBeNull()
  })

  test('refuses a malformed code and plain http', () => {
    expect(parseServerLaunch('#kalka-server=https://app.kalka.design&code=123', OWN)).toBeNull()
    expect(parseServerLaunch(`#kalka-server=http://app.kalka.design&code=${CODE}`, OWN)).toBeNull()
  })

  test('ignores fragments that are not launch links', () => {
    expect(parseServerLaunch('#section', OWN)).toBeNull()
  })
})

describe('isTrustedServer', () => {
  test('trusts Kalka Cloud and the page’s own origin only', () => {
    expect(isTrustedServer('https://app.kalka.design/w/abc', OWN)).toBe(true)
    expect(isTrustedServer('https://edit.kalka.design/api', OWN)).toBe(true)
    expect(isTrustedServer('https://app.kalka.design.evil.com', OWN)).toBe(false)
  })
})
