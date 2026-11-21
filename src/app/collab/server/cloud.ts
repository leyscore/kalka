// Kalka Cloud serves this app at its own address. Opened there, the app asks the Cloud, with the
// session cookie the Cloud set at sign-in, for a one-time code to the person's workspace, and
// signs in to it as a Kalka server: Home then lists the workspace's files, with no console and
// no launch link in between.
import * as v from 'valibot'

import { describeServer, serverAccount, signInWithCode } from './account'
import { refreshServerDocuments } from './documents'

const configSchema = v.object({ url: v.string(), auth: v.record(v.string(), v.boolean()) })

const cloudWorkspaceSchema = v.object({
  id: v.string(),
  name: v.string(),
  personal: v.boolean(),
  role: v.string(),
  plan: v.string()
})
export type CloudWorkspace = v.InferOutput<typeof cloudWorkspaceSchema>

const sessionSchema = v.object({
  server: v.string(),
  code: v.pipe(v.string(), v.regex(/^[a-f0-9]{64}$/)),
  workspace: v.string(),
  workspaces: v.array(cloudWorkspaceSchema)
})

export type CloudJoin =
  | { kind: 'joined'; workspace: string; workspaces: CloudWorkspace[] }
  /** Already signed in to a workspace of this Cloud. */
  | { kind: 'signed-in' }
  /** The Cloud has no session for this browser: its own sign-in comes first. */
  | { kind: 'signed-out' }
  /** This address is not a Kalka Cloud. */
  | { kind: 'not-cloud' }

async function readJSON(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/** Whether the app is served by a Kalka Cloud: its config answers at this origin. */
/** The one request the probe makes, injectable so a test can answer it. */
type ProbeRequest = (url: string, init?: RequestInit) => Promise<Response>

export async function isKalkaCloud(
  origin: string,
  request: ProbeRequest = fetch
): Promise<boolean> {
  try {
    const response = await request(`${origin}/api/cloud/config`, { credentials: 'same-origin' })
    if (!response.ok) return false
    const config = v.safeParse(configSchema, await readJSON(response))
    return config.success && new URL(config.output.url).origin === origin
  } catch {
    return false
  }
}

/**
 * Signs in to a workspace of the Cloud serving this app: `workspace` when given, else the one
 * the Cloud picks (the personal workspace). Leaves an account already on this Cloud as it is.
 */
export async function joinKalkaCloud(origin: string, workspace?: string): Promise<CloudJoin> {
  if (!(await isKalkaCloud(origin))) return { kind: 'not-cloud' }
  const current = serverAccount.value
  if (!workspace && current && new URL(current.url).origin === origin) return { kind: 'signed-in' }
  const response = await fetch(`${origin}/api/cloud/app/session`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Kalka-App': '1' },
    body: JSON.stringify(workspace ? { workspace } : {})
  })
  if (response.status === 401) return { kind: 'signed-out' }
  const session = v.safeParse(sessionSchema, await readJSON(response))
  if (!response.ok || !session.success) throw new Error('Kalka Cloud did not open the workspace.')
  const { url, info } = await describeServer(session.output.server)
  await signInWithCode(url, info, session.output.code)
  await refreshServerDocuments()
  return {
    kind: 'joined',
    workspace: session.output.workspace,
    workspaces: session.output.workspaces
  }
}
