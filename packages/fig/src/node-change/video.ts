import type { NodeChange } from '@kalka/kiwi/fig/codec'
import type { SceneNode, VideoPlayback } from '@kalka/scene-graph'

const MS = 1000

/** A time Figma keeps in whole milliseconds, in seconds; a missing or zero one is unset. */
function seconds(ms: number | undefined): number | null {
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms / MS : null
}

/**
 * A layer's video playback (`videoPlayback`: autoplay, loop, muted, controls and the trimmed
 * part of the clip in milliseconds), both ways. Figma writes it on layers that hold a video; a
 * record without it plays as Figma's defaults do, which the scene graph keeps as `null`. An end
 * time of 0 plays to the end of the clip.
 */
export function importVideoPlayback(nc: NodeChange): Pick<SceneNode, 'videoPlayback'> {
  const playback = nc.videoPlayback
  if (!playback) return { videoPlayback: null }
  const startTime = seconds(playback.startTimeMs) ?? 0
  const endTime = seconds(playback.endTimeMs)
  return {
    videoPlayback: {
      autoplay: playback.autoplay === true,
      loop: playback.mediaLoop === true,
      muted: playback.muted === true,
      showControls: playback.showControls === true,
      startTime,
      endTime: endTime !== null && endTime > startTime ? endTime : null
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
    muted: playback.muted,
    showControls: playback.showControls,
    startTimeMs: Math.round(playback.startTime * MS),
    endTimeMs: playback.endTime === null ? 0 : Math.round(playback.endTime * MS)
  }
}
