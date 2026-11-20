import { describe, expect, test } from 'bun:test'

import { APP_MENU_SCHEMA } from '@/app/shell/menu/schema'
import { docsURL } from '@/constants'

describe('the documentation link', () => {
  test('opens the docs in the app language, English at the site root', () => {
    expect(docsURL('en')).toBe('https://kalka.design/docs')
    expect(docsURL('fr')).toBe('https://kalka.design/fr/docs')
    expect(docsURL('zh-CN')).toBe('https://kalka.design/zh/docs')
  })

  test('a language the site does not have falls back to the English docs', () => {
    expect(docsURL('pt')).toBe('https://kalka.design/docs')
  })

  test('the View menu has a Documentation item handled by the shell', () => {
    const view = APP_MENU_SCHEMA.find((group) => group.label === 'View')
    const item = view?.items.find((entry) => 'id' in entry && entry.id === 'documentation')
    expect(item).toMatchObject({ label: 'Documentation', handler: 'shell' })
  })
})
