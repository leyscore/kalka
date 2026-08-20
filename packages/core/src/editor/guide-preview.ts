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
