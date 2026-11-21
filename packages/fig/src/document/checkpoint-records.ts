import type { FigSessionCheckpoint } from './materialize'

/**
 * The layer each archive record became, by record GUID: layers, pages, instances, and the
 * layers inside components down to the instances they nest, whose contents are no records.
 */
export function figCheckpointRecords(checkpoint: FigSessionCheckpoint): Map<string, string> {
  const records = new Map(checkpoint.sources)
  for (const [componentId, component] of checkpoint.components) {
    records.set(componentId, component.rootId)
    const instances: string[][] = []
    for (const entry of component.nodes) {
      const sourceId = entry.path.at(-1)
      if (!sourceId) continue
      const inInstance = instances.some(
        (prefix) =>
          prefix.length < entry.path.length && prefix.every((id, index) => entry.path[index] === id)
      )
      if (inInstance) continue
      records.set(sourceId, entry.nodeId)
      if (entry.mainComponentId !== null) instances.push(entry.path)
    }
  }
  return records
}
