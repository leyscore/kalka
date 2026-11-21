import { black, mix, role, white } from './colors'
import { cult, fancy, paper } from './sources'
import type { FreshComponent } from './types'

const TITLE = `font-family:'Bricolage Grotesque';font-weight:600;font-size:28px;line-height:1.1;letter-spacing:-0.02em`
const BODY = `font-family:'Geist';font-weight:400;font-size:15px;line-height:1.5`

const flutedGlassPanel: FreshComponent = {
  key: 'fluted-glass-panel',
  name: 'Fluted glass panel',
  category: 'cards',
  description:
    'A panel of reeded glass over a field of colour, the light broken into vertical flutes.',
  use: 'The one feature or quote that should feel like an object: a product promise, a membership card, an architectural or interior brand.',
  tags: [
    'glass',
    'fluted',
    'reeded',
    'refraction',
    'panel',
    'material',
    'interior',
    'architecture',
    'premium'
  ],
  source: paper('fluted-glass'),
  variants: { Flutes: ['Fine', 'Wide'] },
  texts: {
    Title: 'Light comes in sideways',
    Body: 'Reeded glass keeps the room private and the day inside.'
  },
  html: (values) => {
    const width = values.Flutes === 'Wide' ? 28 : 12
    return `<div id="Fluted glass panel" style="position:relative;width:420px;height:520px;border-radius:20px;overflow:hidden;background:${role('ink')}">
  <div id="Field" style="position:absolute;left:-60px;top:40px;width:420px;height:420px;border-radius:50%;background:${role('accent')}"></div>
  <div id="Field 2" style="position:absolute;left:200px;top:260px;width:300px;height:300px;border-radius:50%;background:${mix('accent', 40, role('ground'))}"></div>
  <div id="Flutes" style="position:absolute;left:0;top:0;width:420px;height:520px;backdrop-filter:blur(16px);background:repeating-linear-gradient(90deg, ${white(0.22)} 0px, ${white(0)} ${width * 0.45}px, ${black(0.16)} ${width * 0.85}px, ${white(0.14)} ${width}px)"></div>
  <div id="Copy" style="position:absolute;left:32px;bottom:32px;width:356px;display:flex;flex-direction:column;gap:10px">
    <p style="${TITLE};color:${role('ground')}">Light comes in sideways</p>
    <p style="${BODY};color:${mix('ground', 80)}">Reeded glass keeps the room private and the day inside.</p>
  </div>
</div>`
  }
}

const GRAIN = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/></svg>"
)

const frostedCard: FreshComponent = {
  key: 'frosted-card',
  name: 'Frosted card',
  category: 'cards',
  description: 'A card of frosted, slightly grainy glass over two soft discs of colour.',
  use: 'A floating detail over a picture or a shader ground: a price, a live status, a small form. Glass only earns its place over something worth blurring.',
  tags: ['glass', 'frosted', 'blur', 'glassmorphism', 'overlay', 'floating', 'card', 'translucent'],
  source: cult('distorted-glass'),
  variants: { Tone: ['Light', 'Dark'] },
  texts: { Title: 'Next train in 4 min', Body: 'Platform 2, towards the harbour' },
  html: (values) => {
    const dark = values.Tone === 'Dark'
    const surface = dark ? mix('ink', 45) : mix('ground', 45)
    const text = dark ? role('ground') : role('ink')
    return `<div id="Frosted card" style="position:relative;width:440px;height:300px">
  <div id="Disc" style="position:absolute;left:0;top:0;width:220px;height:220px;border-radius:50%;background:${role('accent')}"></div>
  <div id="Disc 2" style="position:absolute;left:260px;top:120px;width:170px;height:170px;border-radius:50%;background:${mix('accent', 35, role('ink'))}"></div>
  <div id="Glass" style="position:absolute;left:40px;top:60px;width:360px;height:180px;border-radius:18px;background:${surface};backdrop-filter:blur(22px) saturate(1.4);border:1px solid ${mix('ground', 55)};display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:24px;box-sizing:border-box;overflow:hidden">
    <div id="Grain" style="position:absolute;left:0;top:0;width:360px;height:180px;background-image:url(&quot;data:image/svg+xml,${GRAIN}&quot;);opacity:.18;mix-blend-mode:overlay"></div>
    <p style="${TITLE};font-size:26px;color:${text}">Next train in 4 min</p>
    <p style="${BODY};color:${text};opacity:.75">Platform 2, towards the harbour</p>
  </div>
</div>`
  }
}

