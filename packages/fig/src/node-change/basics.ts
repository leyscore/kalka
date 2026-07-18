import type { SceneNode } from '@open-pencil/scene-graph'

export function mapToFigmaType(type: SceneNode['type']): string {
  switch (type) {
    case 'FRAME':
      return 'FRAME'
    case 'RECTANGLE':
      return 'RECTANGLE'
    case 'ROUNDED_RECTANGLE':
      return 'ROUNDED_RECTANGLE'
    case 'ELLIPSE':
      return 'ELLIPSE'
    case 'TEXT':
      return 'TEXT'
    case 'LINE':
      return 'LINE'
    case 'STAR':
      return 'STAR'
    case 'POLYGON':
      return 'REGULAR_POLYGON'
    case 'VECTOR':
      return 'VECTOR'
    case 'BOOLEAN_OPERATION':
      return 'BOOLEAN_OPERATION'
    case 'GROUP':
      return 'FRAME'
    case 'SECTION':
      return 'SECTION'
    case 'COMPONENT':
      return 'SYMBOL'
    case 'COMPONENT_SET':
      return 'FRAME'
    case 'INSTANCE':
      return 'INSTANCE'
    case 'CONNECTOR':
      return 'CONNECTOR'
    case 'SHAPE_WITH_TEXT':
      return 'SHAPE_WITH_TEXT'
    default:
      return 'RECTANGLE'
  }
}

/** Generate a printable, lexicographically ordered parent position. */
export function fractionalPosition(index: number): string {
  const BASE = 94
  const FIRST = 33
  const TILDE = 126
  const numTildes = Math.floor(index / BASE)
  const lastChar = String.fromCharCode(FIRST + (index % BASE))
  return String.fromCharCode(TILDE).repeat(numTildes) + lastChar
}
