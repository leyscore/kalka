import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import { RemoteURL } from '../src/handlers/git-remote'

describe('RemoteURL', () => {
  test('accepts the addresses GitHub and other hosts give', () => {
    for (const url of [
      'https://github.com/pixelers/site.git',
      'https://gitlab.example.com:8443/team/design/site',
      'git@github.com:pixelers/site.git'
    ])
      expect(v.is(RemoteURL, url)).toBe(true)
  })

  test('trims the spaces a pasted address comes with', () => {
    expect(v.parse(RemoteURL, '  https://github.com/pixelers/site.git\n')).toBe(
      'https://github.com/pixelers/site.git'
    )
  })

  test('rejects options, other transports and command text', () => {
    for (const url of [
      '--upload-pack=touch /tmp/x',
      '-o',
      'ext::sh -c id',
      'file:///etc/passwd',
      'http://github.com/pixelers/site.git',
      'https://github.com/pixelers/site.git; rm -rf ~',
      'https://user:secret@github.com/pixelers/site.git',
      ''
    ])
      expect(v.is(RemoteURL, url)).toBe(false)
  })
})
