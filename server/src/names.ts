/**
 * Durable Object names. A server holds one tenant unless a host that wraps it (such as a hosted
 * service with many workspaces) sets KALKA_TENANT per request; each tenant then has its own
 * directory and rooms, and nothing one tenant does reaches another's objects.
 */
export function directoryName(tenant: string | undefined): string {
  return tenant ? `${tenant}:directory` : 'directory'
}

export function roomName(tenant: string | undefined, documentId: string): string {
  return tenant ? `${tenant}:${documentId}` : documentId
}
