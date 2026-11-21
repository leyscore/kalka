import type { ShaderLayer, ShaderPreset } from '@kalka/scene-graph'
import { parseColor } from '@kalka/scene-graph/color'

import { black, COLOR_ROLES, mix, role } from './colors'
import { paper } from './sources'
import type { FreshComponent, VariantValues } from './types'

const SECTION = 'width:1200px;height:640px;position:relative;overflow:hidden'

const SPEEDS: Readonly<Record<string, number>> = { Still: 0, Slow: 0.2, Lively: 0.8 }

/**
 * The colours a shader blends, from the roles' fallbacks; inserting one recolours it from the
 * document's own variables (`recolorFreshShaders`).
 */
export function shaderColors(): ShaderLayer['colors'] {
  return [
    parseColor(COLOR_ROLES.accent),
    parseColor(COLOR_ROLES.ground),
    parseColor(COLOR_ROLES.ink),
    parseColor('#9db7f5')
  ]
}

function shaderAttribute(
  preset: ShaderPreset,
  values: VariantValues,
  params: Record<string, number>
): string {
  const layer: ShaderLayer = {
    preset,
    colors: shaderColors(),
    speed: SPEEDS[values.Speed] ?? 0,
    params
  }
  return JSON.stringify(layer).replaceAll("'", '&#39;')
}

/** What shows where shaders cannot run: the same roles as a still gradient. */
const STAND_IN = [
  `radial-gradient(60% 80% at 18% 24%, ${role('accent')} 0%, transparent 70%)`,
  `radial-gradient(55% 70% at 84% 78%, ${mix('accent', 45, role('ink'))} 0%, transparent 72%)`,
  role('ground')
].join(', ')

function shaderSection(
  name: string,
  preset: ShaderPreset,
  values: VariantValues,
  params: Record<string, number>
): string {
  return `<div id="${name}" data-shader='${shaderAttribute(preset, values, params)}' style="${SECTION};background:${STAND_IN}"></div>`
}

const LIVE_VARIANTS = { Intensity: ['Calm', 'Vivid'], Speed: ['Slow', 'Still', 'Lively'] }

const meshField: FreshComponent = {
  key: 'mesh-field',
  name: 'Mesh field',
  category: 'backgrounds',
  description: 'A live mesh gradient that drifts between the accent, the ground and the ink.',
  use: 'The ground of a hero or a closing call to action when the brand has one strong colour and the page needs life without a picture.',
  tags: ['animated', 'shader', 'gradient', 'motion', 'live', 'webgl', 'aurora', 'tech', 'ambient'],
  source: paper('mesh-gradient'),
  variants: LIVE_VARIANTS,
  texts: {},
  live: true,
  html: (values) =>
    shaderSection(
      'Mesh field',
      'mesh-gradient',
      values,
      values.Intensity === 'Vivid'
        ? { distortion: 1, swirl: 0.6, grainOverlay: 0.15 }
        : { distortion: 0.55, swirl: 0.08, grainOverlay: 0 }
    )
}

const grainGlow: FreshComponent = {
  key: 'grain-glow',
  name: 'Grain glow',
  category: 'backgrounds',
  description: 'A live, grainy light that pools in the corners, like film under a lamp.',
  use: 'A moody ground for a launch, a music or film product, or a dark section that should feel physical rather than digital.',
  tags: ['animated', 'shader', 'grain', 'noise', 'film', 'texture', 'dark', 'moody', 'live'],
  source: paper('grain-gradient'),
  variants: LIVE_VARIANTS,
  texts: {},
  live: true,
  html: (values) =>
    shaderSection(
      'Grain glow',
      'grain-gradient',
      values,
      values.Intensity === 'Vivid'
        ? { softness: 0.3, intensity: 0.8, noise: 0.45 }
        : { softness: 0.8, intensity: 0.35, noise: 0.18 }
    )
}

const silkWarp: FreshComponent = {
  key: 'silk-warp',
  name: 'Silk warp',
  category: 'backgrounds',
  description: 'A live warp of colour bands folding like silk or poured paint.',
  use: 'A fashion, cosmetics, audio or art ground where flowing material says more than a photograph.',
  tags: ['animated', 'shader', 'silk', 'liquid', 'fluid', 'flow', 'paint', 'fashion', 'live'],
  source: paper('warp'),
  variants: LIVE_VARIANTS,
  texts: {},
  live: true,
  html: (values) =>
    shaderSection(
      'Silk warp',
      'warp',
      values,
      values.Intensity === 'Vivid'
        ? { proportion: 0.35, softness: 0.6, distortion: 0.45, swirl: 1 }
        : { proportion: 0.45, softness: 1, distortion: 0.15, swirl: 0.4 }
    )
}

