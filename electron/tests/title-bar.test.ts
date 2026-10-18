import { describe, expect, test } from 'bun:test'

import {
  applyTitleBarTheme,
  TITLE_BAR_HEIGHT,
  titleBarOptions,
  trackTitleBar
} from '../src/handlers/title-bar'

function fakeWindow() {
  const overlays: unknown[] = []
  return {
    overlays,
    isDestroyed: () => false,
    setTitleBarOverlay: (options: unknown) => {
      overlays.push(options)
    }
  }
}

describe('title bar', () => {
  test('macOS hides the title bar and centres the traffic lights in the tab bar', () => {
    const options = titleBarOptions('darwin')
    expect(options.titleBarStyle).toBe('hidden')
    expect(options.trafficLightPosition).toEqual({ x: 14, y: 13 })
    expect(options.titleBarOverlay).toEqual({ height: TITLE_BAR_HEIGHT })
  })

  test.each(['win32', 'linux'] as const)(
    '%s draws caption buttons over the tab bar',
    (platform) => {
      const options = titleBarOptions(platform)
      expect(options.titleBarStyle).toBe('hidden')
      expect(options.trafficLightPosition).toBeUndefined()
      expect(options.titleBarOverlay).toEqual({
        height: TITLE_BAR_HEIGHT,
        color: '#0f0f12',
        symbolColor: '#ededf0'
      })
    }
  )

  test('caption buttons follow the theme on Windows and Linux only', () => {
    const window = fakeWindow()
    trackTitleBar(window)
    applyTitleBarTheme(window, 'light', 'win32')
    applyTitleBarTheme(window, 'dark', 'linux')
    applyTitleBarTheme(window, 'light', 'darwin')
    expect(window.overlays).toEqual([
      { height: TITLE_BAR_HEIGHT, color: '#e2e3df', symbolColor: '#121214' },
      { height: TITLE_BAR_HEIGHT, color: '#0f0f12', symbolColor: '#ededf0' }
    ])
  })

  test('a window that keeps its native frame is left alone', () => {
    const window = fakeWindow()
    applyTitleBarTheme(window, 'light', 'win32')
    expect(window.overlays).toEqual([])
  })
})
