import type { VectorNetwork } from '@kalka/scene-graph'

/**
 * Figma's Reverse path direction: every segment runs the other way and the path starts at what
 * was its end, so dashes, a variable width and text on the path start from the other end. The
 * shape does not move.
 */
export function reversePathDirection(network: VectorNetwork): VectorNetwork {
  const last = network.segments.length - 1
  return {
    vertices: network.vertices.map((vertex) => ({ ...vertex })),
    segments: network.segments
      .map((segment) => ({
        start: segment.end,
        end: segment.start,
        tangentStart: { ...segment.tangentEnd },
        tangentEnd: { ...segment.tangentStart }
      }))
      .reverse(),
    regions: network.regions.map((region) => ({
      ...region,
      loops: region.loops.map((loop) => loop.map((index) => last - index).reverse())
    }))
  }
}
