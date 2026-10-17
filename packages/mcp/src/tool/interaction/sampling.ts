import {
  inputRequired,
  inputResponse,
  type InputRequiredResult,
  type ServerContext
} from '@modelcontextprotocol/server'

/** The most a tool asks the client's model to write in one request. */
export const MAX_SAMPLING_TOKENS = 2_000

/** One completion a tool asks the client's model for, with nothing but the text it sends. */
export interface ModelRequest {
  key: string
  systemPrompt: string
  prompt: string
  maxTokens: number
}

/**
 * Asks the client's model for a completion. The client shows the request to its user and runs it
 * on the model it chooses; `includeContext: 'none'` keeps the client's conversation out of it, so
 * the model sees only `prompt`. As with a form, the SDK calls the tool again with the answer.
 */
export function askModel(request: ModelRequest): InputRequiredResult {
  return inputRequired({
    inputRequests: {
      [request.key]: inputRequired.createMessage({
        systemPrompt: request.systemPrompt,
        messages: [{ role: 'user', content: { type: 'text', text: request.prompt } }],
        maxTokens: Math.min(request.maxTokens, MAX_SAMPLING_TOKENS),
        includeContext: 'none',
        temperature: 0.2,
        // A small fast model does: the work is short and structured.
        modelPreferences: { costPriority: 0.7, speedPriority: 0.8, intelligencePriority: 0.3 }
      })
    }
  })
}

/** The text the client's model answered with in the repeated call, or null before asking. */
export function modelAnswer(ctx: ServerContext, key: string): string | null {
  const response = inputResponse(ctx.mcpReq.inputResponses, key)
  if (response.kind !== 'sampling') return null
  const blocks = Array.isArray(response.result.content)
    ? response.result.content
    : [response.result.content]
  return blocks.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('\n')
}
