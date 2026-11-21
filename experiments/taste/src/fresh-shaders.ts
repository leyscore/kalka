/**
 * Browser entry, bundled to runs/fresh-shaders.js: draws the page's Kalka shader layers
 * (data-shader / data-kalka-shader) with Paper Shaders, as Kalka's canvas does, so a page that
 * uses a live Kalka Fresh background is judged with the shader the editor shows, not its stand-in.
 */
import {
  ShaderFitOptions,
  ShaderMount,
  defaultObjectSizing,
  defaultPatternSizing,
  getShaderNoiseTexture,
  grainGradientFragmentShader,
  GrainGradientShapes,
  meshGradientFragmentShader,
  warpFragmentShader,
  WarpPatterns,
  type ShaderMountUniforms,
  type ShaderSizingParams
} from '/Users/beleyd/Developer/Kalka/public/kalka/.claude/worktrees/fresh-component-library/packages/vue/node_modules/@paper-design/shaders'

type Layer = { preset: string; colors: { r: number; g: number; b: number; a: number }[]; speed: number; params: Record<string, number> }

function sizing(params: Required<ShaderSizingParams>): ShaderMountUniforms {
  return {
    u_fit: ShaderFitOptions[params.fit],
    u_scale: params.scale,
    u_rotation: params.rotation,
    u_originX: params.originX,
    u_originY: params.originY,
    u_offsetX: params.offsetX,
    u_offsetY: params.offsetY,
    u_worldWidth: params.worldWidth,
    u_worldHeight: params.worldHeight
  }
}
const colors = (layer: Layer, max: number) => {
  const list = layer.colors.slice(0, max).map(({ r, g, b, a }) => [r, g, b, a])
  return { u_colors: list, u_colorsCount: list.length } as ShaderMountUniforms
}
const p = (layer: Layer, name: string, fallback: number) => layer.params[name] ?? fallback

const PRESETS: Record<string, { fragment: string; uniforms: (layer: Layer) => ShaderMountUniforms }> = {
  'mesh-gradient': {
    fragment: meshGradientFragmentShader,
    uniforms: (l) => ({ ...sizing(defaultObjectSizing), ...colors(l, 10), u_distortion: p(l, 'distortion', 0.8), u_swirl: p(l, 'swirl', 0.1), u_grainMixer: 0, u_grainOverlay: p(l, 'grainOverlay', 0) })
  },
  'grain-gradient': {
    fragment: grainGradientFragmentShader,
    uniforms: (l) => ({ ...sizing(defaultObjectSizing), ...colors(l, 7), u_colorBack: [0, 0, 0, 0], u_softness: p(l, 'softness', 0.5), u_intensity: p(l, 'intensity', 0.5), u_noise: p(l, 'noise', 0.25), u_shape: GrainGradientShapes.corners, u_noiseTexture: getShaderNoiseTexture() })
  },
  warp: {
    fragment: warpFragmentShader,
    uniforms: (l) => ({ ...sizing(defaultPatternSizing), ...colors(l, 10), u_proportion: p(l, 'proportion', 0.45), u_softness: p(l, 'softness', 1), u_shape: WarpPatterns.checks, u_shapeScale: 0.1, u_distortion: p(l, 'distortion', 0.25), u_swirl: p(l, 'swirl', 0.8), u_swirlIterations: 10, u_noiseTexture: getShaderNoiseTexture() })
  }
}

/** A role's colour where the element sits, as inserting in Kalka takes it from the variables. */
function roleColor(element: HTMLElement, role: string): Layer['colors'][number] | null {
  const value = getComputedStyle(element).getPropertyValue(`--color-${role}`).trim()
  if (!value) return null
  const probe = document.createElement('span')
  probe.style.color = value
  element.append(probe)
  const match = /rgba?\(([^)]+)\)/.exec(getComputedStyle(probe).color)
  probe.remove()
  if (!match) return null
  const [r, g, b, a = 1] = match[1].split(/[ ,/]+/).filter(Boolean).map(Number)
  return { r: r / 255, g: g / 255, b: b / 255, a }
}

function recolor(element: HTMLElement, layer: Layer): void {
  const [accent, ground, ink] = ['accent', 'ground', 'ink'].map((role) => roleColor(element, role))
  if (accent) layer.colors[0] = accent
  if (ground) layer.colors[1] = ground
  if (ink && layer.colors.length > 2) layer.colors[2] = ink
  if (accent && ground && layer.colors.length > 3)
    layer.colors[3] = { r: (accent.r + ground.r) / 2, g: (accent.g + ground.g) / 2, b: (accent.b + ground.b) / 2, a: 1 }
}

for (const element of document.querySelectorAll<HTMLElement>('[data-shader], [data-kalka-shader]')) {
  try {
    const layer = JSON.parse(element.dataset.shader ?? element.dataset.kalkaShader ?? '') as Layer
    const preset = PRESETS[layer.preset]
    if (!preset) continue
    if (element.closest('[data-fresh]')) recolor(element, layer)
    if (getComputedStyle(element).position === 'static') element.style.position = 'relative'
    element.style.isolation = 'isolate'
    const host = document.createElement('div')
    host.style.cssText = 'position:absolute;inset:0;z-index:-1;overflow:hidden;border-radius:inherit'
    element.prepend(host)
    new ShaderMount(host, preset.fragment, preset.uniforms(layer), { premultipliedAlpha: false, preserveDrawingBuffer: true }, 0)
  } catch {
    // A malformed layer keeps its stand-in.
  }
}
