import { JSX_REFERENCE } from '@kalka/design-jsx'

import antiSlop from './anti-slop.md?raw'
import codegen from './codegen.md?raw'
import designGuide from './design-guide.md?raw'

/**
 * Keep frontend-code generation instructions distinct from scene-authoring syntax. The
 * reference is joined verbatim: dedenting it would flatten its indented code examples.
 */
export const CODEGEN_PROMPT = [codegen.trim(), JSX_REFERENCE].join('\n\n')

/** How to design in Kalka like a senior designer: decide, set up the system, compose, review. */
export const DESIGN_GUIDE = designGuide.trim()

/**
 * The signs that make a design look machine-made, what replaces each, and how to check for
 * them. The app offers it as the `/anti-slop` skill and get_design_guide returns it.
 */
export const ANTI_SLOP_GUIDE = antiSlop.trim()
