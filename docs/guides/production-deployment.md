# Production deployment runbook

This page is for operators deploying the Opsta AI Gateway to the production environment
(`opsta.co.th`). It covers the one-time setup checklist, the release flow, and first-deploy
onboarding (which is automatic as of v1.1.0 — no manual REST bootstrap).

## Release flow overview

```
dev branch  →  merge to main  →  tag vX.Y.Z  →  production deploy workflow
```

1. **Develop on `dev`** — every push to the `dev` branch runs the full test gate
   (lint, license-check, security scan, unit, chart render) and, when green, builds and
   pushes container images to GHCR as `:dev` tags. No cluster action on the CI side.

2. **Merge to `main`** — the `promote-uat` workflow runs automatically: it uses
   `crane copy` to retag every built image from `:dev` to `:uat` on GHCR. No rebuild;
   the same digest is promoted. UAT exists as a promotion lane only (no UAT cluster).

3. **Cut a release tag** — tag `vX.Y.Z` on `main`. The `release` workflow runs:
   - `crane copy` retags every built image from `:uat` to `:vX.Y.Z` on GHCR (no
     rebuild — the binary that ships is bit-for-bit what was tested).
   - AI plugins are mirrored (idempotently) to `ghcr.io/opsta/ai-gateway-plugins`.
   - The Helm chart is packaged at version `X.Y.Z` and published as an OCI chart to
     `oci://ghcr.io/opsta/charts`.

4. **Run the production deploy workflow** — in the GitHub Actions UI, navigate to
   **Actions → production deploy → Run workflow**. Enter the version (e.g. `v1.0.0`).
   The job is gated by the `production` GitHub Environment, which requires reviewer
   approval before the job starts. Once approved, it runs on the self-hosted host
   runner and calls `task prod:deploy`, which resolves to:
   ```
   helmfile -e prod --selector name=opsta-ai-gateway sync
   ```
   The production chart is the published OCI chart pinned to the specified version.
   On pod start, the control-plane automatically runs forward-only database migrations.

## One-time prod prep checklist

Complete all of these steps once before running `task prod:up` for the first time.
Some require out-of-repo manual actions.

### 1. Cloudflare tunnel + DNS

- Create a Cloudflare tunnel for prod (separate from dev — distinct token and hostnames).
- Add four public hostnames on the tunnel, all pointing at
  `https://higress-gateway.higress-system.svc.cluster.local:443`:

  | Hostname | Origin server name |
  |---|---|
  | `api-ai-gateway.opsta.co.th` | `api-ai-gateway.opsta.co.th` |
  | `grafana-ai-gateway.opsta.co.th` | `grafana-ai-gateway.opsta.co.th` |
  | `console-ai-gateway.opsta.co.th` | `console-ai-gateway.opsta.co.th` |
  | `auth-ai-gateway.opsta.co.th` | `auth-ai-gateway.opsta.co.th` |

  Set **No TLS Verify: OFF** on each (the origin presents a valid LE cert).

- Confirm the `opsta.co.th` DNS zone is managed in Cloudflare (adding a public hostname
  auto-creates its DNS record).
- Create a **Cloudflare DNS API token** scoped to `Zone:DNS:Edit` for the `opsta.co.th`
  zone. This token is needed by cert-manager for ACME DNS-01 challenge. Capture it now
  (you'll paste it into `secrets-values-prod.yaml` under
  `secrets.values.cloudflareApiToken` in the gen-secrets step, step 5).
- Capture the tunnel token too (you'll paste it into `secrets-values-prod.yaml` under
  `secrets.values.cloudflareTunnelToken` in the gen-secrets step, step 5).

### 2. Google OAuth client (prod)

- Create a Google OAuth 2.0 client for prod in Google Cloud Console.
- Add the following authorized redirect URIs (substitute the exact hostnames above):
  - `https://auth-ai-gateway.opsta.co.th/realms/opsta/broker/google/endpoint`
  - `https://console-ai-gateway.opsta.co.th/oauth2/callback`
  - `https://grafana-ai-gateway.opsta.co.th/login/generic_oauth`
- Capture the client ID and client secret (you'll paste them into
  `secrets-values-prod.yaml` under `secrets.values.googleOidc.clientId` and
  `secrets.values.googleOidc.clientSecret` in the gen-secrets step, step 5).
- Choose the platform-admin Google Group (whose members get admin access to the console).
  Set `console.adminGroups` in `charts/opsta-ai-gateway/values-prod.yaml` to that group
  name.

  > Note: confirm that Google Workspace group claims actually appear in the OIDC token
  > (requires a group-claim mapper or the Google Directory API). This is a prerequisite
  > for the `adminGroups` check to function.

### 3. GHCR credentials

Prod pulls private container images from GHCR. Create a GitHub personal access token
(or fine-grained token) with `read:packages` scope, then export it in the shell you will
run `task prod:up` from:

```bash
export GHCR_USER=<github-username>
export GHCR_TOKEN=<pat>
```

`task prod:up` creates the `ghcr-pull` imagePullSecret in every prod namespace
**automatically** (after the cluster and namespaces exist) — it reads `GHCR_USER` /
`GHCR_TOKEN` from the environment, so make sure both are exported when you run it. Do
**not** run `task prod:pull-secret` standalone here: it targets cluster namespaces that
do not exist yet. (To refresh the secret after a token rotation on an already-running
cluster, see Ongoing operations below.)

### 4. GitHub Environment + runner

- In the GitHub repo, go to **Settings → Environments → New environment**, name it
  `production`, and add required reviewers (yourself + at least one other approver).
