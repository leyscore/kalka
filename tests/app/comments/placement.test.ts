import { expect, test } from 'bun:test'

import { commentCardPlacement } from '@/app/comments/placement'

const card = { width: 288, height: 160 }
const canvas = { width: 1000, height: 700 }

function inside(at: { left: number; top: number }) {
  return (
    at.left >= 0 &&
    at.top >= 0 &&
    at.left + card.width <= canvas.width &&
    at.top + card.height <= canvas.height
  )
}

test('a card with room sits to the right of its pin', () => {
  const pin = { left: 200, top: 300 }
  const at = commentCardPlacement(pin, card, canvas)
  expect(at.left).toBeGreaterThan(pin.left)
  expect(inside(at)).toBe(true)
})

test('a card near the right edge flips to the left of its pin', () => {
  const pin = { left: 900, top: 300 }
  const at = commentCardPlacement(pin, card, canvas)
  expect(at.left + card.width).toBeLessThan(pin.left)
  expect(inside(at)).toBe(true)
})

test('a card near the top or the bottom stays in view', () => {
  expect(inside(commentCardPlacement({ left: 200, top: 5 }, card, canvas))).toBe(true)
  expect(inside(commentCardPlacement({ left: 200, top: 690 }, card, canvas))).toBe(true)
})
