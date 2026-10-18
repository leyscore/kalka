import { exposeAutomationRequests } from '@/app/browser-bridge'

type HandleRequest = Parameters<typeof exposeAutomationRequests>[0]

let handler: Promise<HandleRequest> | null = null

/** The bridge's handler, whose tool code loads with the first request. */
function loadHandler(): Promise<HandleRequest> {
  handler ??= Promise.all([import('./figma-factory'), import('./handlers')]).then(
    ([{ makeFigmaFromStore }, { createAutomationCommandHandlers }]) =>
      createAutomationCommandHandlers(makeFigmaFromStore).handleRequest
  )
  return handler
}

/** Lets browser tests send MCP requests through the same handler the bridge uses. */
export function exposeAutomationTestRequests() {
  exposeAutomationRequests(async (store, command, args) =>
    (await loadHandler())(store, command, args)
  )
}
