import { JSX_REFERENCE } from '@kalka/design-jsx'

import antiSlop from './anti-slop.md?raw'
import codegen from './codegen.md?raw'
import designGuide from './design-guide.md?raw'
import bauhaus from './styles/bauhaus.md?raw'
import bento from './styles/bento.md?raw'
import blueprint from './styles/blueprint.md?raw'
import cinematic from './styles/cinematic.md?raw'
import corporateTrust from './styles/corporate-trust.md?raw'
import darkPrecision from './styles/dark-precision.md?raw'
import deStijl from './styles/de-stijl.md?raw'
import direction from './styles/direction.md?raw'
import editorial from './styles/editorial.md?raw'
import global from './styles/global.md?raw'
import styleIndex from './styles/index.md?raw'
import swissGrid from './styles/swiss-grid.md?raw'
import warmOrganic from './styles/warm-organic.md?raw'

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

/** The full guide of each style the agent may choose, read on demand with read_style. */
const STYLE_GUIDES = {
  editorial,
  'swiss-grid': swissGrid,
  'warm-organic': warmOrganic,
  'dark-precision': darkPrecision,
  'corporate-trust': corporateTrust,
  bento,
  blueprint,
  cinematic,
  bauhaus,
  'de-stijl': deStijl
} as const

export type StyleName = keyof typeof STYLE_GUIDES

export const STYLE_NAMES = Object.keys(STYLE_GUIDES) as [StyleName, ...StyleName[]]

export function styleGuide(name: StyleName): string {
  return STYLE_GUIDES[name].trim()
}

/**
 * The rules every page follows whatever its style, the colour and type direction, then the index
 * a style is picked from. Choosing a style is optional; its full guide is read only once chosen,
 * so a conversation carries one style at most.
 */
export const STYLE_SYSTEM = [global.trim(), direction.trim(), styleIndex.trim()].join('\n\n')
