import type { ToolPolicy } from '#mcp/tool/metadata'
import { parseDisabledTools } from '#mcp/tool/policy'
import { narrowestScope, parseToolScope } from '#mcp/tool/scope'
import type { DiscoveryInfo } from '#mcp/transport/discovery'

/**
 * The tools a stdio client is offered. With Kalka closed there is no discovery file, and the bridge
 * lists every tool it ships with; once the app is up, its disabled tools and scope apply. The
 * environment overrides the disabled tools and can only narrow the scope.
 */
export function stdioToolPolicy(
  discovery: Pick<DiscoveryInfo, 'disabledTools' | 'scope'> | null,
  env: NodeJS.ProcessEnv = process.env
): ToolPolicy {
  return {
    allowEval: env.KALKA_MCP_EVAL === '1',
    disabledTools:
      env.KALKA_MCP_DISABLED_TOOLS === undefined
        ? (discovery?.disabledTools ?? [])
        : parseDisabledTools(env.KALKA_MCP_DISABLED_TOOLS),
    // The server enforces its own scope on every call; this keeps the tool list in step with it,
    // and lets the client limit itself further.
    scope: narrowestScope(discovery?.scope ?? 'document', parseToolScope(env.KALKA_MCP_SCOPE))
  }
}
