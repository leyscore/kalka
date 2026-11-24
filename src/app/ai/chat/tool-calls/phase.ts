import * as v from 'valibot'

import { toolName, type ToolCallPart } from '@/app/ai/chat/tool-calls/display'

/** What a run of tool calls is for, as the chat names the agent's steps. */
export type ToolPhase = 'ask' | 'references' | 'style' | 'check' | 'read' | 'build'

const ASK = new Set(['ask_user'])
const REFERENCES = new Set(['find_references', 'pexels', 'unsplash', 'stock_photo'])
const STYLE = new Set([
  'get_design_guide',
  'search_design_system',
  'import_design_tokens',
  'design_to_tokens',
  'create_collection',
  'create_variable',
  'set_variable',
  'bind_variable',
  'add_font',
  'search_fonts',
  'list_available_fonts',
  'edit_css_class',
  'update_css_class'
])
const CHECK = new Set(['get_screenshot', 'export_image', 'lint', 'lint_fix', 'describe'])
const CHECK_PREFIXES = ['analyze_', 'diff_show', 'diff_visual', 'diff_changes']
const READ_PREFIXES = [
  'get_',
  'list_',
  'find_',
  'query_',
  'node_',
  'page_bounds',
  'read_',
  'viewport_'
]
const READ = new Set([
  'calc',
  'path_get',
  'search_icons',
  'search_library_components',
  'fetch_icons'
])
/** Reads whose name starts like a lookup but move or resize a node. */
const NODE_EDITS = new Set(['node_move', 'node_resize', 'node_replace_with', 'node_to_component'])

/** The step a tool belongs to; a tool the chat does not know counts as building. */
export function toolPhase(name: string): ToolPhase {
  if (ASK.has(name)) return 'ask'
  if (REFERENCES.has(name)) return 'references'
  if (STYLE.has(name)) return 'style'
  if (CHECK.has(name) || CHECK_PREFIXES.some((prefix) => name.startsWith(prefix))) return 'check'
  if (NODE_EDITS.has(name)) return 'build'
  if (READ.has(name) || READ_PREFIXES.some((prefix) => name.startsWith(prefix))) return 'read'
  return 'build'
}

/** One step of a run: consecutive calls that serve the same purpose. */
export interface ToolStep {
  phase: ToolPhase
  parts: ToolCallPart[]
}

/** A run of calls cut into its steps, in order. */
export function toolSteps(parts: ToolCallPart[]): ToolStep[] {
  const steps: ToolStep[] = []
  for (const part of parts) {
    const phase = toolPhase(toolName(part))
    const last = steps.at(-1)
    if (last?.phase === phase) last.parts.push(part)
    else steps.push({ phase, parts: [part] })
  }
  return steps
}

/** A section the agent announced, and whether the run has built it. */
export interface PlannedStepSection {
  name: string
  height: number
  done: boolean
}

const PlanInput = v.object({
  sections: v.array(v.object({ name: v.string(), height: v.pipe(v.number(), v.finite()) }))
})
/** Calls that add a part of the page: the shell first, then one section each. */
const SECTION_WRITES = new Set(['write_html', 'render'])

function finished(part: ToolCallPart): boolean {
  return part.state === 'output-available'
}

/**
 * The sections a run announced with `plan_sections`, as its latest plan lists them, each marked
 * built or not. The calls do not say which section they wrote, so this counts the writes that
 * finished after the first plan and sets one aside for the page shell: a section may show as built a
 * call late, never early. Null when the run announced none.
 */
export function plannedSections(parts: readonly ToolCallPart[]): PlannedStepSection[] | null {
  const announces = (part: ToolCallPart) =>
    toolName(part) === 'plan_sections' && v.is(PlanInput, part.input)
  const plan = v.safeParse(PlanInput, parts.findLast(announces)?.input)
  if (!plan.success || plan.output.sections.length === 0) return null
  // A plan changed along the way keeps what was built before the change.
  const writes = parts
    .slice(parts.findIndex(announces) + 1)
    .filter((part) => SECTION_WRITES.has(toolName(part)) && finished(part)).length
  return plan.output.sections.map((section, index) => ({
    name: section.name,
    height: section.height,
    done: index < writes - 1
  }))
}
