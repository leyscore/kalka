import { params } from '@nanostores/i18n'

import { i18n } from '#vue/i18n/create'

export const automationMessageDefaults = {
  toolAccessDescription:
    'Configure design tools independently for built-in AI and the local MCP server.',
  toolAccessTarget: 'Configure tool access for',
  builtInAI: 'Built-in AI',
  localMCP: 'Local MCP',
  restoreToolDefaults: 'Restore defaults',
  aiToolAccessDescription:
    'Choose tools for direct AI model connections. ACP and Pi agents use MCP access instead.',
  mcpToolAccessDescription:
    'Choose tools advertised by the local server to connected agents and clients.',
  aiToolsNotice:
    'Changes apply to your next message. Tool switches are not a sandbox: enabled script tools can still perform other design operations.',
  mcpFailureNotInstalled: 'MCP automation is not installed',
  mcpFailureNotInstalledHint: params(
    'Install {package} globally with your package manager, then restart Kalka.'
  ),
  mcpFailurePermission: 'Kalka cannot start the MCP server',
  mcpFailurePermissionHint:
    'The system denied the command. Reinstall Kalka with its shell permissions, or start the server manually.',
  mcpFailureExited: 'MCP server stopped during startup',
  mcpFailureExitedHint: 'The process exited before it became ready.',
  mcpFailureTimeout: 'MCP server did not respond in time',
  mcpFailureTimeoutHint: 'It did not become ready within the startup timeout.',
  mcpFailureRejected: 'MCP server rejected the local connection',
  mcpFailureRejectedHint: 'Restart the MCP server to issue a new token.',
  mcpFailureMalformed: 'MCP server returned an unexpected response',
  mcpFailureMalformedHint:
    'The configured version and the running server may not match. Update both and restart Kalka.',
  mcpFailureUnreachable: 'MCP server is not reachable',
  mcpFailureUnreachableHint: params(
    'Nothing is listening at {endpoint}. Check that the address is free, then start the server.'
  ),
  mcpFailureUnknown: 'MCP server could not start',
  mcpFailureUnknownHint: 'Start it again, or check the diagnostic details below.',
  mcpFailureDetails: 'Details',
  mcpFailureCopy: 'Copy details',
  mcpFailureCopied: 'Diagnostic details copied.',
  localServer: 'Local server',
  clientsTitle: 'Connect an agent',
  clientsDescription:
    'Add Kalka to the MCP clients on this computer. Any agent that speaks MCP can then read and edit your designs, next to its other servers such as your docs, tickets or data.',
  clientConnect: 'Connect',
  clientReconnect: 'Reconnect',
  clientConnectedStatus: 'Connected',
  clientNotInstalled: 'Not found on this computer',
  clientDetected: 'Found on this computer',
  clientsMore: params('{count} other clients'),
  clientRestartHint: params('Kalka was added. Restart {client} to load it.'),
  clientInstallExtension: 'Install extension',
  clientExtensionHint: params('{client} opened the Kalka extension. Confirm the install there.'),
  clientFileFallback: params('The {client} command failed, so Kalka edited {file} directly.'),
  clientFailureBridgeMissing: params(
    '{bridge} is not installed. Install @kalka/mcp globally, then connect again.'
  ),
  clientFailureConfigInvalid: params(
    "{client}'s configuration at {file} is not valid {syntax}. Fix it, then connect again."
  ),
  clientFailureConfigUnusable: params(
    "{client}'s configuration at {file} cannot hold Kalka's entry. Fix it, then connect again."
  ),
  clientFailureConfigUnwritable: params(
    "Kalka could not write {client}'s configuration at {file}."
  ),
  clientFailureExtensionMissing: 'This build of Kalka has no extension for that client.',
  clientFailureExtensionFailed: params('{client} could not open the Kalka extension.'),
  clientFailureUnknown: params('Kalka could not be added to {client}.'),
  otherClientTitle: 'Any other MCP client',
  otherClientDescription:
    'Paste this server entry into its configuration. Clients that connect over HTTP use the local server address in Settings › MCP instead.',
  webmcpDescription:
    'Let browser agents use this document directly, without a local MCP server or bearer token. Local server settings do not apply here.',
  browserAccess: 'Browser agent access',
  accessOff: 'Off',
  accessInspect: 'Inspect',
  accessEdit: 'Edit',
  accessOffDescription: 'No tools are exposed to browser agents.',
  accessInspectDescription: 'Agents can inspect the document but cannot change it.',
  accessEditDescription:
    'Agents can also edit existing properties, text, and variable values. Edits are undoable; creating or deleting content, scripts, and file access are excluded.',
  webmcpUnsupported:
    'This browser does not expose WebMCP. Use a supported Chrome version and enable WebMCP testing, then relaunch the browser.',
  webmcpSetup: 'WebMCP setup guide',
  noMatchingTools: 'No tools match your search.',
  serverType: 'Server',
  transportHTTP: 'Remote (URL)',
  transportStdio: 'Local (command)',
  serverCommand: 'Command',
  serverCommandHint:
    'The program and its arguments, such as npx -y @notionhq/notion-mcp-server. Kalka asks you to allow it the first time it runs.',
  localServersDesktopOnly: 'Local servers run in the desktop app.',
  connectionAuthentication: 'Authentication',
  authenticationNone: 'None',
  authenticationBearer: 'Token',
  authenticationOAuth: 'Sign in',
  authenticationEnv: 'Environment',
  environment: 'Environment variables',
  environmentHint:
    "One KEY=value per line, such as an API key. Kept in your system's credential store.",
  environmentInvalid: 'Each line must be KEY=value.',
  oauthSignIn: 'Sign in',
  oauthSignOut: 'Sign out',
  oauthSignedIn: 'Signed in',
  oauthSignedOut: 'Not signed in',
  oauthSigningIn: 'Waiting for the browser…',
  oauthHint:
    "Kalka opens the server's sign-in page in your browser. Tokens are kept in your system's credential store.",
  oauthSaveFirst: 'Save the connection, then sign in.',
  connections: 'MCP connections',
  connectionsDescription:
    'Give the built-in AI and your agents trusted remote tools and services, such as your docs, tickets or data, so designs start from real content.',
  addConnection: 'Add connection',
  addServerConnection: 'Add MCP connection',
  editConnection: 'Edit MCP connection',
  connectionEditorDescription:
    'Connect a remote server by its URL or a local server by its command, with optional authentication.',
  connectionName: 'Connection name',
  connectionNameHint: 'Use a unique name, up to 80 characters. The name kalka is reserved.',
  connectionNameInvalid: 'Choose a unique name of at most 80 characters, other than kalka.',
  serverURLHint:
    'Use HTTPS. HTTP is allowed only for localhost or a loopback address. Do not include credentials in the URL.',
  serverURL: 'MCP server URL',
  enableConnection: 'Use with the AI and agents',
  bearerToken: 'Bearer token',
  bearerTokenPlaceholder: 'Enter bearer token',
  bearerTokenRequired: 'Enter a bearer token before enabling this connection.',
  deleteConnection: 'Delete connection',
  deleteConnectionDescription: 'Delete this MCP connection and remove its saved bearer token?',
  noConnections: 'No external MCP connections configured.',
  description: 'Monitor and restart the local MCP server used by agents and automation.',
  status: 'Status',
  port: 'Port',
  address: 'Address',
  version: 'Version',
  authentication: 'Require authentication',
  authenticationDescription:
    'Protect the localhost MCP endpoint with a bearer token. Disable only on a trusted machine. Restart the server to apply changes.',
  selectionScope: 'Share only the selection',
  selectionScopeDescription:
    'Let MCP clients read only the layers you select, with get_selection, get_node, get_page_tree, get_metadata, get_variable_defs, describe, and export_image, and no other tools. Restart the server to apply changes.',
  rootDirectory: 'MCP root directory',
  rootDirectoryDefault: 'Server default directory',
  chooseRootDirectory: 'Choose folder',
  useDefaultRoot: 'Use default',
  rootDirectoryDescription:
    'File tools are limited to this folder. Restart the MCP server to apply changes.',
  tools: 'Available tools',
  toolsEnabled: params('{enabled} of {total} enabled'),
  enableAllTools: 'Enable all',
  searchTools: 'Search tools',
  readOnlyTools: 'Read-only tools',
  sideEffectTools: 'Tools with side effects',
  toolsRestartNotice:
    'Restart the MCP server, then reconnect stdio clients, to apply tool availability changes.',
  externalRestartNotice:
    'This server is managed by another process. Restart that process to apply changes.',
  restart: 'Restart MCP server',
  externallyManaged: 'Managed externally',
  starting: 'Starting…',
  statusIdle: 'Not initialized',
  statusStarting: 'Starting',
  statusRunning: 'Running',
  statusStopped: 'Stopped',
  statusError: 'Error'
} as const

export const automationMessages = i18n('automation', automationMessageDefaults)
