import { describe, expect, test } from 'bun:test'

import { versionBursts, versionMessage, type GitCommit } from '@/app/document/versions/git'

function commit(hash: string, author: string, time: number, agents: string[] = []): GitCommit {
  return { hash, author, time, subject: hash, agents }
}

describe('versions and their agents', () => {
  test('a version credits each agent once, in a trailer git reads back', () => {
    expect(versionMessage('Hero done', ['Fern', 'Fern', 'Oak'])).toBe(
      'Hero done\n\nKalka-Agent: Fern\nKalka-Agent: Oak'
    )
    expect(versionMessage('Hero done', [])).toBe('Hero done')
    // A name cannot break out of its trailer.
    expect(versionMessage('x', ['Evil\nSigned-off-by: me'])).toBe(
      'x\n\nKalka-Agent: Evil Signed-off-by: me'
    )
  })

  test('history reads as bursts: one person, the same agents, close together', () => {
    const hour = 3600
    const bursts = versionBursts([
      commit('e', 'Ada', 10 * hour, ['Fern']),
      commit('d', 'Ada', 10 * hour - 600, ['Fern']),
      commit('c', 'Ada', 10 * hour - 1200),
      commit('b', 'Ada', 5 * hour),
      commit('a', 'Bob', 5 * hour - 60)
    ])
    expect(
      bursts.map((burst) => [burst.author, burst.agents, burst.commits.map((item) => item.hash)])
    ).toEqual([
      ['Ada', ['Fern'], ['e', 'd']],
      ['Ada', [], ['c']],
      ['Ada', [], ['b']],
      ['Bob', [], ['a']]
    ])
  })
})
