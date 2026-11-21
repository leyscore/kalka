// Writes dist/config.capnp: the same Worker and Durable Objects as on Cloudflare, for the
// open-source workerd runtime (Docker). Durable Objects keep their SQLite files in DATA_DIR.
import { readFile, writeFile } from 'node:fs/promises'

const dataDir = process.env.KALKA_DATA_DIR ?? '/data'
const port = process.env.KALKA_PORT ?? '8787'

/** Every setting the server reads, passed through from the container's environment. */
export const SETTINGS = [
  'KALKA_SETUP_CODE', 'KALKA_SERVER_NAME', 'KALKA_PUBLIC_URL', 'KALKA_APP_ORIGINS', 'KALKA_LOCAL_LOGIN',
  'KALKA_TRUSTED_PROXIES',
  'KALKA_LICENSE_KEY',
  'KALKA_SMTP_HOST', 'KALKA_SMTP_PORT', 'KALKA_SMTP_SECURE', 'KALKA_SMTP_USER', 'KALKA_SMTP_PASSWORD', 'KALKA_SMTP_FROM',
  'KALKA_OIDC_ISSUER', 'KALKA_OIDC_CLIENT_ID', 'KALKA_OIDC_CLIENT_SECRET', 'KALKA_OIDC_LABEL', 'KALKA_OIDC_SCOPES',
  'KALKA_OIDC_GROUPS_CLAIM', 'KALKA_OIDC_ADMIN_GROUPS', 'KALKA_OIDC_EDITOR_GROUPS', 'KALKA_OIDC_VIEWER_GROUPS',
  'KALKA_OIDC_ALLOWED_GROUPS', 'KALKA_OIDC_DEFAULT_ROLE', 'KALKA_OIDC_TRUST_EMAIL', 'KALKA_OIDC_TOKEN_AUTH',
  'KALKA_OIDC_LINK_LOCAL_ACCOUNTS'
]

// Settings the bundled enterprise module declares (any KALKA_* name in the bundle) pass through too.
const bundled = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8').catch(() => '')
for (const name of new Set(bundled.match(/KALKA_[A-Z0-9_]+/g) ?? [])) {
  if (!SETTINGS.includes(name) && name !== 'KALKA_TENANT') SETTINGS.push(name)
}

const bindings = SETTINGS.map((name) => `      (name = "${name}", fromEnvironment = "${name}"),`).join('\n')

const config = `using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    (name = "kalka", worker = .kalka),
    (name = "data", disk = (path = "${dataDir}", writable = true)),
    # Single sign-on and SMTP may live on the private network, next to the server.
    (name = "internet", network = (allow = ["public", "private", "local"], tlsOptions = (trustBrowserCas = true))),
  ],
  sockets = [(name = "http", address = "*:${port}", http = (), service = "kalka")],
);

const kalka :Workerd.Worker = (
  modules = [(name = "index.js", esModule = embed "index.js")],
  compatibilityDate = "2026-11-01",
  globalOutbound = "internet",
  bindings = [
      (name = "DIRECTORY", durableObjectNamespace = "Directory"),
      (name = "ROOMS", durableObjectNamespace = "DocumentRoom"),
${bindings}
  ],
  durableObjectNamespaces = [
    (className = "Directory", uniqueKey = "kalka-directory", enableSql = true),
    (className = "DocumentRoom", uniqueKey = "kalka-rooms", enableSql = true),
  ],
  durableObjectStorage = (localDisk = "data"),
);
`
await writeFile(new URL('../dist/config.capnp', import.meta.url), config)
console.log(`[kalka] dist/config.capnp written (data in ${dataDir}, port ${port})`)
