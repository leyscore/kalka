import { role } from './colors'
import { fancy, paper } from './sources'
import type { FreshComponent } from './types'

const tickerBand: FreshComponent = {
  key: 'ticker-band',
  name: 'Ticker band',
  category: 'separators',
  description: 'A full-width band of one short line repeated, the way a marquee holds still.',
  use: 'Between two sections, to carry one fact or offer across the page: opening hours, a launch date, a shipping promise.',
  tags: ['marquee', 'ticker', 'band', 'strip', 'banner', 'divider', 'announcement', 'separator'],
  source: fancy('blocks/simple-marquee'),
  variants: { Tone: ['Ink', 'Accent'] },
  texts: { Item: 'Open late on Fridays' },
  html: (values) => {
    const ink = values.Tone !== 'Accent'
    const text = role(ink ? 'ground' : 'ink')
    const item = `<p style="font-family:'Bricolage Grotesque';font-weight:600;font-size:22px;line-height:1;white-space:nowrap;color:${text}">Open late on Fridays</p>`
    const mark = `<div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${role(ink ? 'accent' : 'ground')}"></div>`
    const row = Array.from({ length: 6 }, () => `${item}${mark}`).join('')
    return `<div id="Ticker band" style="display:flex;align-items:center;gap:28px;width:1200px;height:64px;padding:0 0 0 24px;box-sizing:border-box;overflow:hidden;background:${role(ink ? 'ink' : 'accent')}">${row}</div>`
  }
}

const elasticRule: FreshComponent = {
  key: 'elastic-rule',
  name: 'Elastic rule',
  category: 'separators',
  description: 'A hairline that sags between two pinned ends, like a string pulled down.',
  use: 'A soft break between sections of a playful or hand-made page, where a straight rule feels too strict.',
  tags: ['divider', 'rule', 'line', 'curve', 'string', 'elastic', 'separator', 'playful'],
  source: fancy('physics/elastic-line'),
  variants: { Sag: ['Gentle', 'Deep'] },
  texts: {},
  html: (values) => {
    const depth = values.Sag === 'Deep' ? 72 : 36
    return `<div id="Elastic rule" style="position:relative;width:1200px;height:${depth + 8}px">
  <div id="Line" style="position:absolute;left:4px;top:4px;width:1192px;height:${depth}px;border-bottom:1.5px solid ${role('ink')};box-sizing:border-box;border-radius:0 0 50% 50% / 0 0 100% 100%"></div>
  <div id="Pin" style="position:absolute;left:0;top:0;width:8px;height:8px;border-radius:50%;background:${role('ink')}"></div>
  <div id="Pin 2" style="position:absolute;left:1192px;top:0;width:8px;height:8px;border-radius:50%;background:${role('ink')}"></div>
</div>`
  }
}

/** Rows of a dither, densest first: a checkerboard cell, then sparser stripes of squares. */
function ditherRows(color: string): string[] {
  return [
    `background:${color}`,
    `background-image:conic-gradient(${color} 25%, transparent 0 50%, ${color} 0 75%, transparent 0);background-size:48px 48px`,
    `background-image:repeating-linear-gradient(90deg, ${color} 0 24px, transparent 24px 96px)`,
    `background-image:repeating-linear-gradient(90deg, transparent 0 48px, ${color} 48px 72px, transparent 72px 192px)`
  ]
}

const pixelStepEdge: FreshComponent = {
  key: 'pixel-step-edge',
  name: 'Pixel step edge',
  category: 'separators',
  description: 'A dithered edge where one section breaks into squares before the next begins.',
  use: 'The seam between a dark section and a light one on a game, developer or retro page.',
  tags: ['dither', 'pixel', 'edge', 'seam', 'transition', 'retro', 'game', 'separator', '8-bit'],
  source: paper('dithering'),
  variants: { Direction: ['Down', 'Up'] },
  texts: {},
  html: (values) => {
    const rows = ditherRows(role('ink'))
    const ordered = values.Direction === 'Up' ? [...rows].reverse() : rows
    const drawn = ordered
      .map((row) => `<div style="width:1200px;height:24px;${row}"></div>`)
      .join('')
    return `<div id="Pixel step edge" style="display:flex;flex-direction:column;width:1200px;height:96px;background:${role('ground')}">${drawn}</div>`
  }
}

export const SEPARATORS: readonly FreshComponent[] = [tickerBand, elasticRule, pixelStepEdge]
