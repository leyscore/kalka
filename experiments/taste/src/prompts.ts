/**
 * The prompts of the three conditions the harness compares. The baseline is Kalka's real design
 * guide and anti-slop catalogue, unchanged; the pipeline replaces free drawing with a genome the
 * agent chooses by reasoning from the brief and that the tools then enforce.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { menu, vocabulary, type Surface, type System } from './genome'
import type { Finding } from './measure'

const PROMPTS = join(import.meta.dir, '..', '..', '..', 'packages', 'core', 'src', 'tools', 'prompts')
const DESIGN_GUIDE = readFileSync(join(PROMPTS, 'design-guide.md'), 'utf8').trim()
const ANTI_SLOP = readFileSync(join(PROMPTS, 'anti-slop.md'), 'utf8').trim()

export type Brief = { id: string; kind: string; surface: Surface; title: string; prompt: string }

const FRAME: Record<Surface, string> = {
  web: 'The frame is one desktop page, 1440 px wide, its height following its content.',
  dashboard: 'The frame is one desktop application screen, 1440 px wide and about 900 px high.',
  mobile:
    'The frame is a board 1360 px wide showing the three phone screens side by side, each exactly 390 px wide and at least 844 px high.'
}

const IMAGES =
  'No stock photo provider is connected. For a photograph write <img data-photo="what it shows, concretely" alt="…"> with no src and give it a size; it is filled in later. Never link an image URL.'

/** The plain condition: what a model draws when nobody directs it. The pole to move away from. */
export const PLAIN_SYSTEM = 'You are a helpful assistant that writes web pages.'
export function plainPrompt(brief: Brief): string {
  return `${brief.prompt}\n\n${FRAME[brief.surface]} ${IMAGES}\nReturn one complete HTML file in a single \`\`\`html block and nothing else.`
}

/** The baseline: Kalka's agent as it is today, with nobody to answer its questions. */
export const BASELINE_SYSTEM = `You are Kalka's design agent. Kalka is a design editor whose canvas is real HTML and CSS.

${DESIGN_GUIDE}

# Anti-slop catalogue

${ANTI_SLOP}

# This session

Nobody is available to answer ask_user: decide, and keep your assumptions to yourself. Follow the process above in your head (understand, references, direction, system, skeleton, sections, check), then make the single write_html call that draws the whole first draft. Reply with exactly the HTML you pass to write_html, in one \`\`\`html block and nothing else: a complete document with one <style> block holding the variables and the classes, then the semantic HTML. Web fonts may be loaded with a Google Fonts <link>. No JavaScript.`
export function baselinePrompt(brief: Brief): string {
  return `${brief.prompt}\n\n${FRAME[brief.surface]} ${IMAGES}`
}
export function baselineReviewPrompt(brief: Brief, html: string, files: string[]): string {
  return `You drew this first draft for the brief below. You have now called get_screenshot: read the image file${files.length > 1 ? 's' : ''} ${files.join(' and ')} in the current folder. Do step 7 of the process (fits its frame, spacing follows the scale, hierarchy reads in one glance, contrast, edges align, real content, no sign from the anti-slop catalogue that the direction did not choose), fix what fails, and reply with the complete corrected document in one \`\`\`html block and nothing else.

Brief: ${brief.prompt}
${FRAME[brief.surface]}

Your draft:
\`\`\`html
${html}
\`\`\``
}

export const DIRECTION_SYSTEM = `You are the art director in Kalka's design agent. Before anything is drawn you commit to a design genome: one option on each independent axis, chosen by reasoning from the subject and its audience. You never pick at random and never pick what would suit any product equally well.

How to reason, axis by axis: say what is true of THIS subject (what the reader comes to do, what the subject looks like in the real world, where its colours and letters already exist, how much the reader must take in), then take the option that follows. If your reason would fit a different product just as well, it is not a reason.

A page drawn with no direction comes out as the average of every page: a centred hero with two buttons, three identical cards, a soft rounded panel on a pale ground. Three candidates that are all that page in different colours are a failure. Each candidate must be a different reading of the same subject.

Reply with one \`\`\`json block and nothing else.`

