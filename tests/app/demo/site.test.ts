import { expect, test } from 'bun:test'

import { isDemoHost } from '@/app/demo/site'

test('a demo host is recognised by its subdomain', () => {
  expect(isDemoHost('demo.kalka.design')).toBe(true)
  expect(isDemoHost('demo.localhost')).toBe(true)
})

test('the app and development hosts are not demo hosts', () => {
  expect(isDemoHost('kalka.design')).toBe(false)
  expect(isDemoHost('app.kalka.design')).toBe(false)
  expect(isDemoHost('localhost')).toBe(false)
  expect(isDemoHost('kalka-demo.example.com')).toBe(false)
})
