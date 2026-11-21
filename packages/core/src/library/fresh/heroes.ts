import { black, mix, role, white } from './colors'
import { cult, fancy, paper } from './sources'
import type { FreshComponent } from './types'

const ORBIT_LABELS = ['Research', 'Strategy', 'Identity', 'Interface', 'Motion', 'Launch']

function orbitPill(label: string, angle: number, radius: number, center: number): string {
  const radians = (angle * Math.PI) / 180
  const width = 132
  const height = 44
  const x = center + radius * Math.cos(radians) - width / 2
  const y = center + radius * Math.sin(radians) - height / 2
  return `<div style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${width}px;height:${height}px;border-radius:999px;background:${role('ground')};border:1px solid ${role('line')};box-sizing:border-box;display:flex;align-items:center;justify-content:center"><p style="font-family:'Geist';font-weight:500;font-size:15px;line-height:1;color:${role('ink')}">${label}</p></div>`
}

const orbitLabels: FreshComponent = {
  key: 'orbit-labels',
  name: 'Orbit labels',
  category: 'hero-devices',
  description: 'Labels set on a circular orbit around a centre disc.',
  use: 'Showing what surrounds one thing: the services around a studio, the integrations around a product, the stages of a cycle.',
  tags: ['orbit', 'circle', 'ecosystem', 'integrations', 'services', 'diagram', 'cycle', 'hero'],
  source: fancy('blocks/circling-elements'),
  variants: { Count: ['Six', 'Four'] },
  texts: { Centre: 'Studio' },
  html: (values) => {
    const labels = values.Count === 'Four' ? ORBIT_LABELS.slice(0, 4) : ORBIT_LABELS
    const size = 560
    const center = size / 2
    const radius = 210
    const pills = labels
      .map((label, index) => orbitPill(label, -90 + (index * 360) / labels.length, radius, center))
      .join('\n  ')
    return `<div id="Orbit labels" style="position:relative;width:${size}px;height:${size}px">
  <div id="Orbit" style="position:absolute;left:${center - radius}px;top:${center - radius}px;width:${radius * 2}px;height:${radius * 2}px;border-radius:50%;border:1px dashed ${role('line')};box-sizing:border-box"></div>
  <div id="Centre" style="position:absolute;left:${center - 90}px;top:${center - 90}px;width:180px;height:180px;border-radius:50%;background:${role('accent')};display:flex;align-items:center;justify-content:center"><p style="font-family:'Bricolage Grotesque';font-weight:700;font-size:30px;line-height:1;letter-spacing:-0.02em;color:${role('ground')}">Studio</p></div>
  ${pills}
</div>`
  }
}

const TILES = [
  { x: 40, y: 60, w: 150, h: 190, r: -6, fill: 'accent' },
  { x: 230, y: 380, w: 120, h: 120, r: 4, fill: 'ink' },
  { x: 700, y: 40, w: 170, h: 130, r: 5, fill: 'mixed' },
  { x: 780, y: 300, w: 130, h: 180, r: -4, fill: 'accent' },
  { x: 520, y: 420, w: 96, h: 96, r: -8, fill: 'soft' },
  { x: 300, y: 20, w: 84, h: 110, r: 7, fill: 'soft' },
  { x: 60, y: 400, w: 110, h: 80, r: 3, fill: 'mixed' }
] as const

function tileFill(fill: (typeof TILES)[number]['fill']): string {
  if (fill === 'accent') return role('accent')
  if (fill === 'ink') return role('ink')
  if (fill === 'mixed') return mix('accent', 45, role('ink'))
  return mix('accent', 22, role('ground'))
}

const floatingCollage: FreshComponent = {
  key: 'floating-collage',
  name: 'Floating collage',
  category: 'hero-devices',
  description:
    'Tiles of different sizes scattered at slight angles around a centred line, as if floating at depths.',
  use: 'A portfolio, gallery or event hero where many small pictures say more than one big one; replace the tiles with real images.',
  tags: [
    'collage',
    'gallery',
    'portfolio',
    'scattered',
    'floating',
    'parallax',
    'images',
    'hero',
    'moodboard'
  ],
  source: fancy('image/parallax-floating'),
  variants: { Density: ['Dense', 'Sparse'] },
  texts: { Line: 'A year of small things' },
  html: (values) => {
    const tiles = values.Density === 'Sparse' ? TILES.slice(0, 4) : TILES
    const drawn = tiles
      .map(
        (tile) =>
          `<div style="position:absolute;left:${tile.x}px;top:${tile.y}px;width:${tile.w}px;height:${tile.h}px;border-radius:6px;background:${tileFill(tile.fill)};transform:rotate(${tile.r}deg)"></div>`
      )
      .join('\n  ')
    return `<div id="Floating collage" style="position:relative;width:960px;height:560px">
  ${drawn}
  <div id="Line" style="position:absolute;left:200px;top:236px;width:560px;display:flex;justify-content:center"><p style="font-family:'Bricolage Grotesque';font-weight:700;font-size:56px;line-height:1.05;letter-spacing:-0.03em;text-align:center;color:${role('ink')}">A year of small things</p></div>
</div>`
  }
}

