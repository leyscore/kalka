import { describe, expect, test } from 'bun:test'

import { NEXT_SECTION_HEIGHT, planGhosts, planHeight } from '@/app/presence/plan'

const start = { x: 2000, y: 100, width: 1440, height: 900 }
const plan = [
  { name: 'Hero', height: 700 },
  { name: 'Roasts', height: 500 },
  { name: 'Footer', height: 200 }
]

describe('section plan outlines', () => {
  test('stack where the page will be before the agent wrote anything', () => {
    const ghosts = planGhosts({ id: 'a', plan }, { progress: null, start })
    expect(ghosts.map(({ name, y, height, state }) => ({ name, y, height, state }))).toEqual([
      { name: 'Hero', y: 100, height: 700, state: 'next' },
      { name: 'Roasts', y: 800, height: 500, state: 'later' },
      { name: 'Footer', y: 1300, height: 200, state: 'later' }
    ])
    expect(ghosts.every((ghost) => ghost.x === 2000 && ghost.width === 1440)).toBe(true)
    expect(planHeight({ plan })).toBe(1400)
  })

  test('keep only what is not built, under the last built section, at its real size', () => {
    const progress = { root: { x: 40, y: 0, width: 1280, height: 640 }, built: 1, nextY: 655 }
    const ghosts = planGhosts({ id: 'a', plan }, { progress, start })
    expect(ghosts.map(({ key, x, y, width }) => ({ key, x, y, width }))).toEqual([
      { key: 'a:1', x: 40, y: 655, width: 1280 },
      { key: 'a:2', x: 40, y: 1155, width: 1280 }
    ])
    expect(ghosts.at(0)?.state).toBe('next')
  })

  test('are gone once every announced section exists, even with more layers than announced', () => {
    const progress = { root: { x: 0, y: 0, width: 1440, height: 1500 }, built: 5, nextY: 1500 }
    expect(planGhosts({ id: 'a', plan }, { progress, start })).toEqual([])
  })

  test('never invent a structure for an agent that announced none', () => {
    const before = planGhosts({ id: 'a' }, { progress: null, start })
    // One outline the size of its page, with no name and no sections.
    expect(before).toHaveLength(1)
    expect(before.at(0)).toMatchObject({ name: '', state: 'next', ...start })
    const progress = { root: { x: 0, y: 0, width: 1440, height: 600 }, built: 1, nextY: 600 }
    const ghosts = planGhosts({ id: 'a', plan: [] }, { progress, start })
    expect(ghosts).toHaveLength(1)
    expect(ghosts.at(0)).toMatchObject({ name: '', y: 600, height: NEXT_SECTION_HEIGHT })
  })
})
