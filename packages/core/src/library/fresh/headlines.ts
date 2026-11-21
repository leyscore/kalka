import { mix, role } from './colors'
import { fancy } from './sources'
import type { FreshComponent, VariantValues } from './types'

const RAMP_TEXT = 'Make it yours'

/** Where a letter sits on the ramp, from 0 to 1: rising left to right, or a wave. */
function rampPosition(index: number, count: number, shape: string): number {
  const t = count > 1 ? index / (count - 1) : 0
  return shape === 'Wave' ? (1 - Math.cos(t * Math.PI * 2)) / 2 : t
}

function rampLetter(letter: string, position: number, axis: string): string {
  if (letter === ' ') return '<div style="width:28px;height:1px"></div>'
  const style =
    axis === 'Width'
      ? `font-weight:600;font-stretch:${Math.round(25 + position * 126)}%;font-variation-settings:'wdth' ${Math.round(25 + position * 126)}`
      : `font-weight:${Math.round(1 + position * 8) * 100};font-variation-settings:'wght' ${Math.round(100 + position * 800)}`
  return `<span style="font-family:'Roboto Flex';font-size:128px;line-height:1;letter-spacing:-0.02em;color:${role('ink')};${style}">${letter}</span>`
}

const weightRamp: FreshComponent = {
  key: 'weight-ramp',
  name: 'Weight ramp',
  category: 'headlines',
  description:
    'A headline whose letters step through a variable font, light to heavy or narrow to wide.',
  use: 'One short display line, two or three words, where the type itself is the hero image: a type foundry, a studio, an audio or motion product.',
  tags: [
    'variable font',
    'typography',
    'type',
    'display',
    'kinetic',
    'weight',
    'width',
    'expressive'
  ],
  source: fancy('text/variable-font-hover-by-letter'),
  variants: { Axis: ['Weight', 'Width'], Shape: ['Rise', 'Wave'] },
  texts: {},
  html: (values: VariantValues) => {
    const letters = Array.from(RAMP_TEXT)
    const spans = letters
      .map((letter, index) =>
        rampLetter(letter, rampPosition(index, letters.length, values.Shape), values.Axis)
      )
      .join('')
    return `<div id="Weight ramp" style="display:flex;align-items:flex-end;width:1040px;height:150px">${spans}</div>`
  }
}

const RING_TEXT = 'Designed and built in the open '

function ringLetters(text: string, diameter: number, fontSize: number): string {
  const letters = Array.from(text)
  const radius = diameter / 2 - fontSize * 0.75
  const center = diameter / 2
  const box = { width: fontSize, height: fontSize * 1.3 }
  return letters
    .map((letter, index) => {
      const angle = (index / letters.length) * 360
      const radians = (angle * Math.PI) / 180
      const x = center + radius * Math.sin(radians) - box.width / 2
      const y = center - radius * Math.cos(radians) - box.height / 2
      return `<span style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${box.width}px;height:${box.height.toFixed(1)}px;transform:rotate(${angle.toFixed(1)}deg);text-align:center;font-family:'Geist';font-weight:600;font-size:${fontSize}px;line-height:${box.height.toFixed(1)}px;text-transform:uppercase;color:${role('ink')}">${letter === ' ' ? '&nbsp;' : letter}</span>`
    })
    .join('')
}

const textRing: FreshComponent = {
  key: 'text-ring',
  name: 'Text ring',
  category: 'headlines',
  description: 'A line of text set around a circle, with a disc of the accent at its centre.',
  use: 'A stamp or seal beside a headline or on a product shot: an opening date, a guarantee, a place of origin.',
  tags: [
    'circle',
    'circular text',
    'badge',
    'stamp',
    'seal',
    'text on path',
    'sticker',
    'rotating'
  ],
  source: fancy('text/text-along-path'),
  variants: { Size: ['Small', 'Large'] },
  texts: {},
  html: (values) => {
    const large = values.Size === 'Large'
    const diameter = large ? 280 : 180
    const fontSize = large ? 20 : 14
    const disc = Math.round(diameter * 0.3)
    return `<div id="Text ring" style="position:relative;width:${diameter}px;height:${diameter}px">
  ${ringLetters(RING_TEXT, diameter, fontSize)}
  <div id="Centre" style="position:absolute;left:${(diameter - disc) / 2}px;top:${(diameter - disc) / 2}px;width:${disc}px;height:${disc}px;border-radius:50%;background:${role('accent')}"></div>
</div>`
  }
}

