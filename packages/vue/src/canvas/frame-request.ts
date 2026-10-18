/** What `createFrameRequest` needs from the page: the browser's frame callbacks by default. */
export interface FrameScheduler {
  onNextFrame: (callback: () => void) => number
  cancelFrame: (handle: number) => void
}

const animationFrames: FrameScheduler = {
  onNextFrame: (callback) => requestAnimationFrame(callback),
  cancelFrame: (handle) => cancelAnimationFrame(handle)
}

export interface FrameRequest {
  /** Draws on the next frame; several requests before it make one frame. */
  request: () => void
  /** Drops a requested frame, as when the view goes away. */
  cancel: () => void
}

/**
 * Frames drawn only when something asked for one, instead of a loop that wakes the page on every
 * display refresh: an idle canvas then costs nothing. `draw` returns true while what it shows
 * still moves, such as an animation or work left for the next frame, to get another frame.
 */
export function createFrameRequest(
  draw: () => boolean,
  display: FrameScheduler = animationFrames
): FrameRequest {
  let handle = 0
  let pending = false

  function run() {
    pending = false
    handle = 0
    if (draw()) request()
  }

  function request() {
    if (pending) return
    pending = true
    handle = display.onNextFrame(run)
  }

  return {
    request,
    cancel() {
      if (pending) display.cancelFrame(handle)
      pending = false
      handle = 0
    }
  }
}
