import type { useCollaborationMessages } from '@kalka/vue'

import type { ServerProblem } from '@/app/collab/server/problem'

type CollaborationMessages = ReturnType<typeof useCollaborationMessages>['value']

const PROBLEM_MESSAGES = {
  'not-kalka': 'serverNotKalka',
  unreachable: 'serverUnreachable',
  'popup-blocked': 'serverPopupBlocked',
  'wrong-credentials': 'serverWrongCredentials',
  'account-disabled': 'serverAccountDisabled',
  'use-sso': 'serverUseSSO',
  'too-many-attempts': 'serverTooManyAttempts',
  'signed-out': 'serverSessionExpired',
  other: 'serverRequestFailed'
} as const satisfies Record<ServerProblem, keyof CollaborationMessages>

/** A server problem in the person's language. */
export function serverProblemText(messages: CollaborationMessages, problem: ServerProblem): string {
  return messages[PROBLEM_MESSAGES[problem]]
}
