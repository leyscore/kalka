import type {
  DynamicToolUIPart,
  ReasoningUIPart,
  TextUIPart,
  ToolUIPart,
  UIDataTypes,
  UIMessagePart,
  UITools
} from 'ai'

/**
 * The AI SDK's message-part guards, as it defines them. Saved conversations are read and settled
 * on the home screen, before any chat runs; importing the guards from `ai` would load the SDK's
 * runtime, its schema library and gateway with the app, for one comparison each.
 */
type Part<TOOLS extends UITools = UITools> = UIMessagePart<UIDataTypes, TOOLS>

export function isTextUIPart(part: Part): part is TextUIPart {
  return part.type === 'text'
}

export function isReasoningUIPart(part: Part): part is ReasoningUIPart {
  return part.type === 'reasoning'
}

export function isToolUIPart<TOOLS extends UITools>(
  part: Part<TOOLS>
): part is ToolUIPart<TOOLS> | DynamicToolUIPart {
  return part.type.startsWith('tool-') || part.type === 'dynamic-tool'
}
