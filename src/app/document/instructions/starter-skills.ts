import antiSlop from './skills/anti-slop.md?raw'
import copy from './skills/copy.md?raw'
import critique from './skills/critique.md?raw'
import designSystem from './skills/design-system.md?raw'
import direction from './skills/direction.md?raw'
import landingPage from './skills/landing-page.md?raw'
import polish from './skills/polish.md?raw'
import responsive from './skills/responsive.md?raw'

/**
 * The skills Kalka comes with, by name. Each is asked for in the conversation with a slash, such
 * as `/critique`. They live in the app, not in each folder, so an improved skill reaches every
 * project; a folder adds its own, or replaces one of these, with a file of the same name in
 * `instructions/skills`.
 *
 * Each follows the same order, which is what makes a skill hold: decide before drawing, rules
 * with numbers, what never to do, then a check of the result.
 */
export const BUILT_IN_SKILLS: Readonly<Record<string, string>> = {
  direction,
  'design-system': designSystem,
  'landing-page': landingPage,
  copy,
  critique,
  responsive,
  polish,
  'anti-slop': antiSlop
}

const USES = /^Uses:[ \t]*(.+)$/m

/** The skills a skill asks to be read with it, from its `Uses: /a, /b` line. */
export function usedSkills(text: string): string[] {
  const line = USES.exec(text)?.[1] ?? ''
  return line
    .split(',')
    .map((name) => name.trim().replace(/^\//, ''))
    .filter((name) => name.length > 0)
}

/** A skill's text without its `Uses:` line, which is for the loader and not for the agent. */
export function skillBody(text: string): string {
  return text
    .replace(USES, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
