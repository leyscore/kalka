/** Where people download Kalka, named in the messages agents relay to them. */
export const KALKA_DOWNLOAD_URL = 'https://github.com/leyscore/kalka/releases'

const OPEN_KALKA =
  'Ask the user to open the Kalka desktop app (Applications or Spotlight on macOS, the Start menu on Windows, the Kalka AppImage on Linux; ' +
  `download it from ${KALKA_DOWNLOAD_URL} if it is not installed) and to open or create a document. ` +
  'Once they confirm, call the tool again: this server connects to the app by itself, without restarting the MCP client. ' +
  'Do NOT start the app yourself, and do not retry before the user answers.'

/**
 * A tool call reached no running app: Kalka is closed. Every app-backed tool answers with this
 * until the app comes up, so the agent stops and asks the user instead of failing over and over.
 */
export const APP_NOT_RUNNING_MESSAGE = `Kalka app is not connected: the Kalka desktop app is not running. STOP. ${OPEN_KALKA}`

/** The server is up but no app window registered with it in time. */
export const APP_NOT_CONNECTED_MESSAGE =
  'Kalka app is not connected: the MCP server is running, but no Kalka window is attached to it ' +
  `(the app may be closed or still starting, no document is open, or it uses a different MCP server). STOP. ${OPEN_KALKA}`
