# Kalka server

The self-hosted server for [Kalka](https://kalka.design), the design editor whose canvas is real HTML and CSS. It lives in the [`server/`](https://github.com/leyscore/kalka/tree/main/server) folder of the [Kalka repository](https://github.com/leyscore/kalka), next to the app it serves. Your team keeps its files in one place and edits them together in real time, even when the person who shared a file is offline.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/leyscore/kalka/tree/main/server)

[![Docker](https://img.shields.io/badge/Docker-ghcr.io%2Fleyscore%2Fkalka--server-2496ED?logo=docker&logoColor=white)](#run-with-docker)
[![Coolify](https://img.shields.io/badge/Coolify-one%20compose%20file-6B16ED)](#one-click-platforms)
[![Dokploy](https://img.shields.io/badge/Dokploy-template-0F172A)](#one-click-platforms)
[![Railway](https://img.shields.io/badge/Railway-deploy%20from%20repo-0B0D0E?logo=railway&logoColor=white)](#one-click-platforms)
[![Fly.io](https://img.shields.io/badge/Fly.io-fly%20launch-7B3BE2?logo=flydotio&logoColor=white)](#one-click-platforms)

- **Shared files and real-time collaboration.** Each file is a room; Kalka windows edit it together and the server keeps it.
- **A console in Kalka's style.** Files, people, invitations and settings (single sign-on, email, license) in one page, by day or by night.
- **Accounts.** The first administrator, then people you invite by link or email, as administrators, editors or viewers. Password reset, profile, deactivation and deletion.
- **A files folder over WebDAV.** Mount the server's files as `.kalka` archives in Finder, Windows, Nextcloud or rclone, with app passwords.
- **Single sign-on** with OpenID Connect: Authentik, Keycloak, Authelia, Google Workspace, Microsoft Entra ID and any standard provider. Free for up to 5 people (Community); Business is $8 per editor per month, billed yearly.
- **Business features** with a Business license: an audit log, managed backups to S3-compatible storage, and user provisioning with SCIM 2.0 (Okta, Microsoft Entra ID, Authentik).
- **Your data, your way.** Export every file as `.kalka` from the server's page. Configuration through environment variables. No telemetry: the server never calls home.
- **Runs anywhere.** One click on Cloudflare's free plan, or one Docker container. Both run the same code.

## Deploy on Cloudflare

1. Click **Deploy to Cloudflare** above and sign in to Cloudflare (the free plan is enough).
2. Keep or change the names Cloudflare suggests. In **KALKA_SETUP_CODE**, type a code of your own (for example the output of `openssl rand -hex 16`) and keep it.
3. Click **Create and deploy**. Cloudflare copies the `server/` folder into a repository of your own GitHub account, creates the server and gives it an address such as `https://kalka-server.your-name.workers.dev`.
4. Open that address, enter the setup code, and create the first administrator.
5. In Kalka, open **Settings › Server**, enter the address and sign in.

Every push to your copy of the repository redeploys the server. To get updates, sync your copy with this repository on GitHub.

**What the free plan allows.** 100,000 requests a day and 5 GB of storage for the account, and 1 GB per file. A team of about 5 to 10 people working at the same time stays within it. Larger teams can switch the account to Workers Paid (from $5 a month) without changing anything else, or use Docker.

## Run with Docker

```bash
docker run -d --name kalka -p 8787:8787 -v kalka-data:/data \
  -e KALKA_SETUP_CODE=choose-a-code -e KALKA_PUBLIC_URL=https://kalka.example.com \
  ghcr.io/leyscore/kalka-server:latest
```

Or with Docker Compose: copy `.env.example` to `.env`, fill it in, then `docker compose up -d`.

Put the container behind your reverse proxy (Caddy, Traefik, nginx) for HTTPS, and pass WebSocket upgrades through. Everything the server keeps is in `/data`: back up that volume.

**Behind a proxy, set `KALKA_TRUSTED_PROXIES`** to the number of proxies in front of the server (`1` for a single Caddy, Traefik or nginx; `2` for Cloudflare in front of it). Rate limits on sign-in, setup, registration and password reset count per address, and the server takes the client's address from the `X-Forwarded-For` entry the nearest proxy appended. Your proxy must append to that header, as Caddy, Traefik and nginx's `$proxy_add_x_forwarded_for` do. Without the setting, the server trusts no forwarded header: it uses the address that connects to it when that address is public, and when it is private (a proxy on the same network) every client looks alike and only the per-account limits apply. Never set it on a server people reach directly, or anyone could pick their own address.

### One-click platforms

| Platform | How |
| --- | --- |
| Coolify | New resource › Docker Compose, paste `deploy/coolify/kalka.yaml`. Coolify generates the setup code and the domain. |
| Dokploy | Create a Compose service from `deploy/dokploy/docker-compose.yml`, with the variables of `deploy/dokploy/template.toml`. |
| Railway | New project › Deploy from GitHub repo, with `server` as the root directory; `railway.json` builds the image. Add a volume mounted at `/data` and set `KALKA_SETUP_CODE`. |
| Render | New › Blueprint on a fork of this repository, with `server/render.yaml` as the Blueprint file. Render keeps data only on a disk, which needs a paid instance. |
| Fly.io | From `server/`: `fly launch --copy-config`, `fly volumes create kalka_data --size 1`, `fly deploy`. |
| Hostinger VPS and other Docker hosts | Use `docker-compose.yml` in the host's Docker manager. |

## Configuration

Most settings can be changed in the console, under Settings. Each one can also be an environment variable, which then wins and shows as locked in the console: on Cloudflare in the Worker's **Settings › Variables and Secrets**, in Docker with `-e` or the `.env` file.

| Variable | Purpose |
| --- | --- |
| `KALKA_SETUP_CODE` | Code typed once to create the first administrator. Required. |
| `KALKA_SERVER_NAME` | Name people see in Kalka. Default `Kalka`. |
| `KALKA_PUBLIC_URL` | The server's public address, used in invitation, reset and room links. Without it, the server keeps the address it was set up at, or that its first administrator signs in at. |
| `KALKA_APP_ORIGINS` | Web addresses of Kalka editors allowed to sign in through single sign-on, comma-separated. The desktop app and the server's own page are always allowed. |
| `KALKA_LOCAL_LOGIN` | `false` turns off email and password sign-in, once single sign-on works. |
| `KALKA_TRUSTED_PROXIES` | Docker only: how many reverse proxies stand in front of the server, so rate limits see each client's address. See [Run with Docker](#run-with-docker). Ignored on Cloudflare, which gives the address itself. |
| `KALKA_SMTP_HOST`, `KALKA_SMTP_PORT`, `KALKA_SMTP_SECURE`, `KALKA_SMTP_USER`, `KALKA_SMTP_PASSWORD`, `KALKA_SMTP_FROM` | Email for invitations, password resets and seat warnings. `KALKA_SMTP_SECURE` is `starttls` (port 587, the default), `tls` (port 465) or `none`. |
| `KALKA_LICENSE_KEY` | License for single sign-on. See below. |
| `KALKA_OIDC_*` | Single sign-on. See below. |
| `KALKA_AUDIT_RETENTION_DAYS` | Days the audit log keeps events (Business). Default `365`. |
| `KALKA_BACKUP_*` | Managed backups (Business). See [Managed backups](#managed-backups). |

Without email, invitations and password resets are links an administrator copies from the server's page and sends. Cloudflare allows outgoing SMTP on ports 587 and 465.

## Files folder (WebDAV)

The server's files are also one folder at `https://<your server>/dav/`, where each file is its `.kalka` archive. It works with macOS Finder (Go › Connect to Server), Windows (Map network drive), Nextcloud (External storage, WebDAV), rclone (`vendor = other`) and other WebDAV clients. It is part of the free server.

- **Sign in** with your email and an app password. Create app passwords in the console, under your portrait › Your account; each is shown once and can be revoked there. People who sign in with single sign-on use app passwords too.
- **Reading** a file gives the archive Kalka last saved on the server.
- **Saving** a `.kalka` file creates a server file holding that archive, or replaces the archive of an existing one. Since the live document is what Kalka windows edit together, an uploaded archive does not overwrite it: it waits as a new version (shown in the console), which a Kalka client applies or dismisses (`GET` and `DELETE /api/documents/<id>/pending`).
- **Renaming, copying and deleting** work as in any folder. There are no subfolders, and other kinds of file are refused; the files desktops write beside others (`._name`, `.DS_Store`, `Thumbs.db`) are accepted and dropped.
- **Roles apply**: viewers can read and download, editors and administrators can also save, rename and delete.
- Locks are advisory: the server hands out lock tokens so Finder and Office mount the folder read-write.

```bash
rclone config create kalka webdav url https://kalka.example.com/dav/ vendor other user you@example.com pass "$(rclone obscure 'app-password-here')"
rclone copy kalka: ./kalka-backup
```

## Single sign-on

Single sign-on is part of the Kalka enterprise module, which needs a license key: free for up to 5 people, paid per person beyond. Get a key at [kalka.design](https://kalka.design). The key is checked on the server itself; the server never calls Kalka.

**Add the key.**

- Cloudflare: in the Worker, open **Settings › Build › Variables and secrets**, add `KALKA_LICENSE_KEY`, then redeploy (Deployments › Retry, or push to your repository). The build adds the module.
- Docker: build the image with the key as a build secret, `docker build --secret id=kalka_license,env=KALKA_LICENSE_KEY -t kalka-server .`. The build uses it only to download the module, and the image does not contain it, so pass `KALKA_LICENSE_KEY` to the container as well: the server reads it from the environment at run time.
- Deploying from your own machine with `npm run deploy`: set the key in your shell for the build, and add it to the Worker as a secret (`npx wrangler secret put KALKA_LICENSE_KEY`), since only Cloudflare's own builds keep it in the bundle.

**Register Kalka with your identity provider** as a confidential web application, with the redirect URI `https://<your server>/auth/oidc/callback`, then set:

| Variable | Purpose |
| --- | --- |
| `KALKA_OIDC_ISSUER` | Issuer URL; the server reads `/.well-known/openid-configuration` under it. |
| `KALKA_OIDC_CLIENT_ID`, `KALKA_OIDC_CLIENT_SECRET` | The application's credentials. |
| `KALKA_OIDC_LABEL` | Button text, as in “Sign in with Acme SSO”. |
| `KALKA_OIDC_ADMIN_GROUPS`, `KALKA_OIDC_EDITOR_GROUPS`, `KALKA_OIDC_VIEWER_GROUPS` | Groups that make someone an administrator, editor or viewer, comma-separated. Checked at every sign-in. |
| `KALKA_OIDC_ALLOWED_GROUPS` | When set, only members of these groups may sign in. |
| `KALKA_OIDC_DEFAULT_ROLE` | Role for people in none of the groups above. Default `editor`. |
| `KALKA_OIDC_GROUPS_CLAIM` | Claim that lists groups. Default `groups`. |
| `KALKA_OIDC_SCOPES` | Default `openid email profile`; add `groups` where your provider needs it. |
| `KALKA_OIDC_LINK_LOCAL_ACCOUNTS` | `true` lets a single sign-on link to an existing password account, administrators included, with the same verified email. The account then takes its role from the provider's groups, or `KALKA_OIDC_DEFAULT_ROLE`. Off by default, so someone who can choose their email at the provider cannot take over an account; environment only, not in the console. |
| `KALKA_OIDC_TRUST_EMAIL` | `true` treats every email the provider sends as verified. Only for providers where people cannot choose or change their own address: with `KALKA_OIDC_LINK_LOCAL_ACCOUNTS`, it lets the provider's users take over the password accounts that share their address. |
| `KALKA_OIDC_TOKEN_AUTH` | `basic` (default) or `post`, how the server sends its client secret. |

Provider notes:

- **Authentik**: issuer `https://authentik.example.com/application/o/<slug>/`. Groups come in the `groups` claim.
- **Keycloak**: issuer `https://keycloak.example.com/realms/<realm>`. Add a “Group Membership” mapper with full path off to send `groups`.
- **Authelia**: issuer `https://auth.example.com`; add the `groups` scope.
- **Google Workspace**: issuer `https://accounts.google.com`. Google sends no groups: use `KALKA_OIDC_DEFAULT_ROLE`, and make the OAuth app Internal (your organization only) in Google Cloud; an External app lets any Google account sign in.
- **Microsoft Entra ID**: issuer `https://login.microsoftonline.com/<tenant-id>/v2.0` (a tenant ID, not `common`). Turn on the groups claim in Token configuration; Entra sends group object IDs, so list IDs in the `*_GROUPS` variables.

On Cloudflare, the identity provider must be reachable from the internet, or through a Cloudflare Tunnel. In Docker, it can be on your private network.

The license counts editors and administrators who signed in through single sign-on in the last 90 days; viewers are free. When every seat is taken, people who already signed in keep working and new people are refused with a clear message, and a viewer cannot be made an editor or administrator, from the console or by their groups, until a seat is free; administrators get an email at 80 % and 100 % when email is set up.

An existing account links to single sign-on by email only when the identity provider created it through user provisioning, or with `KALKA_OIDC_LINK_LOCAL_ACCOUNTS=true`; otherwise someone whose single sign-on email matches a password account is told to sign in with the password. After the license ends, single sign-on keeps working for 30 more days, then people sign in with passwords again. No data is ever lost.

## Business features

These come with the Kalka enterprise module, like single sign-on, and a Business license key (see [Single sign-on](#single-sign-on) for how to add a key). The module is not in this repository: this server only lends it generic hooks, which it uses for these features: the events every route emits, an hourly scheduled call (the Cron Trigger, and in Docker the directory's alarm), the routes under `/scim/` and `/api/ee/`, and tables of its own (`ee_*`) in the directory. Built without the module, the server answers `404` there and the console shows what each feature does; with the module and a key that lacks a feature, it answers `402`.

### Audit log

The server records sign-ins and failed attempts (password, single sign-on and WebDAV), accounts created, role changes, deactivations and deletions, password resets, invitations, files created, renamed, deleted and exported, settings changes (which settings, never their values) and app passwords, each with who, when, the address and country it came from, and the browser or client.

In the console, open **Server › Audit log** to filter by kind of event, person, text and dates, and export the result as CSV (the newest 10,000 events matching the filters; cells that look like formulas are quoted). Events are kept for a year by default; change it there or with `KALKA_AUDIT_RETENTION_DAYS`. Administrators can also read it through `GET /api/ee/audit` and `GET /api/ee/audit/export`, with the filters `action` (an action or a category such as `auth.`), `actor`, `q`, `from`, `to` (milliseconds) and `before` (for the next page).

### Managed backups

Once a day, the server copies every file's `.kalka` archive and the directory's data (accounts, invitations, the list of files, settings without their secrets, app password hashes and the audit log) to S3-compatible storage you own: Cloudflare R2, Backblaze B2, MinIO, Amazon S3 or any other. Each backup is a folder, `<folder>/<time>/`, holding `directory.json`, `manifest.json` and `documents/<id>.kalka`. Backups older than the number of days you choose are deleted from the bucket.

Set it up in the console under **Server › Backups** (or with the variables below): the endpoint, bucket, keys (the secret key is write-only), folder, time of day and how long to keep backups. **Check the storage** writes, reads and deletes a small file. The page lists every backup; **Back up now** starts one, and opening a backup restores any of its files, as a copy or into the original file (where it waits as a version for Kalka to apply, so the live file is never overwritten). When a backup fails three times, administrators get an email.

How it runs: a backup is a series of short steps driven by the directory's Durable Object alarm, a few files each, so no step runs long on the free plan. On Cloudflare, an hourly Cron Trigger (in `wrangler.jsonc`) starts the daily run when it is due; in Docker, the same alarm wakes the server at the chosen hour. The first backup runs as soon as the storage is saved. Restoring a single file is built in; bringing a whole server back from `directory.json` is a manual job for now.

| Variable | Purpose |
| --- | --- |
| `KALKA_BACKUP_ENDPOINT` | S3 endpoint: `https://<account>.r2.cloudflarestorage.com`, `https://s3.<region>.backblazeb2.com`, `https://s3.<region>.amazonaws.com`, `http://minio:9000`. Requests use path-style addresses. |
| `KALKA_BACKUP_BUCKET` | Bucket name. |
| `KALKA_BACKUP_ACCESS_KEY_ID`, `KALKA_BACKUP_SECRET_ACCESS_KEY` | Keys with read, write, list and delete rights on the bucket. |
| `KALKA_BACKUP_REGION` | Signing region; read from AWS and Backblaze endpoints, `auto` on R2, else `us-east-1`. |
| `KALKA_BACKUP_PREFIX` | Folder in the bucket. Default `kalka-backups`. |
| `KALKA_BACKUP_HOUR` | Hour of the daily backup, UTC. Default `3`. |
| `KALKA_BACKUP_RETENTION_DAYS` | Days backups are kept. Default `30`. |

### User provisioning (SCIM)

Identity providers create, update and deactivate accounts, and push groups, through SCIM 2.0 at `https://<your server>/scim/v2` (`/Users`, `/Groups`, `/ServiceProviderConfig`, `/ResourceTypes`, `/Schemas`). In the console, open **Server › Provisioning** to make the bearer token (shown once; a new one replaces it) and see the groups pushed and the role each gives.

- **Accounts** are created as single sign-on accounts and link to the person's first single sign-on by email. They take a seat only once they sign in. Deactivating one (`active: false`) disables it and signs it out everywhere (its app passwords stop working too); deleting it deletes the account, never its files.
- **Roles come from groups**, with the same settings as single sign-on: a group whose name (or ID, for Entra) is in `KALKA_OIDC_ADMIN_GROUPS`, `KALKA_OIDC_EDITOR_GROUPS` or `KALKA_OIDC_VIEWER_GROUPS` gives that role, the highest one wins, and people in none get `KALKA_OIDC_DEFAULT_ROLE`. The last administrator is never demoted or deactivated.
- **Okta**: add a SCIM 2.0 app (or SCIM to your OIDC app) with the base URL, “HTTP Header” authentication and the token, then turn on Create, Update and Deactivate users, and Push Groups for the role groups.
- **Microsoft Entra ID**: in the enterprise application, Provisioning, Automatic: Tenant URL is the base URL, Secret Token the token. Entra sends group object IDs in single sign-on, so list those IDs in the `*_GROUPS` settings; SCIM groups match by name or ID.
- **Authentik**: create a SCIM provider with the base URL and token and attach it to the application; user names that are not emails work, the email comes from `emails`.
- Every change reaches the audit log, marked as made through SCIM.

## Security

- Passwords are hashed with PBKDF2-SHA256; session, invitation and reset tokens are stored only as hashes.
- Sign-in, registration and password reset are rate limited per account and per address; the setup code is limited to 20 guesses a minute for the whole server. On Docker, addresses come from forwarded headers only with `KALKA_TRUSTED_PROXIES`.
- Disabling, deleting or changing the role of someone closes the files they have open at once: they reconnect with their new role, or not at all.
- A password reset or change signs out every session and revokes the account's app passwords.
- App passwords are random (120 bits) and stored as hashes; WebDAV sign-in failures are rate limited per address.
- Rooms open with a one-time ticket valid for a minute, so session tokens never appear in WebSocket addresses.
- Viewers follow edits live; anything they change stays on their device.
- The SCIM token is stored as a hash and compared in constant time.
- Backups leave out sessions, one-time codes and secret settings; the storage keys are write-only in the console.
- Report vulnerabilities privately through a GitHub security advisory on this repository.

## Development

```bash
npm install
cp .dev.vars.example .dev.vars   # set KALKA_SETUP_CODE
npm run dev                      # wrangler dev on http://localhost:8787
npm test                         # end-to-end tests against the running server
KALKA_EE_PATH=test/fixtures/ee-stub.js npm run dev   # with a stand-in enterprise module, then:
npm run test:sso                 # single sign-on linking, seats, and sign-in binding
KALKA_TRUSTED_PROXIES=1 npm run workerd              # then, against workerd:
npm run test:proxy               # rate limits behind a proxy
npm run workerd                  # the Docker runtime, without Docker
```

The protocol between Kalka and a room is in `src/protocol.ts`; Kalka keeps a copy in `src/app/collab/transport/server-protocol.ts`.

## License

The Kalka server is free software under the [GNU Affero General Public License v3.0](LICENSE). The enterprise module that adds single sign-on and the Business features (audit log, managed backups, SCIM) is proprietary and is not in this repository; the build adds it when a license key is set.
