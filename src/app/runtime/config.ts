import { appPreferences, type CanvasRenderingMode } from '@/app/settings/preferences/store'
import { IS_BROWSER } from '@/constants'

export type SceneRendererMode = CanvasRenderingMode
export type CollaborationTransportMode = 'default' | 'test'

export interface AppRuntimeConfig {
  test: boolean
  navigationBenchmark: boolean
  recentFiles: boolean
  showChrome: boolean
  showRulers: boolean
  sceneRenderer: SceneRendererMode
  sceneRendererOverride: boolean
  /**
   * Draw the scene as real DOM, Kalka's engine. Skia stays reachable with `?renderer=skia`
   * only to compare the two until it is removed at the end of jalon 1.
   */
  domScene: boolean
  collaborationTransport: CollaborationTransportMode
  collaborationRelayURL: string | null
  /**
   * `?field-writes`: every writer sets fields, as before the CSS model's migration, to compare
   * the two paths while it lasts (PLAN.md, section 12).
   */
  fieldWrites: boolean
}

export function parseAppRuntimeConfig(
  search: string,
  preferredRenderer: SceneRendererMode = 'retained'
): AppRuntimeConfig {
  const params = new URLSearchParams(search)
  const renderer = params.get('renderer')
  const sceneRenderer =
    renderer === 'tiled' || renderer === 'retained' ? renderer : preferredRenderer
  return {
    test: params.has('test'),
    navigationBenchmark: params.has('navigation-benchmark'),
    recentFiles: params.has('recent-files'),
    showChrome: !params.has('no-chrome'),
    showRulers: !params.has('no-rulers'),
    sceneRenderer,
    sceneRendererOverride: renderer === 'tiled' || renderer === 'retained',
    domScene: renderer !== 'skia' && renderer !== 'tiled' && renderer !== 'retained',
    collaborationTransport: params.get('collabTransport') === 'test' ? 'test' : 'default',
    collaborationRelayURL: params.get('collabRelay'),
    fieldWrites: params.has('field-writes')
  }
}

export const appRuntimeConfig = parseAppRuntimeConfig(
  IS_BROWSER ? window.location.search : '',
  appPreferences.value.rendering.canvasMode
)