export function directionPrompt(brief: Brief, refusals?: string, free = false): string {
  return `Brief: ${brief.prompt}
${FRAME[brief.surface]}

The axes and their options:

${menu(brief.surface)}

Return:
{
  "reading": "two sentences: who comes to this page, to do what, and what in the subject's own world it should feel like",
  "references": [{"name": "a reference from the subject's own world, not a website trend", "take": "the principle you take from it"}],   // two or three
  "candidates": [   // exactly three
    {
      "name": "three or four words naming this direction",
      "structure": "…", "pairing": "…", "ratio": "…", "treatment": "…", "palette": "…", "rhythm": "…", "shape": "…", "imagery": "…", "motion": "…",
      "signature": {"kind": "…", "detail": "the specific detail, written from the facts of this brief, and where it appears"},
      "why": {"structure": "…", "type": "…", "colour": "…", "rhythm": "…", "shape": "…", "imagery": "…", "signature": "…"}   // one short sentence each, about this subject
    }
  ]
}

Rules the resolver checks:
- every id is one of the options above, spelled exactly;
- no candidate contains a refused combination;
- any two candidates differ on at least five axes, and always on structure, palette and pairing.${free ? INVENT : ''}${refusals ? `\n\nYour previous answer was refused by the resolver:\n${refusals}\nAnswer again in full.` : ''}`
}

/** The free arm: the menu is a floor, not a ceiling. */
const INVENT = `

The menu is a floor, not a ceiling. Where no option fits this subject, invent one: add "invent" to the candidate and write "new" as the id of each axis you invent. Invent only what the brief justifies (say why in "why"); an invented option must pass the same checks as the menu (contrast, the refused combinations, no generated default) or the resolver refuses it. In at least one candidate, invent at least one option.
  "invent": {
    "palette": {"strategy": "one of the six strategies", "world": "where these colours exist in the subject's world", "colors": {"ground": "#…", "surface": "#…", "ink": "#…", "muted": "#…", "line": "#…", "accent": "#…", "on-accent": "#…", "tint": "#…", "support": "#…", "on-support": "#…"}},   // ink on ground, surface and tint at least 7:1; muted at least 4.5:1; on-accent and on-support at least 4.5:1
    "pairing": {"display": "family name", "text": "family name", "googleDisplay": "Family+Name:wght@400;700", "googleText": "Family+Name:wght@400;500;600", "serifDisplay": false, "genre": "grotesque | condensed | book-serif | display-serif | geometric", "displayWeights": [400, 700]},   // open-licence Google Fonts families only
    "ratio": {"value": 1.3},
    "treatment": {"displayBoost": 1.5, "weight": "min | mid | max", "tracking": -0.02, "leading": 1.0, "caps": false},
    "structure": {"use": "what this composition is for", "rules": ["where things go, as rules", "…", "…"], "recipe": "the Tailwind layout classes that realise it", "avoid": ["…"]},
    "rhythm": {"grid": 4, "steps": [1, 2, 3, 4, 6, 8, 12, 16, 24], "section": [16, 24]},   // steps are multiples of 4 px
    "shape": {"radius": {"sm": 0, "md": 0, "lg": 0}, "separation": "rules | surfaces | borders", "shadow": {}},
    "imagery": {"images": true, "grayscale": false, "rule": "how images are used on this page"}
  }   // include only the axes you invent`

export const BUILD_SYSTEM = `You are Kalka's design agent, building a first draft inside a genome that has already been chosen. The genome is enforced by the tools: a class that names a value outside it is snapped to the nearest value it has or refused, and you are told. So write only what the vocabulary below contains, and put your effort where it shows: the composition the structure rules ask for, the hierarchy, and the words.

Words: use the facts of the brief, exactly. Never invent a testimonial, a customer name, a logo, a statistic, a team member, a press quote or an award. Where a section would need a fact you do not have, leave the section out. Write as the business would speak to its own customer: plain, specific, short. Buttons say what happens ("Book a table", "Install the GitHub app").

Craft:
- h1 once, then h2 and h3 in order; header, nav, main, section, footer, table, ul as the content asks.
- One clear focal point per screen; two or three levels of importance, not six.
- Text lines of 45 to 75 characters (max-w-[60ch] and the like).
- Tight inside a group, generous between groups, using only the rhythm steps.
- Every section follows the structure rules, and no two consecutive sections have the same internal layout.
- The signature detail appears, built from the vocabulary, in the one or two places named.

Reply with one \`\`\`html block and nothing else: the sections only (no <html>, <head>, <body>, <style> or <script>), using Tailwind utility classes restricted to the vocabulary.`