const halftoneFade: FreshComponent = {
  key: 'halftone-fade',
  name: 'Halftone fade',
  category: 'backgrounds',
  description: 'A field of printed dots that fades out across the section.',
  use: 'Print, newspaper, risograph or engineering moods: a ground with texture that still leaves the type the loudest thing.',
  tags: ['halftone', 'dots', 'print', 'newspaper', 'risograph', 'pattern', 'texture', 'static'],
  source: paper('halftone-dots'),
  variants: { Density: ['Fine', 'Coarse'], Fade: ['Down', 'Up'] },
  texts: {},
  html: (values) => {
    const coarse = values.Density === 'Coarse'
    const step = coarse ? 18 : 9
    const dot = coarse ? 3.2 : 1.4
    const direction = values.Fade === 'Up' ? 'to top' : 'to bottom'
    return `<div id="Halftone fade" style="${SECTION};background:${role('ground')}">
  <div id="Dots" style="position:absolute;left:0;top:0;width:1200px;height:640px;background-image:radial-gradient(circle, ${mix('ink', 78)} ${dot}px, transparent ${dot + 0.6}px);background-size:${step}px ${step}px;mask-image:linear-gradient(${direction}, #000 0%, ${black(0.35)} 45%, transparent 85%)"></div>
</div>`
  }
}

const lightRays: FreshComponent = {
  key: 'light-rays',
  name: 'Light rays',
  category: 'backgrounds',
  description: 'Shafts of light falling from the top of the section on a dark ground.',
  use: 'A dark hero or reveal that wants a sense of stage or arrival: a launch, an event, an award.',
  tags: ['god rays', 'rays', 'light', 'beams', 'stage', 'dark', 'spotlight', 'dramatic', 'static'],
  source: paper('god-rays'),
  variants: { Intensity: ['Soft', 'Strong'] },
  texts: {},
  html: (values) => {
    const strong = values.Intensity === 'Strong'
    return `<div id="Light rays" style="${SECTION};background:${role('ink')}">
  <div id="Rays" style="position:absolute;left:-200px;top:-160px;width:1600px;height:900px;background:repeating-conic-gradient(from 160deg at 50% 0%, ${mix('accent', strong ? 70 : 42)} 0deg 3deg, transparent 3deg 9deg, ${mix('ground', strong ? 30 : 16)} 9deg 10.5deg, transparent 10.5deg 17deg);mask-image:radial-gradient(70% 90% at 50% 0%, #000 0%, ${black(0.5)} 40%, transparent 75%);filter:blur(${strong ? 4 : 9}px)"></div>
</div>`
  }
}

/** Fractal noise as specks of one colour on a transparent image, so the ground keeps its colour. */
function grainImage(speck: number): string {
  return encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${speck} 0 0 0 0 ${speck} 0 0 0 0 ${speck} 2.2 0 0 0 -0.9'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  )
}

const paperGrain: FreshComponent = {
  key: 'paper-grain',
  name: 'Paper grain',
  category: 'backgrounds',
  description: 'A flat ground with a fine paper or film grain over it.',
  use: 'Any flat colour section that should feel printed or tactile; it changes the surface, not the composition.',
  tags: ['grain', 'noise', 'paper', 'texture', 'film', 'tactile', 'print', 'flat', 'static'],
  source: paper('paper-texture'),
  variants: { Tone: ['Light', 'Dark'] },
  texts: {},
  html: (values) => {
    const dark = values.Tone === 'Dark'
    return `<div id="Paper grain" style="${SECTION};background:${role(dark ? 'ink' : 'ground')}">
  <div id="Grain" style="position:absolute;left:0;top:0;width:1200px;height:640px;background-image:url(&quot;data:image/svg+xml,${grainImage(dark ? 1 : 0)}&quot;);background-size:240px 240px;opacity:${dark ? 0.35 : 0.45}"></div>
</div>`
  }
}

export const BACKGROUNDS: readonly FreshComponent[] = [
  meshField,
  grainGlow,
  silkWarp,
  halftoneFade,
  lightRays,
  paperGrain
]
