import type { ToolPolicy } from '#mcp/tool/metadata'

export function parseDisabledTools(value: string | undefined): string[] {
  if (!value) return []
  return [
    ...new Set(
      value
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
    )
  ]
}

export function readToolPolicyFromEnv(env: NodeJS.ProcessEnv = process.env): ToolPolicy {
  return {
    allowEval: env.OPENPENCIL_MCP_EVAL === '1',
    disabledTools: parseDisabledTools(env.OPENPENCIL_MCP_DISABLED_TOOLS)
  }
}
