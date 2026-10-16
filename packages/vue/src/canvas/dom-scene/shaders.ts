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
} from '@paper-design/shaders'

import {
  shaderParameter,
  type SceneGraph,
  type ShaderLayer,
  type ShaderPreset
} from '@kalka/scene-graph'

import type { DomSceneProjector } from './projector'

type Vec4 = [number, number, number, number]

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

function colors(layer: ShaderLayer, max: number): ShaderMountUniforms {
  const list: Vec4[] = layer.colors.slice(0, max).map(({ r, g, b, a }) => [r, g, b, a])
  return { u_colors: list, u_colorsCount: list.length }
}

/** Each preset's fragment shader and the uniforms a layer's settings become. */
const PRESETS: Record<
  ShaderPreset,
  { fragment: string; uniforms: (layer: ShaderLayer) => ShaderMountUniforms }
> = {
  'mesh-gradient': {
    fragment: meshGradientFragmentShader,
    uniforms: (layer) => ({
      ...sizing(defaultObjectSizing),
      ...colors(layer, 10),
      u_distortion: shaderParameter(layer, 'distortion'),
      u_swirl: shaderParameter(layer, 'swirl'),
      u_grainMixer: 0,
      u_grainOverlay: shaderParameter(layer, 'grainOverlay')
    })
  },
  'grain-gradient': {
    fragment: grainGradientFragmentShader,
    uniforms: (layer) => ({
      ...sizing(defaultObjectSizing),
      ...colors(layer, 7),
      u_colorBack: [0, 0, 0, 0],
      u_softness: shaderParameter(layer, 'softness'),
      u_intensity: shaderParameter(layer, 'intensity'),
      u_noise: shaderParameter(layer, 'noise'),
      u_shape: GrainGradientShapes.corners,
      u_noiseTexture: getShaderNoiseTexture()
    })
  },
  warp: {
    fragment: warpFragmentShader,
    uniforms: (layer) => ({
      ...sizing(defaultPatternSizing),
      ...colors(layer, 10),
      u_proportion: shaderParameter(layer, 'proportion'),
      u_softness: shaderParameter(layer, 'softness'),
      u_shape: WarpPatterns.checks,
      u_shapeScale: 0.1,
      u_distortion: shaderParameter(layer, 'distortion'),
      u_swirl: shaderParameter(layer, 'swirl'),
      u_swirlIterations: 10,
      u_noiseTexture: getShaderNoiseTexture()
    })
  }
}

interface Mounted {
  element: Element
  preset: ShaderPreset
  settings: string
  /** Where Paper Shaders draws: a box in the editor's own page, sized like the layer. */
  host: HTMLDivElement
  mount: ShaderMount
  stream: MediaStream
  video: HTMLVideoElement
  resize: ResizeObserver
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The attribute that marks the video a shader layer plays inside its artboard. */
export const SHADER_VIDEO_ATTR = 'data-kalka-shader-video'

/**
 * Runs the shader layers of the page on screen. An artboard runs no scripts, and a canvas in a
 * document without scripting shows its fallback content, never its drawing. So each shader
 * draws in the editor's own page, in a box sized like its layer, and plays into the artboard
 * as a muted video stream behind the layer's content. The design itself still runs no code.
 */
export class ShaderLayers {
  private readonly mounted = new Map<string, Mounted>()
  private layerIds: string[] = []
  private scannedVersion = -1

  constructor(
    private readonly projector: DomSceneProjector,
    private readonly getGraph: () => SceneGraph
  ) {}

  /** Brings the mounts in line with the graph; cheap when nothing changed. */
  sync(sceneVersion: number): void {
    const graph = this.getGraph()
    if (sceneVersion !== this.scannedVersion) {
      this.scannedVersion = sceneVersion
      this.layerIds = []
      for (const node of graph.nodes.values()) if (node.shader) this.layerIds.push(node.id)
    }
    const live = new Set<string>()
    for (const id of this.layerIds) {
      const layer = graph.getNode(id)?.shader
      const element = this.projector.elementOf(id)
      if (!layer || !element) continue
      live.add(id)
      this.update(id, element, layer)
    }
    for (const [id, mounted] of this.mounted) {
      if (!live.has(id) || !mounted.element.isConnected) this.unmount(id)
    }
  }

  private update(id: string, element: Element, layer: ShaderLayer): void {
    const settings = JSON.stringify(layer)
    const current = this.mounted.get(id)
    if (current?.preset === layer.preset) {
      if (current.element !== element) this.attach(current, element)
      if (current.settings === settings) return
      current.mount.setUniforms(PRESETS[layer.preset].uniforms(layer))
      current.mount.setSpeed(prefersReducedMotion() ? 0 : layer.speed)
      current.settings = settings
      return
    }
    if (current) this.unmount(id)
    this.mount(id, element, layer, settings)
  }

  private mount(id: string, element: Element, layer: ShaderLayer, settings: string): void {
    const doc = element.ownerDocument
    const view = doc.defaultView
    if (!view) return
    // Kept in the viewport, where Paper Shaders keeps animating, but never seen.
    const host = document.createElement('div')
    host.setAttribute('aria-hidden', 'true')
    host.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1;overflow:hidden'
    document.body.append(host)
    try {
      const preset = PRESETS[layer.preset]
      const mount = new ShaderMount(
        host,
        preset.fragment,
        preset.uniforms(layer),
        { premultipliedAlpha: false, preserveDrawingBuffer: true },
        prefersReducedMotion() ? 0 : layer.speed
      )
      const stream = mount.canvasElement.captureStream()
      const video = doc.createElement('video')
      // Sized on the next frame: resizing inside the callback would report a resize loop.
      const resize = new view.ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        requestAnimationFrame(() => {
          host.style.width = `${Math.max(1, width)}px`
          host.style.height = `${Math.max(1, height)}px`
        })
      })
      const mounted: Mounted = {
        element,
        preset: layer.preset,
        settings,
        host,
        mount,
        stream,
        video,
        resize
      }
      video.setAttribute(SHADER_VIDEO_ATTR, '')
      video.setAttribute('aria-hidden', 'true')
      video.muted = true
      video.autoplay = true
      video.playsInline = true
      video.srcObject = stream
      this.mounted.set(id, mounted)
      this.attach(mounted, element)
    } catch (error) {
      host.remove()
      // Without WebGL the layer keeps its gradient stand-in.
      console.warn('[shaders] A shader layer could not start.', error)
    }
  }

  /** Puts the layer's video in its element, as the first child behind its content. */
  private attach(mounted: Mounted, element: Element): void {
    mounted.resize.disconnect()
    mounted.element = element
    element.prepend(mounted.video)
    mounted.resize.observe(element)
    void mounted.video.play().catch(() => undefined)
  }

  private unmount(id: string): void {
    const mounted = this.mounted.get(id)
    if (!mounted) return
    mounted.resize.disconnect()
    mounted.video.srcObject = null
    mounted.video.remove()
    for (const track of mounted.stream.getTracks()) track.stop()
    mounted.mount.dispose()
    mounted.host.remove()
    this.mounted.delete(id)
  }

  destroy(): void {
    for (const id of this.mounted.keys()) this.unmount(id)
  }
}
