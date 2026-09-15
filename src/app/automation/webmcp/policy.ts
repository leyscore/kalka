import * as v from 'valibot'

import { ALL_TOOLS } from '@open-pencil/core/tools'

export const webmcpModeSchema = v.picklist(['off', 'inspect', 'edit'])
export type WebMCPMode = v.InferOutput<typeof webmcpModeSchema>

export function resolveWebMCPMode(value: unknown): WebMCPMode {
  const result = v.safeParse(webmcpModeSchema, value)
  return result.success ? result.output : 'off'
}

export function getWebMCPTools(mode: WebMCPMode) {
  return ALL_TOOLS.filter(
    (tool) => tool.exposure.webmcp && mode !== 'off' && (mode === 'edit' || !tool.mutates)
  )
}
