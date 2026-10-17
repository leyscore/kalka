import {
  inputRequired,
  inputResponse,
  type ElicitRequestFormParams,
  type InputRequiredResult,
  type ServerContext
} from '@modelcontextprotocol/server'

/** The first revision whose forms take titled options (`oneOf` of `const` and `title`). */
const TITLED_OPTIONS_REVISION = '2025-11-25'

export interface ChoiceOption<T extends string> {
  value: T
  title: string
}

/**
 * One decision only the user can make, asked as a form with a single required field. `key` names
 * both the request among the call's input requests and the form's field.
 */
export interface Choice<T extends string> {
  key: string
  message: string
  title: string
  options: readonly ChoiceOption<T>[]
}

/** What the user did with a form: picked an option, or declined or dismissed it. */
export type ChoiceAnswer<T extends string> =
  | { picked: true; value: T }
  | { picked: false; action: 'decline' | 'cancel' }

type RequestedSchema = ElicitRequestFormParams['requestedSchema']

function choiceSchema<T extends string>(
  choice: Choice<T>,
  revision: string | undefined
): RequestedSchema {
  const titled = revision === undefined || revision >= TITLED_OPTIONS_REVISION
  const property = titled
    ? {
        type: 'string' as const,
        title: choice.title,
        oneOf: choice.options.map((option) => ({ const: option.value, title: option.title }))
      }
    : {
        type: 'string' as const,
        title: choice.title,
        enum: choice.options.map((option) => option.value),
        enumNames: choice.options.map((option) => option.title)
      }
  return { type: 'object', properties: { [choice.key]: property }, required: [choice.key] }
}

/**
 * Asks the user through the client. The SDK sends the form and calls the tool again with the
 * answer: as an `input_required` result to clients on the 2026-07-28 revision, and as an
 * `elicitation/create` request to earlier ones, so a handler must not change anything before it
 * asks.
 */
export function askChoice<T extends string>(
  choice: Choice<T>,
  revision: string | undefined
): InputRequiredResult {
  return inputRequired({
    inputRequests: {
      [choice.key]: inputRequired.elicit({
        message: choice.message,
        requestedSchema: choiceSchema(choice, revision)
      })
    }
  })
}

/**
 * The user's answer the repeated call carries, or null when the call has not asked yet. An answer
 * that is not one of the options counts as dismissing the form: it came from the client, so it is
 * checked rather than trusted.
 */
export function choiceAnswer<T extends string>(
  ctx: ServerContext,
  choice: Choice<T>
): ChoiceAnswer<T> | null {
  const response = inputResponse(ctx.mcpReq.inputResponses, choice.key)
  if (response.kind !== 'elicit') return null
  if (response.action !== 'accept') return { picked: false, action: response.action }
  const value = response.content?.[choice.key]
  const option = choice.options.find((candidate) => candidate.value === value)
  return option ? { picked: true, value: option.value } : { picked: false, action: 'cancel' }
}
