import { DESIGN_GUIDE } from '@kalka/core/tools'
import { JSX_REFERENCE } from '@kalka/design-jsx'

import behavior from './system-prompt.md?raw'

/**
 * Chat and ACP share the design process MCP agents read with get_design_guide, and the
 * scene-authoring knowledge, without copying either. The reference is joined verbatim:
 * dedenting it would flatten its indented code examples.
 */
const SYSTEM_PROMPT = [behavior.trim(), DESIGN_GUIDE, JSX_REFERENCE].join('\n\n')

export default SYSTEM_PROMPT
