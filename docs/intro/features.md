# Features

What the gateway does today (delivered milestones M0–M6 + M2.5 — Phase 0 complete).

## Work-type → model routing (M1)

Requests route to a **logical model route** by header/tag — `workload: bulk`
goes to the cheaper bulk model, everything else to the coding default — with a
documented fallback to a second provider. This is native Gateway API config (no
plugin). Logical aliases (`coding-default`, `bulk`) are the stable client
contract; the real provider/model behind each is data you can change without
touching clients.

## Per-user / per-group token limits (M2)

Token-per-minute rate limits are enforced by the built-in **ai-statistics** +
**ai-token-ratelimit** plugins (Redis-backed), keyed by the caller's identity
and namespaced by `{org, project}`. Over the limit → **HTTP 429**. Redis is
managed by the Opstree operator (standalone for dev, HA + Sentinel available).

## API-key authentication + USD budgets (M2.5)

The machine API (`/v1`) is authenticated with **API keys** (`Authorization:
Bearer …`, OpenAI-compatible): each key maps to a **consumer** (`project.user`)
that every policy keys on. On top of token limits, each consumer gets a real
**monthly dollar budget**: a controller continuously reads each consumer's
month-to-date token usage, prices it with a per-model USD price table, and cuts the
consumer off once they exceed their budget for the month → **HTTP 403**. The budget
resets at the start of each calendar month. Historical token + USD usage is **retained
for reporting** (default 1 year, configurable) — the monthly reset only affects
enforcement, never the stored history. It's all in-cluster (no proprietary
component), and the budget/price config lives in the Project spec.

## Self-service onboarding & key lifecycle (M14)

Members get themselves connected without filing a ticket. In the **SSO-gated console**
a member opens the **API keys** page and **issues their own key** for the consumer they
own — the fresh `sk-…` is shown **once**, to copy immediately. An **Onboarding** page then
renders the exact, copy-paste client config (gateway base URL + key) for **opencode** and
**Crush**, so the first request works in seconds. Keys can be issued **with an optional
expiry**, and the list shows each key's computed **status** — *active*, *expired*, or
*revoked*.

The full lifecycle is enforced at the gateway: a **revoked** or **expired** key stops
working within about one reconcile cycle (revoke takes effect in ~1s; an expiry that
lapses while live is picked up by the next periodic pass, ≤30s). Access is **scoped** — a
member manages only their own keys, an org admin manages their org's, and cross-org or
non-owner attempts are refused. Because usage is measured **per consumer** (not per
individual key — a person may run several), the keys page shows an honest, clearly-labelled
*"active this month / no activity this month"* signal across all of a member's keys rather
than a misleading per-key "last used".

## Hierarchical budgets & limits (M13)

Budgets and token/min limits are set at **three levels — project, group, and
user** — and an admin manages them per project right in the console. Enforcement
takes the **tightest** constraint across the chain: a USD budget is an aggregate
of everyone under it, so a group or project running out blocks a member who still
has personal room left; and an individual's own cap blocks them even when the
project has budget to spare. Token/min limits work the same way as a per-member
ceiling (the minimum of the levels that apply). Spend is priced from the current
per-model price each cycle and the controller re-derives the truth every run, so
budgets are self-healing and a price change just moves the next refresh.

## Per-group model allow-list (M3)

A small custom Wasm guard rejects any request whose `model` isn't in the
caller's **group allow-list** → **HTTP 403**. The allow-list is data in the
Project spec, scoped per Project, and on-prem self-contained (no cloud
dependency). Non-LLM requests pass through untouched.

## Guardrails — PII masking + prompt-injection (M5)

Two guards screen every prompt **before** the model sees it:

- **PII masking** uses the built-in **ai-data-masking** plugin to mask sensitive
  data (emails, phone numbers, IPs, API keys) in both the request and the model's
  response. It runs entirely in-cluster with local rules — **no data leaves the
  cluster** — as an always-on, **organisation-wide PII floor** that protects every
  project. (We keep the community-maintained plugin rather than re-implement it.)
- **Prompt-injection blocking** is a small custom Wasm guard that rejects known
  jailbreak / instruction-override prompts (e.g. "ignore previous instructions",
  "reveal your system prompt") → **HTTP 403**. Its pattern list is **per-project**
  (M11): each project keeps the shared baseline and can add its own patterns,
  managed via the console / control-plane API.

Both are on-prem and self-contained — no third-party cloud call — meeting the
privacy requirement.

## Observability (M4)

A full **Grafana LGTM** stack — **Loki** (logs), **Mimir** (metrics), **Tempo**
(traces) — with **Grafana Alloy** scraping the gateway's token metrics and
tailing its access logs. Grafana ships with an **AI Gateway overview**
dashboard (tokens & latency by model/route, rate-limit rejections) and is
reachable at its own hostname. The LGTM stores sit behind a basic-auth proxy
(tenant credential), with org → tenant isolation ready for multi-tenancy.

Storage is host-mounted local disk for dev (no NFS) with an object-storage
(S3 / SeaweedFS) path for HA.

