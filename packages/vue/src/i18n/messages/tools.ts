import { i18n } from '#vue/i18n/create'

export const toolMessageDefaults = {
  move: 'Move',
  frame: 'Frame',
  section: 'Section',
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  line: 'Line',
  arrow: 'Arrow',
  polygon: 'Polygon',
  star: 'Star',
  pen: 'Pen',
  text: 'Text',
  hand: 'Hand',
  pencil: 'Pencil',
  scale: 'Scale'
} as const

export const toolMessages = i18n('tools', toolMessageDefaults)
