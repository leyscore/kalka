import { joinFolderPath } from '@/app/document/io/kalka-folder'

import { INSTRUCTIONS_DIR, RULES_FILE, SUMMARY_FILE } from './layout'
import { BUILT_IN_SKILLS } from './starter-skills'

const SUMMARY = `# Summary

What this project is, in a few lines. Agents read it at the start of every conversation.

- Who it is for:
- What it should make them do:
- The feeling it should leave:
`

const RULES = `# Rules

What an agent must respect whenever it draws here. Keep it short: every line is read every time.

- Brand voice:
- Colors and type: use the variables in design-system/tokens.css, never a new color.
- Always:
- Never:
`

const README = `# Instructions

What the agents working on this project should know. This file is for you: it is not sent to
the agent.

## What is here

- **summary.md**: the project in a few lines. Read at the start of every conversation.
- **rules.md**: what an agent must always respect here. Read at the start of every
  conversation.

Both are empty forms. Fill them in; an example is at the end of this file.

## Skills

Kalka comes with these skills. They are part of the app, the same in every project and kept
up to date with it, so they are not copied here. Ask for one in the conversation with a slash:

${Object.keys(BUILT_IN_SKILLS)
  .map((name) => `- \`/${name}\``)
  .join('\n')}

A good order for a new page: \`/direction\`, \`/landing-page\`, \`/responsive\`,
\`/polish\`. Use \`/critique\` for a second opinion and \`/copy\` on any text.

To add a skill of your own, create a \`skills\` folder here and put a Markdown file in it:
\`skills/pricing-page.md\` becomes \`/pricing-page\`. To replace one of Kalka's for this
project, give your file the same name.

## Documents

Reference content, such as a brief, the offers or real texts, goes in a \`documents\` folder
here, one file per subject. An agent reads a document when you cite it with an at sign:
\`@brief.md\`.

## What filled in looks like

A summary that helps:

> Booking software for independent bike repair shops. Mechanics use it at the counter, on a
> tablet with greasy hands, to book a repair in under a minute. It should feel like the shop's
> own job board: blunt, practical, nothing decorative.

Rules that help:

> - Voice: plain and direct, the way a mechanic talks to a customer. No exclamation marks.
> - Colors and type come from the variables. The red is the tool-chest red, used only for
>   what needs action today.
> - Always show real repairs with real prices. Never a placeholder.
> - Never say "seamless", never promise a time we do not measure.
`

/**
 * The instructions a folder starts with, by path inside it: one README and two forms. Skills
 * come with the app, and the folders for a project's own skills and documents appear when the
 * person adds one.
 */
export const STARTER_INSTRUCTIONS: ReadonlyMap<string, string> = new Map([
  [`${INSTRUCTIONS_DIR}/README.md`, README],
  [`${INSTRUCTIONS_DIR}/${SUMMARY_FILE}`, SUMMARY],
  [`${INSTRUCTIONS_DIR}/${RULES_FILE}`, RULES]
])

const STARTER_TEXTS = new Set([...STARTER_INSTRUCTIONS.values()].map((text) => text.trim()))

/** Whether a file still holds exactly what Kalka wrote in it. */
export function isStarterText(text: string): boolean {
  return STARTER_TEXTS.has(text.trim())
}

/**
 * Gives a folder its instructions the first time: nothing is written once the folder has an
 * `instructions` folder, whatever it holds, so what the person wrote or removed stays as it is.
 */
export async function startInstructions(folder: string): Promise<boolean> {
  const { exists, mkdir, writeFile } = await import('@tauri-apps/plugin-fs')
  const encoder = new TextEncoder()
  if (await exists(joinFolderPath(folder, INSTRUCTIONS_DIR))) return false
  for (const [path, text] of STARTER_INSTRUCTIONS) {
    const directory = path.split('/').slice(0, -1).join('/')
    await mkdir(joinFolderPath(folder, directory), { recursive: true })
    await writeFile(joinFolderPath(folder, path), encoder.encode(text))
  }
  return true
}
