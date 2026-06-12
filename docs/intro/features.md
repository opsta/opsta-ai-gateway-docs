# Features

## A complete web console

Every user interacts with the gateway through an **SSO-gated web console** —
no command line, no kubectl, no Grafana access required.

**For members:** your personal portal shows your live token usage, USD spent
and remaining budget per model. The **Overview** is your dashboard; the
**Profile** page shows your identity, groups, and allowed models. Issue your
own API keys from the **API keys** page (shown once, copy it immediately),
then use the **Connect a client** page to get the exact copy-paste config for
opencode or Crush. If a request is blocked by guardrails, the **Blocked
requests** page shows why and lets you report a false positive.

**For org admins:** manage your organisation from the **Org overview** —
add or remove members, set roles (member/viewer/org_admin), and see who
belongs where. The **Projects** page is a tabbed editor (Providers · Routing ·
Guardrails · Budgets & Limits · Review) where you configure every aspect of a
project. Connect your own identity provider on the **Organization SSO** page
so your users log in with their corporate account and land in the right group
automatically.

**For platform admins:** manage every organisation, see every consumer's usage,
override per-model pricing from the **Pricing** screen (save changes without
redeploying), configure global login methods on the **Platform Login Methods**
screen, and read the full **Audit log** of every mutating action across all
organisations. A dismissible **setup guide** on the admin home walks through
create-org → connect-IdP → invite admins → users log in → auto-join groups.

## Work-type → model routing

Requests route to a **logical model route** by header/tag — `workload: bulk`
goes to the cheaper bulk model, everything else to the coding default — with a
documented fallback to a second provider. Logical aliases (`coding-default`,
`bulk`) are the stable client contract; the real provider/model behind each is
data you can change without touching clients.

## API-key authentication + USD budgets

The machine API (`/v1`) is authenticated with **API keys** (`Authorization:
Bearer …`, OpenAI-compatible): each key maps to a **consumer** that every
policy keys on. On top of token limits, each consumer gets a real
**monthly dollar budget**: a controller continuously reads each consumer's
month-to-date token usage, prices it with a per-model USD price table, and cuts
the consumer off once they exceed their budget for the month. The budget resets
at the start of each calendar month, and historical usage is retained for
reporting (configurable, default 1 year).

## Hierarchical budgets & limits

Budgets and token/minute limits are set at **three levels — project, group, and
user** — and an admin manages them per project right in the console. Enforcement
takes the **tightest** constraint across the chain: a group or project running
out blocks a member who still has personal room left; an individual's own cap
blocks them even when the project has budget to spare. Spend is priced from the
current per-model price each cycle and the controller re-derives the truth every
run, so budgets are self-healing and a price change just moves the next refresh.

## Per-user / per-group token limits

Token-per-minute rate limits are enforced at the gateway, keyed by the caller's
identity and namespaced by organisation and project. Over the limit → **HTTP 429**.

## Per-group model allow-list

A model guard rejects any request whose `model` isn't in the caller's
**group allow-list** → **HTTP 403**. The allow-list is scoped per project.
Non-LLM requests pass through untouched.

## Guardrails — PII masking + prompt-injection

Two guards screen every prompt **before** the model sees it:

- **PII masking** masks sensitive data (emails, phone numbers, IPs, API keys)
  in both the request and the model's response. It runs entirely in-cluster with
  local rules — **no data leaves the cluster** — as an always-on,
  organisation-wide PII floor that protects every project.
- **Prompt-injection blocking** rejects known jailbreak / instruction-override
  prompts (e.g. "ignore previous instructions", "reveal your system prompt")
  → **HTTP 403**. Each project keeps the shared baseline and can add its own
  patterns, managed via the console.
- **Semantic guard** (optional, per project) goes beyond fixed patterns: an
  admin supplies a few **example** deny prompts (and optional allow exceptions),
  the gateway embeds them locally, and any incoming prompt that is *semantically
  similar* to a deny example is blocked → **HTTP 403** — catching paraphrased or
  novel injections the pattern list would miss. Embeddings and similarity search
  run entirely in-cluster (local model + vector store); allow examples act as
  exceptions to deny, never as a whitelist, so ordinary prompts are never blocked
  for failing to match one.

All three are on-prem and self-contained — no third-party cloud call.

## Connect any AI provider

An admin connects any AI provider to a **project** from the console — pick a
preset (DeepSeek, OpenAI-compatible, Anthropic, generic), paste the API key,
and map logical model aliases to the real upstream model. The control plane
wires the egress route, rewrites the model name, and injects the project's key
on the way out — all within about one second. Provider keys stay in
per-project Kubernetes Secrets, never in the database or in git.

## Per-organization IdP brokering

Each **organisation connects its own identity provider** — Google Workspace,
Microsoft Entra, Okta, or any OIDC/SAML — and its people are brokered into
the **right org, group, and role on first login**, with no per-user setup by a
platform admin. An org admin does this from the console's **Organization SSO**
screen: point at the IdP, list the org's verified email domains, and add
claim-to-group mappings. A new user who logs in is just-in-time provisioned
into the correct org and group. **Email domains are globally unique**, so one
org's IdP can never drop a user into another org.

## Enterprise identity & SSO

Human access (console + dashboards) is gated by **Keycloak** running in your
cluster as the identity broker — open-source IAM (Apache-2.0), no SaaS, no
per-seat fees. Local users, Active Directory / LDAP, Google, Microsoft Entra,
or any OIDC or SAML provider — all supported, all can coexist. Admins configure
the common cases right inside the product console without ever opening Keycloak.

## Audit log

Every **mutating admin or console action** is recorded to an append-only **audit
log** — who did it (the signed-in admin and their groups), what they did (create
an org, set a budget, link an IdP, issue or revoke an API key…), and the outcome.
Denied attempts are recorded too, so cross-organisation probing is visible.
Admins read the trail in the console on a dedicated **Audit** screen, scoped
server-side: an org admin sees only their own organisation's history, while the
platform admin can read across organisations.

## Observability

A full **Grafana LGTM** stack — Loki (logs), Mimir (metrics), Tempo (traces) —
with Grafana Alloy collecting token metrics and access logs from the gateway.
Grafana ships with an AI Gateway overview dashboard and is restricted to
platform administrators. End users read their own usage — tokens, USD spent and
remaining budget, per model — natively in the console.

Each organisation is its own observability tenant: one org can never read
another's telemetry.

## Multi-tenancy

The gateway is a multi-tenant product. **Organisations** are isolated tenants:
cross-org admin and config writes are refused, each org is its own
observability tenant, and members see only their own org's usage. Adding a
tenant means adding scoped config, never rewriting the core.

## In-cluster TLS

TLS is terminated in-cluster by the gateway using Let's Encrypt certificates
(cert-manager, ACME DNS-01). A Cloudflare Tunnel provides the public ingress
for development; in production the tunnel is removed and the same certificate
serves clients directly — zero manifest change.