const MEDIA_STYLES: Readonly<Record<string, string>> = {
  Shader: '',
  Block: `background:${role('accent')}`,
  Outline: `border:2px solid ${role('ink')}`
}

function mediaPill(kind: string): string {
  const base = 'width:188px;height:88px;border-radius:999px;flex-shrink:0;overflow:hidden'
  if (kind !== 'Shader') return `<div id="Media" style="${base};${MEDIA_STYLES[kind]}"></div>`
  const layer = JSON.stringify({
    preset: 'mesh-gradient',
    colors: [
      { r: 0.184, g: 0.357, b: 0.918, a: 1 },
      { r: 0.945, g: 0.945, b: 0.925, a: 1 },
      { r: 0.078, g: 0.078, b: 0.075, a: 1 }
    ],
    speed: 0.3,
    params: { distortion: 0.8, swirl: 0.3, grainOverlay: 0 }
  })
  return `<div id="Media" data-shader='${layer}' style="${base};background:radial-gradient(80% 120% at 30% 40%, ${role('accent')}, ${mix('accent', 30, role('ground'))})"></div>`
}

const headlineType = `font-family:'Bricolage Grotesque';font-weight:700;font-size:96px;line-height:1;letter-spacing:-0.035em;color:${role('ink')}`

const wordsAroundMedia: FreshComponent = {
  key: 'words-around-media',
  name: 'Words around media',
  category: 'headlines',
  description:
    'A display line with a pill of moving colour, a block or a picture set between its words.',
  use: 'A hero headline that needs a picture but no hero image: the pill can hold the product, a face or a live shader.',
  tags: ['headline', 'inline image', 'media', 'pill', 'editorial', 'hero', 'type', 'display'],
  source: fancy('blocks/media-between-text'),
  variants: { Media: ['Shader', 'Block', 'Outline'] },
  texts: { Before: 'Work that', After: 'keeps moving' },
  live: true,
  html: (values) =>
    `<div id="Words around media" style="display:flex;align-items:center;gap:22px;width:1120px;height:112px">
  <p style="${headlineType};white-space:nowrap">Work that</p>
  ${mediaPill(values.Media)}
  <p style="${headlineType};white-space:nowrap">keeps moving</p>
</div>`
}

const liquidLetters: FreshComponent = {
  key: 'liquid-letters',
  name: 'Liquid letters',
  category: 'headlines',
  description:
    'A word whose letters melt into each other, the gooey filter done with blur and contrast.',
  use: 'A playful wordmark-sized headline for food, drinks, toys or music, where softness is the point.',
  tags: ['gooey', 'liquid', 'melt', 'blob', 'playful', 'soft', 'filter', 'wordmark', 'fun'],
  source: fancy('filter/gooey-svg-filter'),
  variants: { Intensity: ['Soft', 'Melted'] },
  texts: { Word: 'Fizz' },
  html: (values) => {
    const melted = values.Intensity === 'Melted'
    return `<div id="Liquid letters" style="display:flex;align-items:center;justify-content:center;width:560px;height:240px;background:${role('ground')};filter:contrast(${melted ? 24 : 12})">
  <p style="font-family:'Bricolage Grotesque';font-weight:800;font-size:180px;line-height:1;letter-spacing:-0.06em;color:${role('ink')};filter:blur(${melted ? 7 : 4}px)">Fizz</p>
</div>`
  }
}

export const HEADLINES: readonly FreshComponent[] = [
  weightRamp,
  textRing,
  wordsAroundMedia,
  liquidLetters
]
