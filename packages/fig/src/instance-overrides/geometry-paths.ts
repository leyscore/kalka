import type { GeometryPath } from '@open-pencil/scene-graph'
import { copyGeometryPaths } from '@open-pencil/scene-graph/copy'

export function scaleGeometryPaths(
  geometry: GeometryPath[],
  scaleX: number,
  scaleY: number
): GeometryPath[] {
  const copies = copyGeometryPaths(geometry)
  if (scaleX === 1 && scaleY === 1) return copies

  for (const path of copies) {
    const view = new DataView(
      path.commandsBlob.buffer,
      path.commandsBlob.byteOffset,
      path.commandsBlob.byteLength
    )
    let offset = 0
    while (offset < path.commandsBlob.length) {
      const command = path.commandsBlob[offset]
      offset += 1
      if (command === 0) continue

      let coordinateCount = 0
      if (command === 1 || command === 2) coordinateCount = 1
      else if (command === 3) coordinateCount = 2
      else if (command === 4) coordinateCount = 3
      if (coordinateCount === 0 || offset + coordinateCount * 8 > path.commandsBlob.length) break
      for (let index = 0; index < coordinateCount; index++) {
        view.setFloat32(offset, view.getFloat32(offset, true) * scaleX, true)
        view.setFloat32(offset + 4, view.getFloat32(offset + 4, true) * scaleY, true)
        offset += 8
      }
    }
  }
  return copies
}
