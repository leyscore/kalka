/** The name clients list Kalka's server under. */
export const MCP_SERVER_NAME = 'kalka'

/**
 * What every client reads before its first tool call. Kalka is one server among many a client may
 * have connected, so it asks the agent to bring in what the design depends on from the others.
 */
export const MCP_SERVER_INSTRUCTIONS = [
  'Kalka is a design editor whose canvas is real HTML and CSS: every layer is an element the user can export without rewriting it.',
  'Before you design, gather what the design depends on from the other servers this client has connected, such as product specs, docs, tickets, brand guidelines or real data, and use that content instead of placeholders.',
  'Start with get_selection or get_page_tree to see what exists. Build layouts with write_html (flexbox and real CSS), adjust them with update_styles, read them back with get_html or get_computed_styles, and check your work with get_screenshot after each meaningful change.',
  'The user watches the canvas live: each write appears as it lands, marked with your name while you work. Build a design in small visual groups, one section per write_html or render call (the page shell first, then the header, the hero, each content section, the footer), rather than the whole page in one call, so the user sees it take shape and can stop you early. When a section or the whole design is done, call finish_working_on_nodes so the marks go away.',
  "Give layers the semantics the exported page needs: write_html keeps the tags and class attributes you write, and set_html_element changes a layer's tag (h1, nav, a, button) or classes without changing its look.",
  'Share styles through classes: a <style> rule for one class in write_html becomes a document class, update_css_class creates or changes one for every layer that has it, and get_css_classes lists them.',
  'For responsive pages, add_breakpoint gives a top-level artboard narrower copies (810 for tablet, 390 for phone); change layers inside a breakpoint to make what differs there, which the HTML export writes as @media rules.'
].join('\n\n')

/** The server info and options every Kalka MCP server is created with. */
export function createServerIdentity(version: string) {
  return [{ name: MCP_SERVER_NAME, version }, { instructions: MCP_SERVER_INSTRUCTIONS }] as const
}