const statusIsland: FreshComponent = {
  key: 'status-island',
  name: 'Status island',
  category: 'hero-devices',
  description: 'A black pill, compact or opened up, that reports one live event like a phone does.',
  use: 'Making a product feel live in a hero: an order on its way, a build finishing, a match score, a booking confirmed.',
  tags: [
    'dynamic island',
    'notification',
    'status',
    'live',
    'pill',
    'mobile',
    'activity',
    'hero',
    'app'
  ],
  source: cult('dynamic-island'),
  variants: { State: ['Expanded', 'Compact'] },
  texts: { Title: 'Courier is 2 stops away', Detail: 'Arriving at 14:20' },
  html: (values) => {
    if (values.State === 'Compact') {
      return `<div id="Status island" style="display:flex;align-items:center;gap:10px;width:200px;height:40px;padding:0 16px;box-sizing:border-box;border-radius:999px;background:${role('ink')}">
  <div style="width:10px;height:10px;border-radius:50%;background:${role('accent')}"></div>
  <p style="font-family:'Geist';font-weight:500;font-size:13px;line-height:1;color:${role('ground')};white-space:nowrap">Arriving at 14:20</p>
</div>`
    }
    return `<div id="Status island" style="display:flex;align-items:center;gap:14px;width:380px;height:84px;padding:0 18px;box-sizing:border-box;border-radius:42px;background:${role('ink')}">
  <div style="width:48px;height:48px;border-radius:50%;background:${role('accent')};flex-shrink:0"></div>
  <div style="display:flex;flex-direction:column;gap:6px;flex-grow:1">
    <p style="font-family:'Geist';font-weight:600;font-size:16px;line-height:1.2;color:${role('ground')}">Courier is 2 stops away</p>
    <p style="font-family:'Geist';font-weight:400;font-size:13px;line-height:1.2;color:${mix('ground', 62)}">Arriving at 14:20</p>
    <div style="width:220px;height:4px;border-radius:2px;background:${mix('ground', 18)}"><div style="width:150px;height:4px;border-radius:2px;background:${role('accent')}"></div></div>
  </div>
</div>`
  }
}

const CHROME =
  'conic-gradient(from 210deg at 50% 50%, #f7f7f5, #8b8b88, #fbfbf9, #55554f, #e9e9e6, #9b9b97, #f7f7f5)'

const liquidMetalBadge: FreshComponent = {
  key: 'liquid-metal-badge',
  name: 'Liquid metal badge',
  category: 'hero-devices',
  description: 'A polished chrome seal, tinted with the accent, with an engraved line of text.',
  use: 'A mark of quality or a release badge beside a hero headline: an award, a version, a year of founding.',
  tags: ['chrome', 'metal', 'liquid metal', 'badge', 'seal', 'premium', 'award', 'shiny'],
  source: paper('liquid-metal'),
  variants: { Shape: ['Circle', 'Pill'] },
  texts: { Label: 'Since 1998' },
  html: (values) => {
    const pill = values.Shape === 'Pill'
    const width = pill ? 280 : 180
    const height = pill ? 88 : 180
    return `<div id="Liquid metal badge" style="position:relative;width:${width}px;height:${height}px;border-radius:999px;background:${CHROME};box-shadow:inset 0 2px 3px ${white(0.9)}, inset 0 -3px 6px ${black(0.35)};overflow:hidden">
  <div id="Tint" style="position:absolute;left:0;top:0;width:${width}px;height:${height}px;background:${role('accent')};mix-blend-mode:color;opacity:.35"></div>
  <div id="Inset" style="position:absolute;left:8px;top:8px;width:${width - 16}px;height:${height - 16}px;border-radius:999px;border:1px solid ${white(0.6)};box-sizing:border-box;display:flex;align-items:center;justify-content:center">
    <p style="font-family:'Bricolage Grotesque';font-weight:700;font-size:${pill ? 24 : 22}px;line-height:1;letter-spacing:-0.01em;color:${mix('ink', 78)}">Since 1998</p>
  </div>
</div>`
  }
}

export const HERO_DEVICES: readonly FreshComponent[] = [
  orbitLabels,
  floatingCollage,
  statusIsland,
  liquidMetalBadge
]
