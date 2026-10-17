import * as v from 'valibot'

import { defineTool } from './schema'

/**
 * Lets go of what an agent was building. While an agent works, the app marks the layers it
 * writes with its name, so the user sees what is still in progress; the marks also go by
 * themselves once the agent is quiet for a while or its session ends.
 */
export const finishWorkingOnNodes = defineTool({
  name: 'finish_working_on_nodes',
  description:
    'Tell the user you are done with layers you were building. While you work, the canvas marks the layers you write with your name; call this when a section or the whole design is finished. Pass node_ids for the sections you finished (layers inside them go too), or nothing to release everything you worked on.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    node_ids: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description('Layers you finished. Omit to release everything you are working on.')
      )
    )
  }),
  execute: (figma, { node_ids }) => {
    if (!figma.finishWorking) return { released: [], note: 'This host shows no working marks.' }
    const ids = node_ids && node_ids.length > 0 ? node_ids : null
    return { released: figma.finishWorking(ids) }
  }
})
