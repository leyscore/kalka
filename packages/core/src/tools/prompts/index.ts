import { JSX_REFERENCE } from '@kalka/design-jsx'

import codegen from './codegen.md?raw'
import designGuide from './design-guide.md?raw'

/**
 * Keep frontend-code generation instructions distinct from scene-authoring syntax. The
 * reference is joined verbatim: dedenting it would flatten its indented code examples.
 */
export const CODEGEN_PROMPT = [codegen.trim(), JSX_REFERENCE].join('\n\n')

/** How to design in Kalka like a senior designer: decide, set up the system, compose, review. */
export const DESIGN_GUIDE = designGuide.trim()