## Per-organization observability isolation (M12)

In the multi-tenant product each **organization is its own observability tenant**.
Alloy derives the org from the request identity and ships each org's metrics to its
own tenant (`X-Scope-OrgID`); a credential-aware proxy in front of Mimir/Loki/Tempo
**pins every credential to its tenant**, so one org's token can read only that org's
data — a cross-tenant read is refused. The network path to the stores is locked down
so the proxy is the only way in.

End users never touch Grafana. They read their own usage — tokens, USD spent and
remaining budget, per model — in the **SSO-gated console**, scoped server-side to the
caller's organization. **Grafana is a platform-operator tool only**: login is
restricted to the platform admin group, so a regular user can't reach cross-tenant
data there. The per-tenant split also enables per-org retention and limits, and clean
per-org data deletion when an organization is offboarded.

## Enterprise identity & SSO (M9)

Human access (console + dashboards) is gated by **Keycloak** running **in your
cluster** as the identity broker — an open-source IAM (Apache-2.0), no SaaS, no
per-seat fees. It supports every common login method, and they can **coexist**:

- **Local users in a database** (default) — usernames + passwords managed in the
  product, ideal when you don't have a corporate IdP.
- **Active Directory / LDAP**, and **Google / Microsoft Entra / any OIDC or SAML**
  identity provider — connect your existing directory.
- **Per-scheme group mapping** (external groups/claims → product groups) — the same
  GitLab/Grafana-style model — so each login method maps cleanly onto the gateway's
  group-based limits, budgets, and admin rights.

Admins configure the common cases **right inside the product console** — a built-in
**Platform Login Methods** screen to add a login method (Google, Microsoft Entra, or
any OIDC by discovery URL), create groups, and create local users — without ever opening
Keycloak. Org admins also get a **Projects** screen to manage each project's LLM
providers, model routing and prompt-injection patterns directly, with changes applied to
the gateway within about a second. Advanced setups (AD/LDAP, SAML, per-provider claim mappers) link out to the full
Keycloak admin console; whichever path you use, the change is preserved across upgrades.
The product realm itself is shipped as code. On login, identity + group flow through
as the tuple the gateway's policies already use, and a member of the admin group gets
admin in both the console and Grafana — no separate password. Built on
Keycloak + oauth2-proxy (no proprietary components).

## Per-organization IdP brokering (M15)

Each **organization connects its own identity provider** — its corporate Google
Workspace, Microsoft Entra, Okta, or any OIDC/SAML — and its people are brokered into
the **right org, group, and role on first login**, with no per-user setup by a platform
admin. An org admin does this from the console's **Organization SSO** screen: point at
the IdP (OIDC discovery URL / SAML metadata), list the org's **verified email domains**,
and add **claim → group/role mappings** (e.g. the IdP's `groups: eng` claim → the
`/acme/platform-eng` group as a member).

The control plane provisions this into Keycloak automatically using **Keycloak
Organizations**: it creates the organization, links the brokered IdP, and creates the
claim mappers and target groups — so a federated user who logs in is **just-in-time
created** and placed correctly. **Email domains are globally unique**, which is the
cross-tenant isolation guarantee: one org's IdP can never drop a user into another org.
Provider client secrets live in your cluster's Kubernetes Secrets, never in the database
or in git. Downstream nothing changes — brokered users carry the same `{org, project,
group, user}` identity tuple every policy already uses.

## Audit log (M16)

Every **mutating admin or console action** is recorded to an append-only **audit
log** — who did it (the signed-in admin and their groups), what they did (create an
org, set a budget, link an IdP, issue or revoke an API key…), and the outcome.
**Denied attempts are recorded too**, so a cross-organization probe shows up in the
trail rather than vanishing. The log never stores request bodies or credentials, so
secrets can't leak into it.

Admins read the trail in the **SSO-gated console** on a dedicated **Audit** screen,
scoped server-side: an org admin sees only their own organization's history (filter by
actor, action, or time range), while the platform admin can read across organizations.
Entries are retained for a configurable window (default one year) and pruned
automatically — sensible for a long-running on-prem deployment. Because the
organization is stored by name, an organization's history **survives even after it is
offboarded**, which is exactly what an auditor needs.

The same milestone rounds out the console: members see a **per-model token and cost
breakdown** of their own usage natively (no Grafana access required), admins get
**provider presets** and a **prompt-injection pattern library** to configure projects
faster, and a read-only **effective-configuration** view shows the merged, resolved
settings the gateway actually enforces. The console also ships standard **security
headers** (CSP, HSTS, clickjacking protection) and the admin API enforces request-size
and rate limits.

## In-cluster TLS + remote access (M0.5)

TLS is terminated **in-cluster** by Higress using a **Let's Encrypt**
certificate from cert-manager (ACME DNS-01 via Cloudflare). A **Cloudflare
Tunnel** is the dev front door; in production it's removed and the same
certificate serves clients directly — zero manifest change.

## Coming next

See the [Roadmap](./roadmap) — Phase 0 (the single-tenant engine) is complete;
next is the multi-tenant control plane, USD budgets, and API keys.
