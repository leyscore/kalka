import { h, onScopeDispose, type VNode } from 'vue'

import {
  isVideoTrimmed,
  videoPlaybackOf,
  type Fill,
  type ImageScaleMode,
  type PrototypeMediaAction,
  type SceneGraph,
  type VideoPlayback
} from '@kalka/scene-graph'

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

/** A presented video reached a point that a Video hits or Video ends trigger waits for. */
export type PresentMediaEvent =
  | { nodeId: string; type: 'ON_MEDIA_HIT'; from: number; to: number }
  | { nodeId: string; type: 'ON_MEDIA_END' }

/** How far back the time may jump while playing before it is a loop starting over, in seconds. */
const LOOP_JUMP = 0.25

/**
 * Video paints in a presented prototype: where canvases and exports draw a video paint's poster
 * frame, the presenter plays its clip over it, behind the layer's own content, as the layer's
 * playback says (by default on its own, looping and muted, as Figma's prototypes start videos).
 * A paint whose clip the document does not hold keeps its poster. Each clip gets one object URL,
 * released with the presenter. `onMedia` hears the time a video plays through and its end,
 * including each time a looping one starts over.
 */
export function usePresentVideos(onMedia?: (event: PresentMediaEvent) => void) {
  const urls = new Map<string, string>()
  /** How far each video has played, which the next time update starts from. */
  const played = new WeakMap<HTMLVideoElement, number>()

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
    const playback = videoPlaybackOf(graph.getNode(nodeId) ?? { videoPlayback: null })
    const trimmed = isVideoTrimmed(playback)
    const ended = (video: HTMLVideoElement) => {
      played.set(video, playback.startTime)
      onMedia?.({ nodeId, type: 'ON_MEDIA_END' })
    }
    return h('video', {
      key: `video:${paint.videoHash}`,
      'data-present-video': '',
      src,
      autoplay: playback.autoplay,
      muted: playback.muted,
      // A trimmed clip loops itself, from its start rather than the clip's.
      loop: playback.loop && !trimmed,
      controls: playback.showControls,
      playsinline: true,
      onLoadedmetadata: (event: Event) => {
        const video = event.currentTarget
        if (!(video instanceof HTMLVideoElement) || playback.startTime <= 0) return
        video.currentTime = playback.startTime
      },
      onTimeupdate: (event: Event) => {
        const video = event.currentTarget
        if (!(video instanceof HTMLVideoElement)) return
        const last = played.get(video) ?? playback.startTime
        const end = playback.endTime
        if (end !== null && video.currentTime >= end) {
          // The times up to the trimmed end are played through before it ends.
          if (end > last) onMedia?.({ nodeId, type: 'ON_MEDIA_HIT', from: last, to: end })
          endTrimmed(video, playback)
          ended(video)
          return
        }
        const time = video.currentTime
        if (time + LOOP_JUMP < last) onMedia?.({ nodeId, type: 'ON_MEDIA_END' })
        else if (time > last) onMedia?.({ nodeId, type: 'ON_MEDIA_HIT', from: last, to: time })
        played.set(video, time)
      },
      onSeeked: (event: Event) => {
        const video = event.currentTarget
        if (video instanceof HTMLVideoElement) played.set(video, video.currentTime)
      },
      onEnded: (event: Event) => {
        const video = event.currentTarget
        if (!(video instanceof HTMLVideoElement)) return
        if (trimmed) endTrimmed(video, playback)
        ended(video)
      },
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
        // The controls take the pointer; the layer's own interactions still hear the click.
        pointerEvents: playback.showControls ? 'auto' : 'none'
      }
    })
  }

  onScopeDispose(() => {
    for (const url of urls.values()) URL.revokeObjectURL(url)
    urls.clear()
  })

  return { videoOf }
}

/**
 * A trimmed clip reached its end: it starts over from its start when it loops, else stops
 * there, as Figma plays a trimmed video.
 */
function endTrimmed(video: HTMLVideoElement, playback: VideoPlayback): void {
  video.currentTime = playback.startTime
  if (playback.loop) void video.play().catch(() => undefined)
  else video.pause()
}

/** The video a presented layer plays: the layer itself, or the one behind its content. */
export function videoIn(element: HTMLElement | null): HTMLVideoElement | null {
  if (!element) return null
  const found = element.querySelector(':scope > video[data-present-video]')
  return found instanceof HTMLVideoElement ? found : null
}

/** Plays, pauses, mutes or moves through a presented video, as a media action asks. */
export function runMediaAction(video: HTMLVideoElement, action: PrototypeMediaAction): void {
  const play = () => void video.play().catch(() => undefined)
  const seek = (time: number) => {
    const end = Number.isFinite(video.duration) ? video.duration : Infinity
    video.currentTime = Math.min(Math.max(0, time), end)
  }
  switch (action.mediaAction) {
    case 'PLAY':
      return play()
    case 'PAUSE':
      return video.pause()
    case 'TOGGLE_PLAY_PAUSE':
      return video.paused ? play() : video.pause()
    case 'MUTE':
      video.muted = true
      return
    case 'UNMUTE':
      video.muted = false
      return
    case 'TOGGLE_MUTE_UNMUTE':
      video.muted = !video.muted
      return
    case 'SKIP_FORWARD':
      return seek(video.currentTime + action.amountToSkip)
    case 'SKIP_BACKWARD':
      return seek(video.currentTime - action.amountToSkip)
    case 'SKIP_TO':
      return seek(action.newTimestamp)
  }
}
