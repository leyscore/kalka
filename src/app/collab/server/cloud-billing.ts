import * as v from 'valibot'

/**
 * A Kalka Cloud workspace's plan and billing, read and changed from the app the Cloud serves.
 * The Cloud takes its own session cookie with the app's header, as when the app signs in; Stripe
 * Checkout and the billing portal open at addresses it returns.
 */

const CLOUD_WORKSPACE = /^(https?:\/\/[^/]+)\/w\/([a-z0-9]{16})\/?$/

/** The Cloud and workspace a server address names, or null for a self-hosted server. */
export function cloudWorkspaceOf(serverURL: string): { origin: string; id: string } | null {
  const match = CLOUD_WORKSPACE.exec(serverURL)
  return match?.[1] && match[2] ? { origin: match[1], id: match[2] } : null
}

const planSchema = v.picklist(['free', 'pro', 'team'])
const intervalSchema = v.picklist(['month', 'year'])
export type CloudPlan = v.InferOutput<typeof planSchema>
export type CloudInterval = v.InferOutput<typeof intervalSchema>
export type PaidCloudPlan = Exclude<CloudPlan, 'free'>

const workspaceSchema = v.object({
  id: v.string(),
  name: v.string(),
  role: v.string(),
  plan: planSchema,
  status: v.string(),
  usage: v.object({
    editors: v.number(),
    editorLimit: v.nullable(v.number()),
    documents: v.number(),
    storageBytes: v.number(),
    storageLimit: v.number(),
    limits: v.object({ documents: v.nullable(v.number()), historyDays: v.number() })
  }),
  billing: v.optional(
    v.object({
      ready: v.boolean(),
      subscribed: v.boolean(),
      plan: v.nullable(v.string()),
      interval: v.nullable(v.string()),
      status: v.nullable(v.string()),
      quantity: v.nullable(v.number()),
      periodEnd: v.nullable(v.number()),
      cancelAtPeriodEnd: v.boolean(),
      graceUntil: v.nullable(v.number()),
      compPlan: v.nullable(v.string()),
      compUntil: v.nullable(v.number())
    })
  )
})
export type CloudWorkspaceBilling = v.InferOutput<typeof workspaceSchema>

const plansSchema = v.object({
  prices: v.object({
    pro: v.object({ month: v.number(), year: v.number() }),
    team: v.object({ month: v.number(), year: v.number() })
  }),
  tax: v.boolean()
})
export type CloudPrices = v.InferOutput<typeof plansSchema>

const urlSchema = v.object({ url: v.string() })
const errorSchema = v.object({ error: v.string() })

async function cloudRequest<S extends v.GenericSchema>(
  url: string,
  schema: S,
  init: { method?: string; body?: unknown } = {}
): Promise<v.InferOutput<S>> {
  const response = await fetch(url, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Kalka-App': '1' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  })
  const text = await response.text()
  if (!response.ok) {
    const problem = v.safeParse(v.pipe(v.string(), v.parseJson(), errorSchema), text)
    throw new Error(problem.success ? problem.output.error : `HTTP ${response.status}`)
  }
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), schema), text)
  if (!parsed.success) throw new Error('Kalka Cloud answered something unexpected.')
  return parsed.output
}

export const cloudBilling = {
  workspace: (origin: string, id: string) =>
    cloudRequest(`${origin}/api/cloud/workspaces/${id}`, workspaceSchema),
  prices: (origin: string) => cloudRequest(`${origin}/api/cloud/plans`, plansSchema),
  checkout: (origin: string, id: string, plan: PaidCloudPlan, interval: CloudInterval) =>
    cloudRequest(`${origin}/api/cloud/workspaces/${id}/checkout`, urlSchema, {
      method: 'POST',
      body: { plan, interval }
    }),
  portal: (origin: string, id: string) =>
    cloudRequest(`${origin}/api/cloud/workspaces/${id}/portal`, urlSchema, {
      method: 'POST',
      body: {}
    })
}