- Ensure the host self-hosted runner (`[self-hosted, docker, local]`) has:
  - docker + k3d + helm + helmfile installed (same machine as dev).
  - A prod kubeconfig reachable at `~/.kube/config` or via `k3d kubeconfig write
    opsta-ai-gateway-prod` (the Taskfile `prod:deploy` target handles this).
  - The git-ignored `charts/opsta-ai-gateway/secrets-values-prod.yaml` already on
    disk in the repo checkout directory (never committed — provisioned once below).

### 5. Generate component passwords

Run the secrets generator **once**. It fills every `GENERATE` placeholder with a strong
random password and derives the LGTM bcrypt hash automatically:

```bash
scripts/gen-secrets.sh prod
```

The resulting `charts/opsta-ai-gateway/secrets-values-prod.yaml` is git-ignored. Paste
in the four external `REPLACE` values (Cloudflare tokens, Google OAuth creds) by hand.

> **Back up this file securely off-host.** It is the durable source of all component
> passwords. Losing it with persistent volume data intact would orphan the stateful
> databases (Postgres, Redis, Keycloak), because the passwords in `secrets-values-prod.yaml`
> must match those already written to the PVC data.

### 6. Create the prod cluster + first install

Make sure `GHCR_USER` / `GHCR_TOKEN` (from step 3) are exported in this shell — `task
prod:up` consumes them to create the `ghcr-pull` imagePullSecret automatically.

```bash
PRODUCT_VERSION=v1.0.0 task prod:up
```

This is a one-time operation. It:
1. Renders the prod k3d config (`scripts/render-cluster-config.sh prod`).
2. Creates the `opsta-ai-gateway-prod` k3d cluster (API on port 6444; no local registry).
3. Applies the Gateway API CRDs (server-side).
4. Creates the `ghcr-pull` imagePullSecret in prod namespaces.
5. Runs `helmfile -e prod sync` (downloads the OCI chart at the specified version, installs
   all releases, waits for each to be ready).

After this completes, the control-plane migrates the database automatically on startup.
All subsequent updates use `task prod:deploy` (via the production workflow) — `task prod:up`
is never run again.

## First-deploy onboarding (automatic)

As of **v1.1.0** the first deploy onboards itself — no manual REST calls. On first
reconcile the control-plane seeds the organisation **and** a local **bootstrap admin**
account in Keycloak, so an operator can log in to the console immediately. Two onboarding
modes share this path; pick the one that matches the customer.

### Step 1 — set the operator email before deploying

`controlPlane.bootstrapAdmin.email` (in `values-prod.yaml`) is the email that becomes the
first platform admin. It is appended to the admin allow-list automatically, so first login
lands with full admin rights. Set it to the operator's real email before the first deploy.
The bootstrap password is generated into the `control-plane-internal` Secret by
`scripts/gen-secrets.sh` (key `controlPlane.bootstrapAdminPassword`) — it is created once
and never reset on redeploy.

### Step 2 — retrieve the generated bootstrap credential

After the deploy completes, read the generated password from the cluster:

```bash
kubectl --context k3d-opsta-ai-gateway-prod \
  get secret control-plane-internal -n opsta-ai-gateway \
  -o jsonpath='{.data.bootstrap-admin-password}' | base64 -d; echo
```

The username **is** `controlPlane.bootstrapAdmin.email` (the account lives in the
`opsta-admins` group). Log in at `https://console-ai-gateway.opsta.co.th` with these
credentials.

### Step 3a — local users only (no external SSO)

If the customer does not use Google/OIDC/SAML, you are done after first login. Manage all
users in-product: **Admin → Identity → Local users** lets a platform admin create accounts,
reset passwords, and enable/disable users (backed by Keycloak). The bootstrap admin stays as
the permanent break-glass account — rotate its password periodically (see below).

### Step 3b — external SSO (e.g. Google for `opsta.co.th`)

If the customer logs in via an external IdP, configure the broker from the console after
first login: **Admin → Identity → Login methods → Add login method** → choose Google (or
generic OIDC), paste the client ID/secret and the allowed email domain(s). Keycloak's
Organizations feature then routes any matching login to that broker and JIT-creates the user
on first login. Once a real SSO admin has logged in successfully, **retire the bootstrap
admin**: Admin → Identity → Local users → **Disable** on the bootstrap account. This is the
break-glass retirement — re-enable it only if SSO is ever unavailable.

### Rotating the bootstrap admin password

The bootstrap password is permanent by design (it is not reset on redeploy). To rotate it,
use **Admin → Identity → Local users → Reset password** on the bootstrap account from any
platform-admin session. (Editing the Secret key does **not** re-push the password — the seed
only sets it on account creation.)

## Ongoing operations

- **Deploy a new version:** run the **production deploy** workflow in GitHub Actions,
  enter the version, approve the Environment gate. That is the only supported prod-update
  path — no manual `kubectl apply`, no `task reset`.
- **Check status:** `task prod:status` shows pod and route status across prod namespaces.
- **Refresh the GHCR pull secret:** `GHCR_USER=<u> GHCR_TOKEN=<t> task prod:pull-secret`.
  Run this standalone only to refresh the `ghcr-pull` secret after a token rotation, on a
  cluster that already exists (first install does this automatically via `task prod:up`).
- **Rotate component passwords:** edit `secrets-values-prod.yaml` with new values, then
  deploy. Because passwords are file-based (not in etcd), a Helm upgrade picks up changes
  without a cluster rebuild.