/**
 * Added for the second build prompt. The first prompt produced clean pages that a blind judge
 * found flat: no product on the first screen, equal weights, empty columns, small text.
 */
export const FIRST_SCREEN = `What makes the first screen land (all of it inside the genome):
- A hero device. The first screen shows the product or the subject itself, drawn with the vocabulary: a real table of the brief's data, an open ticket, this week's menu, a screen of the app built from divs. Show it; do not describe it. A photograph plate is not a hero device: put no <img> in the first screen unless the imagery rule is full-bleed or strips.
- One thing dominant. The most important fact of the brief is clearly the largest element (text-display or text-h1) and sits on a fill or carries the accent. Never give four numbers the same weight; never make the action smaller than a label.
- Use the width. No empty column and no empty half: if the structure has an index or margin column, it carries real content (a fact, a number, the action).
- Weight. At least two sections sit on a fill (surface, tint, ink, accent or support) so the page is not only text and hairlines; in a rules-only shape, use one ink band.
- Readable sizes. Running text is text-body or text-lead. text-small and text-label are for captions, table cells and labels only.
- The customer's language. A bistro in Nantes writes in French, a counter in Manchester in English; keep the brief's own names and figures exactly.`

const CONTAINER: Record<Surface, string> = {
  web: 'Top level: <header>, <main> with its <section>s, <footer>. Each spans the full width; the content sits in a container (max-w-7xl mx-auto px-8).',
  dashboard:
    'Top level: one element that is the whole application screen (min-h-screen), laid out as the structure rules say. Fill it with realistic working data from the brief.',
  mobile:
    'Top level: exactly three <section data-screen="name"> elements, one per phone screen, and nothing else; the board places them side by side at 390 px each. Each is a flex column (the board sets that); use mt-auto to pin a tab bar or a sheet to the bottom.'
}

export function buildPrompt(brief: Brief, system: System, reading: string, references: string, why: string): string {
  return `Brief: ${brief.prompt}
${FRAME[brief.surface]}

Reading: ${reading}
References (principles, never copies): ${references}
Why this genome: ${why}

${CONTAINER[brief.surface]}

THE GENOME — this is everything that exists:

${vocabulary(system)}`
}

export function describeFindings(findings: Finding[]): string {
  return findings.map((finding) => `- ${finding.rule}${finding.count > 1 ? ` ×${finding.count}` : ''}: ${finding.note}`).join('\n')
}

export function refinePrompt(brief: Brief, system: System, html: string, files: string[], report: string): string {
  return `This is the draft that was kept for the brief below. Read the screenshot file${files.length > 1 ? 's' : ''} ${files.join(' and ')} in the current folder (the first screen and the whole page) and look at them as the person who will receive this page.

Then make one refinement pass. Fix, in this order: anything clipped, overflowing, collapsed or left empty; anything the tools reported below; hierarchy that does not read in one glance; consecutive sections that look alike; lines that are too long or too short; copy that sounds like a template. Do not change the genome, and do not add sections that need facts the brief does not give. If something already works, leave it exactly as it is.

What the tools measured on this draft:
${report || '- nothing to report'}

Brief: ${brief.prompt}
${FRAME[brief.surface]}

${CONTAINER[brief.surface]}

THE GENOME:

${vocabulary(system)}

The draft:
\`\`\`html
${html}
\`\`\`

Reply with the complete refined sections in one \`\`\`html block and nothing else.`
}

export const JUDGE_SYSTEM =
  'You are an experienced product designer reviewing first drafts. You judge craft and specificity, not novelty for its own sake. Reply with one ```json block and nothing else.'
export function judgePrompt(brief: Brief, files: string[]): string {
  return `Brief: ${brief.prompt}

Read these screenshot files in the current folder, each the first screen of a different draft: ${files.join(', ')}.

For each, give a score from 0 to 100 for how good a first draft it is for this brief (clear hierarchy, considered typography and spacing, fits the subject, does not look machine-made), and one sentence on its main weakness.

Return {"drafts": [{"file": "…", "score": 0, "weakness": "…"}]} with one entry per file, in the order given.`
}
