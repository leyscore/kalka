export interface GuideSelection {
  ownerId: string
  guideId: string
}

export interface GuidePreview {
  ownerId: string
  axis: 'x' | 'y'
  position: number
  source?: GuideSelection
}

export interface GuideOverlayState {
  preview: GuidePreview | null
  hovered: GuideSelection | null
  selected: GuideSelection | null
}

export function createGuideOverlayState(): GuideOverlayState {
  return { preview: null, hovered: null, selected: null }
}
