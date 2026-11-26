import { i18n } from '#vue/i18n/create'

/** Labels of Figma Draw's stroke settings (width profiles and brushes) and drawing commands. */
export const drawingMessageDefaults = {
  widthProfile: 'Width profile',
  widthUniform: 'Uniform',
  widthWedge: 'Wedge',
  widthTaper: 'Taper',
  widthEye: 'Eye',
  widthRounded: 'Rounded',
  widthPinch: 'Pinch',
  widthCustom: 'Custom',
  brush: 'Brush',
  brushNone: 'None',
  brushStretch: 'Stretch',
  brushScatter: 'Scatter',
  brushCalligraphy: 'Calligraphy',
  brushInk: 'Ink',
  brushRibbon: 'Ribbon',
  brushStrands: 'Strands',
  brushDots: 'Dots',
  brushStars: 'Stars',
  brushLeaves: 'Leaves',
  brushConfetti: 'Confetti',
  brushGap: 'Gap',
  brushWiggle: 'Wiggle',
  brushSizeJitter: 'Size jitter',
  brushAngularJitter: 'Angle jitter',
  brushRotation: 'Rotation',
  brushReverse: 'Reverse direction',
  simplifyHeading: 'Simplify vector',
  simplifyTolerance: 'Tolerance'
} as const

export const drawingMessages = i18n('drawing', drawingMessageDefaults)
