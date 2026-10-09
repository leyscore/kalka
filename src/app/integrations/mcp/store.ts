import { isEqual } from 'es-toolkit'
import * as v from 'valibot'
import { computed, ref, toRaw, watch } from 'vue'

import { appCredentialServices } from '@/app/settings/credentials/app'
import { credentialRef } from '@/app/settings/credentials/reference'
import type { CredentialRef, CredentialStatus } from '@/app/settings/credentials/types'

import { formatCommandLine, parseCommandLine } from './command-line'
import { readMCPConnectionSettingsStorage, writeMCPConnectionSettingsStorage } from './storage'
import type {
  MCPAuthentication,
  MCPAuthenticationType,
  MCPConnection,
  MCPConnectionDraft,
  MCPConnectionID,
  MCPConnectionSettings,
  MCPTransport,
  MCPTransportType
} from './types'

export const MCP_CONNECTION_NAME_MAX_LENGTH = 80
const MAX_URL_LENGTH = 2048
const MAX_COMMAND_LENGTH = 4096
const MCP_CONNECTION_ID_PATTERN = /^mcp-[a-z0-9._-]{1,60}$/

const storedAuthenticationSchema = v.object({
  type: v.picklist(['bearer', 'oauth', 'env']),
  credentialRef: v.object({ integrationId: v.string(), profileId: v.string(), field: v.string() })
})

/** Each secret kind has its own credential, so switching kinds never reads another's value. */
const CREDENTIAL_FIELDS = { bearer: 'bearer-token', oauth: 'oauth', env: 'env' } as const
type MCPSecretType = keyof typeof CREDENTIAL_FIELDS

export function mcpCredentialRef(id: MCPConnectionID, type: MCPSecretType): CredentialRef {
  return credentialRef('mcp', CREDENTIAL_FIELDS[type], id)
}

/** The secret kinds each transport can use; a stdio server takes its secrets as environment. */
const AUTHENTICATION_BY_TRANSPORT: Record<MCPTransportType, readonly MCPAuthenticationType[]> = {
  'streamable-http': ['none', 'bearer', 'oauth'],
  stdio: ['none', 'env']
}

export function mcpAuthenticationTypes(
  transport: MCPTransportType
): readonly MCPAuthenticationType[] {
  return AUTHENTICATION_BY_TRANSPORT[transport]
}

/** A stored secret counts only when it points at this connection's own credential of its kind. */
function parseAuthentication(
  value: unknown,
  id: MCPConnectionID,
  transport: MCPTransportType
): MCPAuthentication {
  const stored = v.safeParse(storedAuthenticationSchema, value)
  if (!stored.success || !AUTHENTICATION_BY_TRANSPORT[transport].includes(stored.output.type)) {
    return { type: 'none' }
  }
  const type = stored.output.type
  const expected = mcpCredentialRef(id, type)
  return isEqual(stored.output.credentialRef, expected)
    ? { type, credentialRef: expected }
    : { type: 'none' }
}

const transportSchema = v.variant('type', [
  v.object({
    type: v.literal('streamable-http'),
    url: v.pipe(
      v.string(),
      v.trim(),
      v.check((url) => isValidMCPConnectionURL(url))
    )
  }),
  v.object({
    type: v.literal('stdio'),
    command: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(MAX_COMMAND_LENGTH)),
    args: v.fallback(v.array(v.pipe(v.string(), v.maxLength(MAX_COMMAND_LENGTH))), [])
  })
])

const connectionSchema = v.object({
  id: v.pipe(v.string(), v.regex(MCP_CONNECTION_ID_PATTERN)),
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1),
    v.transform((name) => name.slice(0, MCP_CONNECTION_NAME_MAX_LENGTH))
  ),
  enabled: v.fallback(v.boolean(), false),
  transport: transportSchema,
  authentication: v.optional(v.unknown())
})

function parseConnection(value: unknown): MCPConnection | null {
  const parsed = v.safeParse(connectionSchema, value)
  if (!parsed.success) return null
  const { authentication, ...connection } = parsed.output
  const id = connection.id as MCPConnectionID
  return {
    ...connection,
    id,
    authentication: parseAuthentication(authentication, id, connection.transport.type)
  }
}

const settingsSchema = v.object({ version: v.literal(1), connections: v.array(v.unknown()) })

export function parseMCPConnectionSettings(value: unknown): MCPConnectionSettings {
  const settings = v.safeParse(settingsSchema, value)
  if (!settings.success) return { version: 1, connections: [] }
  const connections: MCPConnection[] = []
  const ids = new Set<string>()
  const names = new Set<string>()
  for (const candidate of settings.output.connections) {
    const connection = parseConnection(candidate)
    if (!connection || ids.has(connection.id)) continue
    const normalizedName = connection.name.toLowerCase()
    if (normalizedName === 'open-pencil' || names.has(normalizedName)) continue
    ids.add(connection.id)
    names.add(normalizedName)
    connections.push(connection)
  }
  return { version: 1, connections }
}

function isValidMCPConnectionURL(url: string): boolean {
  try {
    validateMCPConnectionURL(url)
    return true
  } catch {
    return false
  }
}

