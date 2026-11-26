export interface GUID {
  sessionID: number
  localID: number
}

export interface Color {
  r: number
  g: number
  b: number
  a: number
}

export interface Vector {
  x: number
  y: number
}

export interface Matrix {
  m00: number
  m01: number
  m02: number
  m10: number
  m11: number
  m12: number
}

/** How a layer's video plays (`VideoPlayback`); times are whole milliseconds of the clip. */
export interface KiwiVideoPlayback {
  autoplay?: boolean
  mediaLoop?: boolean
  muted?: boolean
  showControls?: boolean
  startTimeMs?: number
  /** 0 plays to the end of the clip. */
  endTimeMs?: number
}