const foldedCard: FreshComponent = {
  key: 'folded-card',
  name: 'Folded card',
  category: 'cards',
  description: 'A card with its top corner folded down, like a ticket or an index card.',
  use: 'Tickets, menus, notes, coupons, recipes: anything the reader would hold, where one corner turned down says paper.',
  tags: ['fold', 'paper', 'ticket', 'note', 'index card', 'corner', 'coupon', 'tactile'],
  source: cult('folded-card'),
  variants: { Surface: ['Accent', 'Ground'] },
  texts: {
    Label: 'Admit one',
    Title: 'Late opening, Thursday',
    Body: 'Galleries open until ten, with talks on the hour.'
  },
  html: (values) => {
    const accent = values.Surface === 'Accent'
    const surface = accent ? role('accent') : role('ground')
    const text = accent ? role('ground') : role('ink')
    return `<div id="Folded card" style="position:relative;width:360px;height:440px">
  <div id="Paper" style="position:absolute;left:0;top:0;width:360px;height:440px;background:${surface};clip-path:polygon(0 0, 292px 0, 360px 68px, 360px 100%, 0 100%);${accent ? '' : `border:1px solid ${role('line')};box-sizing:border-box;`}display:flex;flex-direction:column;justify-content:space-between;padding:32px;box-sizing:border-box">
    <p style="font-family:'Geist';font-weight:500;font-size:13px;line-height:1.2;color:${text}">Admit one</p>
    <div style="display:flex;flex-direction:column;gap:12px">
      <p style="${TITLE};font-size:34px;color:${text}">Late opening, Thursday</p>
      <p style="${BODY};color:${text};opacity:.8">Galleries open until ten, with talks on the hour.</p>
    </div>
  </div>
  <div id="Fold" style="position:absolute;left:292px;top:0;width:68px;height:68px;background:${accent ? mix('accent', 70, role('ink')) : mix('ink', 12, role('ground'))};clip-path:polygon(0 0, 0 100%, 100% 100%);border-bottom-left-radius:6px"></div>
</div>`
  }
}

function deckCard(rotation: number, shift: number, background: string, extra = ''): string {
  return `<div style="position:absolute;left:${40 + shift}px;top:30px;width:340px;height:400px;border-radius:18px;background:${background};transform:rotate(${rotation}deg)${extra}"></div>`
}

const stackedDeck: FreshComponent = {
  key: 'stacked-deck',
  name: 'Stacked deck',
  category: 'cards',
  description: 'A front card with two cards fanned out behind it.',
  use: 'Showing that there are more of something without a grid of identical cards: plans, recipes, case studies, a deck of prompts.',
  tags: ['stack', 'deck', 'cards', 'fan', 'pile', 'collection', 'layered', 'playful'],
  source: fancy('blocks/stacking-cards'),
  variants: { Spread: ['Fanned', 'Tight'] },
  texts: { Title: 'Sourdough, slowly', Body: 'Forty-eight hours, three folds, one very hot oven.' },
  html: (values) => {
    const fanned = values.Spread === 'Fanned'
    return `<div id="Stacked deck" style="position:relative;width:420px;height:460px">
  ${deckCard(fanned ? -9 : -3, fanned ? -18 : -4, mix('accent', 55, role('ground')))}
  ${deckCard(fanned ? 6 : 2, fanned ? 16 : 4, mix('ink', 14, role('ground')))}
  <div id="Front" style="position:absolute;left:40px;top:30px;width:340px;height:400px;border-radius:18px;background:${role('ground')};border:1px solid ${role('line')};box-sizing:border-box;padding:28px;display:flex;flex-direction:column;justify-content:flex-end;gap:10px">
    <p style="${TITLE};color:${role('ink')}">Sourdough, slowly</p>
    <p style="${BODY};color:${role('muted')}">Forty-eight hours, three folds, one very hot oven.</p>
  </div>
</div>`
  }
}

const textureCard: FreshComponent = {
  key: 'texture-card',
  name: 'Texture card',
  category: 'cards',
  description:
    'A card built from nested rims and an inner highlight, so it reads as a pressed object.',
  use: 'A product or pricing card in a quiet, tool-like interface that needs depth without a drop shadow.',
  tags: [
    'card',
    'tactile',
    'skeuomorphic',
    'rim',
    'inset',
    'pricing',
    'product',
    'object',
    'hardware'
  ],
  source: cult('texture-card'),
  variants: { Tone: ['Light', 'Dark'] },
  texts: {
    Title: 'Studio',
    Body: 'For teams that ship every week.',
    Footer: '€24 per seat, monthly'
  },
  html: (values) => {
    const dark = values.Tone === 'Dark'
    const top = dark ? mix('ink', 88, role('ground')) : role('ground')
    const bottom = dark ? role('ink') : mix('ground', 92, role('ink'))
    const text = dark ? role('ground') : role('ink')
    return `<div id="Texture card" style="width:360px;padding:1px;border-radius:24px;background:linear-gradient(to bottom, ${mix('ink', dark ? 40 : 14)}, ${mix('ink', dark ? 70 : 24)})">
  <div id="Rim" style="border-radius:23px;padding:2px;background:${mix(dark ? 'ground' : 'ink', 6)}">
    <div id="Surface" style="border-radius:21px;background:linear-gradient(to bottom, ${top}, ${bottom});box-shadow:inset 0 1px 0 ${white(dark ? 0.08 : 0.9)};display:flex;flex-direction:column">
      <div style="padding:28px 28px 20px;display:flex;flex-direction:column;gap:8px">
        <p style="${TITLE};color:${text}">Studio</p>
        <p style="${BODY};color:${text};opacity:.7">For teams that ship every week.</p>
      </div>
      <div style="height:1px;background:${mix(dark ? 'ground' : 'ink', 10)}"></div>
      <div style="padding:16px 28px 22px">
        <p style="font-family:'Geist';font-weight:500;font-size:14px;line-height:1.4;color:${text}">€24 per seat, monthly</p>
      </div>
    </div>
  </div>
</div>`
  }
}

export const CARDS: readonly FreshComponent[] = [
  flutedGlassPanel,
  frostedCard,
  foldedCard,
  stackedDeck,
  textureCard
]
