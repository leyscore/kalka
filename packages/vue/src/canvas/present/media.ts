import { h, onScopeDispose, type VNode } from 'vue'

import type { Fill, ImageScaleMode, SceneGraph } from '@kalka/scene-graph'

const OBJECT_FIT: Readonly<Record<ImageScaleMode, string>> = {
  FILL: 'cover',
  FIT: 'contain',
  CROP: 'cover',
  TILE: 'cover'
}

/** The topmost visible video paint of a layer whose clip the document holds. */
function videoPaint(graph: SceneGraph, nodeId: string): Fill | undefined {
  const node = graph.getNode(nodeId)
  if (!node) return undefined
  return node.fills.findLast(
    (fill) =>
      fill.visible && fill.type === 'VIDEO' && !!fill.videoHash && graph.images.has(fill.videoHash)
  )
}

/**
 * Video paints in a presented prototype: where canvases and exports draw a video paint's poster
 * frame, the presenter plays its clip over it, muted and looping as Figma's prototypes start
 * videos, behind the layer's own content. A paint whose clip the document does not hold keeps
 * its poster. Each clip gets one object URL, released with the presenter.
 */
export function usePresentVideos() {
  const urls = new Map<string, string>()

  function urlOf(graph: SceneGraph, hash: string): string | null {
    const known = urls.get(hash)
    if (known) return known
    const bytes = graph.images.get(hash)
    if (!bytes) return null
    const url = URL.createObjectURL(new Blob([bytes.slice()]))
    urls.set(hash, url)
    return url
  }

  /** The video a layer plays behind its content, or null. */
  function videoOf(graph: SceneGraph, nodeId: string): VNode | null {
    const paint = videoPaint(graph, nodeId)
    const src = paint?.videoHash ? urlOf(graph, paint.videoHash) : null
    if (!paint || !src) return null
    return h('video', {
      key: `video:${paint.videoHash}`,
      'data-present-video': '',
      src,
      autoplay: true,
      muted: true,
      loop: true,
      playsinline: true,
      style: {
        position: 'absolute',
        inset: '0',
        zIndex: '-1',
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: OBJECT_FIT[paint.imageScaleMode ?? 'FILL'],
        opacity: String(paint.opacity),
        borderRadius: 'inherit',
        pointerEvents: 'none'
      }
    })
  }

  onScopeDispose(() => {
    for (const url of urls.values()) URL.revokeObjectURL(url)
    urls.clear()
  })

  return { videoOf }
}
