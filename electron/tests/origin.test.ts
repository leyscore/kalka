import { describe, expect, test } from 'bun:test'

import { isAppURL, isTrustedSender } from '../src/origin'

const DEV = 'http://localhost:1420'

describe('the app’s own pages', () => {
  test('are the built app, or the dev server in development', () => {
    expect(isAppURL('kalka-app://app/', undefined)).toBe(true)
    expect(isAppURL('kalka-app://app/updater.html', undefined)).toBe(true)
    expect(isAppURL(`${DEV}/updater.html`, DEV)).toBe(true)
    expect(isAppURL(DEV, DEV)).toBe(true)
  })

  test('leave out look-alikes and other origins', () => {
    expect(isAppURL('kalka-app://app.evil/', undefined)).toBe(false)
    expect(isAppURL('https://example.com/', undefined)).toBe(false)
    expect(isAppURL('file:///tmp/notes.html', undefined)).toBe(false)
    expect(isAppURL('http://localhost:14200/', DEV)).toBe(false)
    expect(isAppURL('kalka-app://app/', DEV)).toBe(false)
  })
})

describe('native calls', () => {
  test('run for the main frame of an app page', () => {
    expect(isTrustedSender({ url: 'kalka-app://app/', parent: null }, undefined)).toBe(true)
  })

  test('are refused from a page that is not the app’s, a subframe, or a frame that is gone', () => {
    expect(isTrustedSender({ url: 'https://example.com/notes', parent: null }, undefined)).toBe(
      false
    )
    expect(isTrustedSender({ url: 'file:///Users/me/drop.html', parent: null }, undefined)).toBe(
      false
    )
    expect(
      isTrustedSender({ url: 'kalka-app://app/sandbox/design-jsx.html', parent: {} }, undefined)
    ).toBe(false)
    expect(isTrustedSender(null, undefined)).toBe(false)
  })
})
