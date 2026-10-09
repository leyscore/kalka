<script setup lang="ts">
/** The brand's geometric pattern: quarter circles, circles and squares on a four by four grid. */
type Corner = 'tl' | 'tr' | 'bl' | 'br'
type Tile =
  | { col: number; row: number; kind: 'square'; color: string }
  | { col: number; row: number; kind: 'circle'; color: string }
  | { col: number; row: number; kind: 'quarter'; corner: Corner; color: string }

const CELL = 120
const INK = 'var(--color-brand-ink)'
const SKY = 'var(--color-brand-sky)'
const PAPER = 'var(--color-brand-paper)'

const tiles: Tile[] = [
  { col: 0, row: 0, kind: 'quarter', corner: 'br', color: INK },
  { col: 1, row: 0, kind: 'circle', color: SKY },
  { col: 2, row: 0, kind: 'square', color: INK },
  { col: 3, row: 0, kind: 'quarter', corner: 'bl', color: PAPER },
  { col: 0, row: 1, kind: 'quarter', corner: 'tr', color: PAPER },
  { col: 1, row: 1, kind: 'quarter', corner: 'tl', color: INK },
  { col: 2, row: 1, kind: 'quarter', corner: 'br', color: SKY },
  { col: 3, row: 1, kind: 'circle', color: INK },
  { col: 0, row: 2, kind: 'square', color: SKY },
  { col: 1, row: 2, kind: 'quarter', corner: 'bl', color: PAPER },
  { col: 2, row: 2, kind: 'quarter', corner: 'br', color: INK },
  { col: 3, row: 2, kind: 'quarter', corner: 'bl', color: PAPER },
  { col: 0, row: 3, kind: 'quarter', corner: 'tl', color: INK },
  { col: 1, row: 3, kind: 'circle', color: PAPER },
  { col: 2, row: 3, kind: 'quarter', corner: 'tr', color: INK },
  { col: 3, row: 3, kind: 'quarter', corner: 'tl', color: SKY }
]

/** A quarter disc filling its cell, its center on the named corner. */
function quarter(col: number, row: number, corner: Corner): string {
  const x = col * CELL
  const y = row * CELL
  const right = corner.endsWith('r')
  const bottom = corner.startsWith('b')
  const cx = right ? x + CELL : x
  const cy = bottom ? y + CELL : y
  const ex = right ? x : x + CELL
  const ey = bottom ? y : y + CELL
  const sweep = right === bottom ? 1 : 0
  return `M${cx} ${cy}L${ex} ${cy}A${CELL} ${CELL} 0 0 ${sweep} ${cx} ${ey}Z`
}
</script>

<template>
  <svg :viewBox="`0 0 ${CELL * 4} ${CELL * 4}`" aria-hidden="true" class="h-auto w-full">
    <template v-for="tile in tiles" :key="`${tile.col}-${tile.row}`">
      <rect
        v-if="tile.kind === 'square'"
        :x="tile.col * CELL"
        :y="tile.row * CELL"
        :width="CELL"
        :height="CELL"
        :fill="tile.color"
      />
      <circle
        v-else-if="tile.kind === 'circle'"
        :cx="tile.col * CELL + CELL / 2"
        :cy="tile.row * CELL + CELL / 2"
        :r="CELL / 2"
        :fill="tile.color"
      />
      <path v-else :d="quarter(tile.col, tile.row, tile.corner)" :fill="tile.color" />
    </template>
  </svg>
</template>
