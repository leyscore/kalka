import { WHITE, type Color } from '@kalka/scene-graph'
import { compositeOver, readableForeground } from '@kalka/scene-graph/color'

export function canvasLabelForeground(background: Color, canvasBackground: Color = WHITE): Color {
  return readableForeground(compositeOver(background, canvasBackground))
}
