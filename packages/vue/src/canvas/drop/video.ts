import { useEventListener } from '@vueuse/core'
import { effectScope } from 'vue'

import type { Editor, PreparedVideo } from '@kalka/core/editor'

/** The video files Figma places: MP4, MOV and WebM. */
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm'])
const VIDEO_EXTENSION = /\.(mp4|m4v|mov|webm)$/i
/** The largest side a placed video's layer takes, as placed images. */
const VIDEO_MAX_DIMENSION = 4096

export function isVideoFile(file: Pick<File, 'name' | 'type'>): boolean {
  return VIDEO_TYPES.has(file.type) || (file.type === '' && VIDEO_EXTENSION.test(file.name))
}

/** Resolves once `video` fires `ready`, rejects when it fails to load. */
function loaded(video: HTMLVideoElement, ready: 'loadeddata' | 'seeked'): Promise<void> {
  const scope = effectScope()
  return new Promise<void>((resolve, reject) => {
    scope.run(() => {
      useEventListener(video, ready, () => resolve(), { once: true })
      useEventListener(video, 'error', () => reject(new Error('The video cannot be read')), {
        once: true
      })
    })
  }).finally(() => scope.stop())
}

function fitted(width: number, height: number) {
  const ratio = Math.min(1, VIDEO_MAX_DIMENSION / width, VIDEO_MAX_DIMENSION / height)
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

/**
 * The frame a video shows, as PNG bytes: the poster that canvases and exports draw for a video
 * paint. Null before the video has a frame.
 */
export async function videoFrame(video: HTMLVideoElement): Promise<Uint8Array | null> {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) return null
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0)
  const png = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  return png ? new Uint8Array(await png.arrayBuffer()) : null
}

/**
 * Reads a video file in the browser: its bytes, its first frame as a PNG poster, which canvases
 * and exports draw where the video does not play, and its size. Null when the browser cannot
 * play it.
 */
export async function readVideoFile(file: File): Promise<PreparedVideo | null> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  try {
    const ready = loaded(video, 'loadeddata')
    video.src = url
    await ready
    const poster = await videoFrame(video)
    if (!poster) return null
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      poster,
      name: file.name,
      ...fitted(video.videoWidth, video.videoHeight)
    }
    // oxlint-disable-next-line kalka/no-silent-catch -- A video the browser cannot play is skipped, as an image it cannot decode is.
  } catch {
    return null
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(url)
  }
}

/** Places files on the canvas around a point: videos as layers with a video paint, the rest as Core places them. */
export async function placeCanvasFiles(
  editor: Pick<Editor, 'placeFiles' | 'placeVideos'>,
  files: File[],
  x: number,
  y: number
): Promise<void> {
  const videos = files.filter(isVideoFile)
  const others = files.filter((file) => !isVideoFile(file))
  if (others.length > 0) await editor.placeFiles(others, x, y)
  if (videos.length === 0) return
  const read = (await Promise.all(videos.map(readVideoFile))).filter(
    (video): video is PreparedVideo => video !== null
  )
  if (read.length > 0) editor.placeVideos(read, x, y)
}
