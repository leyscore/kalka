import { expect, test } from 'bun:test'

import { teamPageFromPath, teamPath } from '@/app/team/route'

test('each team page has its own address', () => {
  expect(teamPath('people')).toBe('/team/people')
  expect(teamPageFromPath('/team/people')).toBe('people')
  expect(teamPageFromPath('/team/settings/')).toBe('settings')
  expect(teamPageFromPath('/team/billing')).toBeNull()
  expect(teamPageFromPath('/files/recent')).toBeNull()
})
