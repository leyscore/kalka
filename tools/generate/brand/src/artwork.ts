import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { stringToSvg as stringToSVG } from '@realfavicongenerator/generate-favicon'
import type { ImageAdapter } from '@realfavicongenerator/generate-favicon'
import { getNodeImageAdapter } from '@realfavicongenerator/image-adapter-node'

import { brand } from './config.ts'

export async function loadArtwork(root: string) {
  const adapter = await getNodeImageAdapter()
  const main = await readFile(join(root, 'assets/brand/mark.svg'), 'utf8')
  const micro = await readFile(join(root, 'assets/brand/mark-micro.svg'), 'utf8')
  return { adapter, main, micro }
}

function fillParts(source: string, adapter: ImageAdapter, color: string) {
  const svg = stringToSVG(source, adapter)
  for (const path of svg.find('[data-part]')) path.fill(color)
  return svg
}

/** The K on dark surfaces is paper; monochrome artwork is ink, or paper on dark. */
export function recolor(
  source: string,
  adapter: ImageAdapter,
  mode: 'dark' | 'mono' | 'mono-dark'
) {
  return fillParts(source, adapter, mode === 'mono' ? brand.ink : brand.paper).svg()
}

/** Shared app icon: the paper K on the blue tile; touch and maskable leave cropping to the platform. */
export function appArtwork(
  source: string,
  adapter: ImageAdapter,
  kind: 'web' | 'maskable' | 'tile' | 'desktop'
) {
  const svg = adapter.createSvg().size(1024, 1024).viewbox(0, 0, 1024, 1024)
  const rounded = kind === 'tile' || kind === 'desktop'
  const inset = kind === 'desktop' ? brand.tileInset : 0
  const side = 1024 - inset * 2
  const background = svg.rect(side, side).move(inset, inset).fill(brand.background)
  if (rounded) background.radius((brand.tileRadius * side) / 1024)
  const regularScale = kind === 'tile' ? brand.tileScale : brand.appScale
  const scale = (kind === 'maskable' ? brand.maskableScale : regularScale) * (side / 1024)
  const mark = fillParts(source, adapter, brand.paper).size(1024 * scale, 1024 * scale)
  mark.move((1024 * (1 - scale)) / 2, (1024 * (1 - scale)) / 2)
  svg.add(mark)
  return svg.svg()
}
