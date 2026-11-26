import type { NodeChange } from '@kalka/kiwi/fig/codec'
import type { SceneNode, VideoPlayback } from '@kalka/scene-graph'

/**
 * A layer's video playback (`videoPlayback`: autoplay, loop, muted), both ways. Figma writes it on
 * layers that hold a video; a record without it plays as Figma's defaults do, which the scene
 * graph keeps as `null`.
 */
export function importVideoPlayback(nc: NodeChange): Pick<SceneNode, 'videoPlayback'> {
  const playback = nc.videoPlayback
  if (typeof playback !== 'object' || playback === null) return { videoPlayback: null }
  return {
    videoPlayback: {
      autoplay: playback.autoplay === true,
      loop: playback.mediaLoop === true,
      muted: playback.muted === true
    }
  }
}

export function exportVideoPlayback(
  playback: VideoPlayback | null,
  nc: { [key: string]: unknown }
): void {
  if (!playback) return
  nc.videoPlayback = {
    autoplay: playback.autoplay,
    mediaLoop: playback.loop,
    muted: playback.muted
  }
}
