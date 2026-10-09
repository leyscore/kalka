/** The name clients list Kalka's server under. */
export const MCP_SERVER_NAME = 'kalka'

/**
 * What every client reads before its first tool call. Kalka is one server among many a client may
 * have connected, so it asks the agent to bring in what the design depends on from the others.
 */
export const MCP_SERVER_INSTRUCTIONS = [
  'Kalka is a design editor whose canvas is real HTML and CSS: every layer is an element the user can export without rewriting it.',
  'Before you design, gather what the design depends on from the other servers this client has connected, such as product specs, docs, tickets, brand guidelines or real data, and use that content instead of placeholders.',
  'Start with get_selection or get_page_tree to see what exists. Build layouts with write_html (flexbox and real CSS), adjust them with update_styles, read them back with get_html or get_computed_styles, and check your work with get_screenshot after each meaningful change. The user watches the canvas live, so work in small steps.'
].join('\n\n')

/** The server info and options every Kalka MCP server is created with. */
export function createServerIdentity(version: string) {
  return [{ name: MCP_SERVER_NAME, version }, { instructions: MCP_SERVER_INSTRUCTIONS }] as const
}
