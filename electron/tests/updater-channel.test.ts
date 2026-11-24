import { describe, expect, test } from 'bun:test'

import { GitHubProvider } from 'electron-updater/out/providers/GitHubProvider'

type ProviderArguments = ConstructorParameters<typeof GitHubProvider>

const RELEASE_YML = ['version: 0.0.0', 'path: Kalka.zip', 'sha512: abc', 'files: []'].join('\n')

function feed(tags: string[]): string {
  const entries = tags.map(
    (tag) =>
      `<entry><link rel="alternate" type="text/html" href="https://github.com/leyscore/kalka/releases/tag/${tag}"/><title>${tag}</title><content type="html">notes</content></entry>`
  )
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom">${entries.join('')}</feed>`
}

/** The provider reads only a few fields of the updater and its runtime options. */
function partial<T>(fields: unknown): T {
  return fields as T
}

/** The tag the updater settles on for an installed version, given the feed newest first. */
async function offered(currentVersion: string, tags: string[]): Promise<string> {
  const executor = {
    request: (options: { path?: string | null }) =>
      Promise.resolve(options.path?.endsWith('.atom') ? feed(tags) : RELEASE_YML)
  }
  const updater = { allowPrerelease: true, channel: null, currentVersion, fullChangelog: false }
  const provider = new GitHubProvider(
    { provider: 'github', owner: 'leyscore', repo: 'kalka' },
    partial<ProviderArguments[1]>(updater),
    partial<ProviderArguments[2]>({
      platform: 'darwin',
      isUseMultipleRangeRequest: false,
      executor
    })
  )
  const { tag } = await provider.getLatestVersion()
  return tag
}

describe('update channel', () => {
  test('a beta is offered a release candidate', async () => {
    expect(await offered('0.2.0-beta.10', ['v0.2.0-rc.1', 'v0.2.0-beta.10'])).toBe('v0.2.0-rc.1')
  })

  test('a beta is offered the stable release', async () => {
    expect(await offered('0.2.0-beta.10', ['v0.2.0', 'v0.2.0-rc.1'])).toBe('v0.2.0')
  })

  test('a release candidate is offered the stable release', async () => {
    expect(await offered('0.2.0-rc.1', ['v0.2.0', 'v0.2.0-rc.1'])).toBe('v0.2.0')
  })

  test('a release candidate is offered the next one, not a later beta', async () => {
    expect(await offered('0.2.0-rc.1', ['v0.3.0-beta.1', 'v0.2.0-rc.2', 'v0.2.0-rc.1'])).toBe(
      'v0.2.0-rc.2'
    )
  })

  test('a beta is not offered an alpha', async () => {
    expect(await offered('0.2.0-beta.10', ['v0.3.0-alpha.1', 'v0.2.0-beta.11'])).toBe(
      'v0.2.0-beta.11'
    )
  })

  test('a tag outside the release channels is skipped', async () => {
    expect(await offered('0.2.0-beta.10', ['v0.3.0-nightly.4', 'v0.2.0-beta.11'])).toBe(
      'v0.2.0-beta.11'
    )
  })
})
