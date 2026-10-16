import dedent from 'dedent'

import { ACP_AGENTS, type ACPAgentID } from '@kalka/core/constants'

import { MCP_INSTALL_TARGET } from '@/app/automation/mcp/failure'

/** Installs Kalka's MCP server at the version that matches the app. */
export const MCP_INSTALL_COMMAND = `npm i -g ${MCP_INSTALL_TARGET}`

/** The public guide for connecting a coding agent, one section per agent. */
export const CODING_AGENTS_GUIDE_URL =
  'https://github.com/leyscore/kalka/blob/main/packages/docs/programmable/coding-agents.md'

const SIGN_IN: Record<ACPAgentID, string> = {
  'claude-code':
    'Make sure I am signed in to Claude Code: run `claude` and use `/login` if it asks me to sign in.',
  codex: 'Make sure I am signed in to Codex: run `codex login` if I am not.',
  'gemini-cli': 'Make sure I am signed in to Gemini CLI: run `gemini` and choose a sign-in method.'
}

export function codingAgentGuideURL(agentID: ACPAgentID): string {
  return `${CODING_AGENTS_GUIDE_URL}#${agentID}`
}

/**
 * Markdown to paste into a coding agent the person already uses, asking it to install what
 * Kalka needs to start it. Written for the agent, so it stays in English.
 */
export function codingAgentSetupPrompt(
  agentID: ACPAgentID,
  options: { bundledMCP?: boolean } = {}
): string {
  const agent = ACP_AGENTS.find((candidate) => candidate.id === agentID)
  if (!agent) return ''
  const install = agent.installCommand ?? `Install ${agent.name}`
  // The desktop app runs its own MCP server, so only the agent needs installing.
  if (options.bundledMCP) {
    return dedent`
      Help me connect ${agent.name} to Kalka, an open-source design editor. Kalka starts ${agent.name} through the Agent Client Protocol and gives it canvas tools through the MCP server built into the Kalka app, so only ${agent.name} needs to be installed on this computer.

      Please do this for me:

      1. If \`${agent.command}\` is not on my PATH, install it: \`${install}\`
      2. Confirm the command is found, for example with \`which ${agent.command}\` (\`where\` on Windows). If a global npm folder is missing from my PATH, tell me how to add it.
      3. ${SIGN_IN[agentID]}

      Then tell me what you installed and anything I still need to do myself. I will press "Check again" in Kalka's AI setup afterwards.

      Setup guide: ${codingAgentGuideURL(agentID)}
    `
  }
  return dedent`
    Help me connect ${agent.name} to Kalka, an open-source design editor. Kalka starts ${agent.name} through the Agent Client Protocol and gives it canvas tools through Kalka's local MCP server, so both need to be installed on this computer.

    Please do this for me:

    1. If \`${agent.command}\` is not on my PATH, install it: \`${install}\`
    2. If \`openpencil-mcp-http\` is not on my PATH, install Kalka's MCP server: \`${MCP_INSTALL_COMMAND}\`
    3. Confirm both commands are found, for example with \`which ${agent.command}\` and \`which openpencil-mcp-http\` (\`where\` on Windows). If a global npm folder is missing from my PATH, tell me how to add it.
    4. ${SIGN_IN[agentID]}

    Then tell me what you installed and anything I still need to do myself. I will press "Check again" in Kalka's AI setup afterwards.

    Setup guide: ${codingAgentGuideURL(agentID)}
  `
}