export function validateMCPConnectionURL(value: string): URL {
  if (!value || value.length > MAX_URL_LENGTH) throw new Error('Enter a valid MCP server URL')
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Enter a valid MCP server URL')
  }
  if (url.username || url.password) throw new Error('MCP server URLs cannot contain credentials')
  const loopback =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]'
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
    throw new Error('MCP servers must use HTTPS, except on loopback addresses')
  }
  return url
}

export const mcpConnectionSettings = ref<MCPConnectionSettings>(
  parseMCPConnectionSettings(readMCPConnectionSettingsStorage())
)

watch(mcpConnectionSettings, (settings) => writeMCPConnectionSettingsStorage(settings), {
  deep: true
})

export const enabledMCPConnections = computed(() =>
  mcpConnectionSettings.value.connections.filter((connection) => connection.enabled)
)

export function mcpConnectionCredentialRef(id: MCPConnectionID): CredentialRef {
  return mcpCredentialRef(id, 'bearer')
}

export function createMCPConnectionDraft(connection?: MCPConnection): MCPConnectionDraft {
  const transport = connection?.transport
  return {
    id: connection?.id ?? null,
    name: connection?.name ?? '',
    transportType: transport?.type ?? 'streamable-http',
    url: transport?.type === 'streamable-http' ? transport.url : '',
    command: transport?.type === 'stdio' ? formatCommandLine(transport) : '',
    enabled: connection?.enabled ?? false,
    authenticationType: connection?.authentication.type ?? 'none'
  }
}

/** The transport a draft describes, or an error naming what is wrong with it. */
export function draftTransport(draft: MCPConnectionDraft): MCPTransport {
  if (draft.transportType === 'streamable-http') {
    return { type: 'streamable-http', url: validateMCPConnectionURL(draft.url.trim()).toString() }
  }
  const commandLine = parseCommandLine(draft.command.trim())
  if (!commandLine || draft.command.length > MAX_COMMAND_LENGTH) {
    throw new Error('Enter the command that starts the server')
  }
  return { type: 'stdio', ...commandLine }
}

export function saveMCPConnectionDraft(draft: MCPConnectionDraft): MCPConnection {
  const name = draft.name.trim()
  if (!name) throw new Error('Connection name is required')
  if (name.length > MCP_CONNECTION_NAME_MAX_LENGTH) throw new Error('Connection name is too long')
  if (name.toLowerCase() === 'open-pencil') throw new Error('The open-pencil name is reserved')
  const duplicateName = mcpConnectionSettings.value.connections.some(
    (connection) =>
      connection.id !== draft.id && connection.name.toLowerCase() === name.toLowerCase()
  )
  if (duplicateName) throw new Error('Connection names must be unique')
  const transport = draftTransport(draft)
  if (draft.id && !MCP_CONNECTION_ID_PATTERN.test(draft.id)) {
    throw new Error('Connection ID is invalid')
  }
  const id = draft.id ?? (`mcp-${crypto.randomUUID()}` as MCPConnectionID)
  const type = AUTHENTICATION_BY_TRANSPORT[transport.type].includes(draft.authenticationType)
    ? draft.authenticationType
    : 'none'
  const authentication: MCPAuthentication =
    type === 'none' ? { type } : { type, credentialRef: mcpCredentialRef(id, type) }
  const connection: MCPConnection = { id, name, enabled: draft.enabled, transport, authentication }
  const index = mcpConnectionSettings.value.connections.findIndex((item) => item.id === id)
  if (index === -1) mcpConnectionSettings.value.connections.push(connection)
  else mcpConnectionSettings.value.connections[index] = connection
  return connection
}

/** Saves or clears the secret a connection's form edits: its bearer token or environment. */
export function setMCPConnectionCredential(
  id: MCPConnectionID,
  value: string,
  type: 'bearer' | 'env' = 'bearer'
): Promise<void> {
  const secret = value.trim()
  const reference = mcpCredentialRef(id, type)
  return secret
    ? appCredentialServices.manager.set(reference, secret)
    : appCredentialServices.manager.clear(reference)
}

export function mcpConnectionCredentialStatus(
  id: MCPConnectionID,
  type: MCPSecretType = 'bearer'
): Promise<CredentialStatus> {
  return appCredentialServices.manager.status(mcpCredentialRef(id, type))
}

export async function removeMCPConnection(id: MCPConnectionID): Promise<void> {
  await Promise.all(
    (Object.keys(CREDENTIAL_FIELDS) as MCPSecretType[]).map((type) =>
      appCredentialServices.manager.clear(mcpCredentialRef(id, type))
    )
  )
  mcpConnectionSettings.value.connections = mcpConnectionSettings.value.connections.filter(
    (connection) => connection.id !== id
  )
}

export function replaceMCPConnectionSettings(settings: MCPConnectionSettings): void {
  mcpConnectionSettings.value = structuredClone(settings)
}

export function mcpConnectionSettingsSnapshot(): MCPConnectionSettings {
  return structuredClone(toRaw(mcpConnectionSettings.value))
}
