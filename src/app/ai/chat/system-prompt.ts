import { ANTI_SLOP_GUIDE, DESIGN_GUIDE, STYLE_SYSTEM } from '@kalka/core/tools'
import { JSX_REFERENCE } from '@kalka/design-jsx'

import behavior from './system-prompt.md?raw'

/**
 * Chat and ACP share the design process, anti-slop catalogue and style system MCP agents read
 * with get_design_guide, and the scene-authoring knowledge, without copying any of them. A
 * style's full guide is read on demand with read_style. The reference is joined verbatim:
 * dedenting it would flatten its indented code examples.
 */
const SYSTEM_PROMPT = [
  behavior.trim(),
  DESIGN_GUIDE,
  ANTI_SLOP_GUIDE,
  STYLE_SYSTEM,
  JSX_REFERENCE
].join('\n\n')

export default SYSTEM_PROMPT
