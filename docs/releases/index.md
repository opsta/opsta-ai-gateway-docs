# Release notes

A user-facing summary of what each release delivered, newest first. Each product version pins a tested
[component matrix](/operate/upgrades) — the whole set is verified and shipped together.

::: info How to read this
These notes describe capabilities in product terms. For upgrade mechanics see [Upgrades](/operate/upgrades); for
the full configuration surface see the [Configuration reference](/reference/configuration).
:::

## v1.19.1 — Security maintenance _(latest)_

A maintenance release — **no user-facing changes**. Hardens the **admin console** container image by
removing the unused `npm` CLI from the runtime, which clears a HIGH-severity advisory
(CVE-2026-12151, an `undici` denial-of-service) the image scanner flagged. The console behaves exactly
as in v1.19; all v1.19 capabilities below are unchanged.

## v1.19 — Agent & Tool catalog

One governance overview of everything that can act in your organization. The new **Agent & Tool
catalog** (admin sidebar) lists every **AI agent** and every governed **tool** (MCP server) across
all projects — with its **owner** and **risk tier** — and a risk filter to focus on what matters.

- **Tools get owner + risk** — MCP servers now carry the same governance metadata as agents (owner,
  risk tier, description), set on the project's MCP servers tab.
- **One pane for "what exists, who owns it, how risky"** — across every project in the org.

See [Agent & Tool catalog](/admin/catalog).

## v1.18 — Trusted Agent Identity

Make every autonomous AI agent a **first-class, governed principal** instead of an anonymous shared
key. Register an agent under a project's new **Agents** tab — give it an owner, who it *acts for*, and a
**risk tier** — and it gets its own verifiable, revocable credential that flows through every LLM **and**
MCP/tool call.

- **Per-agent everything, no new machinery** — an agent is governed exactly like any principal:
  per-agent [budgets](/admin/budgets-and-limits), model allow-lists, [guardrails](/admin/guardrails),
  [MCP](/admin/mcp-servers) isolation, and the [kill-switch](/admin/kill-switch).
- **Per-agent cost** — agent spend is labeled and attributed on the [FinOps](/admin/finops) chargeback.
- **Stop one agent instantly** — rotate or delete an agent to revoke its credential at the gateway.

See [AI Agents — trusted agent identity](/admin/agents).

## v1.17 — FinOps: chargeback & forecast

Turn usage into money. A per-tenant **chargeback statement** (project → group → user → model,
priced server-side, **CSV-exportable** for internal billing) and a **budget forecast** that
projects where this month's spend will land — so you can act before a cap is hit.

- **Chargeback** — on **Usage → FinOps**, pick a month and export a priced statement. Pricing is the
  same the gateway *enforces* with, so the bill can't disagree with what capped spend.
- **Unpriced usage is flagged**, never silently billed $0.
- **Forecast** — per budget (project/user): spend-to-date, % consumed, projected month-end, with an
  over-budget warning.

See [FinOps — chargeback & forecast](/admin/finops).

## v1.16 — Guardrail review & approval

Guardrail changes are now **governed**, not applied live by one person. A change to a project's
prompt-injection patterns or [semantic guard](/admin/semantic-guard) is a **staged, versioned
revision**: one admin proposes, a different admin approves (4-eyes), and only then does it reach the
gateway.

- **Propose → approve → publish** — proposed changes are **pending** (not live) until a second admin
  approves; every version is recorded with who proposed and who approved, and is **revertible**.
- **Approval mode per organization** — **strict** (4-eyes) or **self** (single-admin teams / dev).
- **Tune from evidence** — a per-project **policy-hit** view shows how often each rule fires and how
  many users flagged a false positive.

See [Guardrails](/admin/guardrails).

## v1.15 — AI kill-switch

An **emergency stop** for AI traffic. An admin can instantly block **all** LLM and agent (MCP)
traffic for a scope — for an incident, a suspected key leak, abuse, or a compliance hold — and
resume it just as fast.

- **One-click suspend/resume** — on **Projects → Settings**, suspend all traffic for a project
  (with an optional reason); every consumer in it gets `503` within seconds. Resume restores it.
- **Three scopes** — project, organization, or global (whole platform), mirroring budgets.
- **Reversible & audited** — budgets, keys, and config are untouched; every suspend/resume is in
  the audit log with the actor and reason.

See [AI kill-switch](/admin/kill-switch).

## v1.14 — Native providers (Bedrock, Vertex, Claude, Gemini) + failover

Connect **AWS Bedrock, Google Vertex, Anthropic Claude, and native Google Gemini** directly — your apps
keep speaking the OpenAI chat API and the gateway **translates the protocol** automatically. Native
providers also get built-in **resilience**.

- **Native providers** — on **Projects → LLM Providers**, pick Bedrock / Vertex / Claude / Gemini and enter
  that provider's own credentials (AWS keys, Vertex service-account, API keys). No app changes.
- **Failover + retry** — give a native provider multiple API keys and the gateway rotates off a failing key
  (with health-checks); optionally retry failed requests.
- **No disruption** — OpenAI-compatible providers (OpenAI/DeepSeek/Fireworks/self-hosted, …) work exactly as
  before; native providers run alongside them per project.

See [Providers](/admin/providers) and [Routing](/admin/routing).

## v1.13 — Turn REST APIs into governed MCP servers

Register an existing REST API as a **governed MCP server** in clicks — no code. Paste the API's
**OpenAPI/Swagger spec**, **pick which operations** agents may call, and the gateway exposes each as
an MCP tool, fronted by the same project-key authentication, per-project isolation, and audit as the
rest of your traffic.

- **OpenAPI → MCP** — on **Projects → MCP Servers**, choose **Source → REST API (OpenAPI)**, paste the
  spec, and **Discover tools**.
- **Pick the tools agents get** — the operation checklist is the access policy; unticked operations
  are never exposed.
- **Same connect URL and governance** as a proxied MCP server — agents can't tell the difference, and
  cross-project keys are still refused (`403`).

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.12 — Governed MCP tool calls, end-to-end

The MCP gateway now **proxies agent tool calls through to your registered servers**. A governed
`tools/list` / `tools/call` reaches the backend MCP server and returns real results — with the same
project-key authentication, strict per-project isolation, and activity recording as your LLM traffic.
Earlier releases registered and fronted MCP servers; this release completes the governed data path.

- **Tool calls flow through the gateway** — list and call tools on a registered server with your
  project API key; a key from another project is still refused (`403`).
- **Choose the transport per server** — register each MCP server as **Streamable HTTP** (the default)
  or **SSE**, to match how your backend speaks MCP.

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.11 — Observability stack modernization _(internal)_

Platform internals only — **no change to how you use the gateway**. The bundled metrics/logs/traces
stack moved to maintained community Helm charts, and the standalone metrics store was simplified for
more reliable single-node installs. See [Platform observability](/operate/observability-platform).

## v1.10 — Prompt management & model rollouts

Three additions that put the **prompt** and **model choice** under governance — all per-project,
configured from the console, default-off.

- **Enforced prompt** — set a project-wide system prompt + policy the gateway prepends to every
  request before the model. Applied at the gateway, so an app (or a compromised client) can't
  strip it; change it once and every app picks it up. See [Prompt management](/admin/prompt-management).
- **Prompt template catalog** — author named, versioned prompt templates with `{{variable}}`
  placeholders; apps invoke a *published* template by name and pass values, instead of hard-coding
  prompt text. Draft vs published keeps edits off live traffic until you publish. See
  [Prompt templates](/admin/prompt-templates) and [Use prompt templates](/user/use-prompt-templates).
- **Canary / A-B rollouts** — split a logical model's traffic across two providers by weight
  (e.g. 90/10 → 50/50 → 100) to A/B test or safely roll out a new provider — randomized per
  request, with no client changes. See [Rollouts](/admin/canary-rollouts).

## v1.9 — MCP gateway

Governed access to AI-agent tools. Register remote **Model Context Protocol** servers per project; the gateway
fronts them with the same project API key, strict per-project isolation, and activity recording you already use
for LLM traffic.

- One key for chat and tools — agents authenticate with the project API key.
- A key can only reach its own project's MCP servers; cross-project access is refused.
- A per-project catalog of registered servers, with a connect URL for developers.

See [MCP servers](/admin/mcp-servers) and [Use MCP servers](/user/use-mcp-servers).

## v1.8 — Semantic guard

Embedding-based prompt-injection protection that catches **paraphrased** attacks a regex would miss. Each project
can tune it with its own allow/deny sample prompts, and the multilingual embedding model handles non-English
prompts (including Thai).

See [Semantic guard](/admin/semantic-guard).

## v1.7 — Semantic cache

A response cache keyed by **meaning**. Semantically similar prompts reuse a prior answer, cutting latency and
upstream spend. Cache savings are visible in the dashboards, and cache-aware pricing keeps cost figures accurate.

See [Semantic cache](/admin/semantic-cache).

## v1.6 — Control plane & multi-project

The configuration **control plane** (PostgreSQL source of truth) with continuous reconcile onto the gateway, plus
multi-organization, multi-project tenancy. Administrators manage everything through the console or the API;
nothing is hand-edited on the cluster.

This release also brought **per-org observability isolation**, **hierarchical budgets and limits** (org →
project → group → user), **per-project providers, routing, and guardrails**, member **self-service API keys**,
**per-organization IdP brokering** (OIDC/SAML), the **audit log**, and control-plane **hardening** (verified
identity, internal-service auth, network policy).

See [Architecture](/overview/architecture), [Multi-tenancy model](/overview/multi-tenancy),
[Budgets & limits](/admin/budgets-and-limits), and [SSO & IdP brokering](/admin/sso-and-idp).

## v1.4–v1.5 — SSO & observability

Single sign-on for the console and dashboards via your corporate IdP, and a **self-hosted** metrics/logs/traces
stack with per-organization usage and cost dashboards.

See [Observability](/admin/observability) and [SSO & IdP brokering](/admin/sso-and-idp).

## v1.3 — Dashboards & guardrails

Usage and cost dashboards from gateway telemetry, plus the first guardrails — prompt-injection detection and
optional PII masking.

See [Guardrails](/admin/guardrails).

## v1.2 — Budgets & limits

USD **budgets** and token-per-minute **limits** per group and user, with API-key authentication and a budget
controller that prices usage and enforces caps.

See [Budgets & limits](/admin/budgets-and-limits).

## v1.1 — Engine & routing

The core gateway: an OpenAI-compatible endpoint with **work-type → model routing**, so developers call stable
logical model names and administrators decide which provider and model serve them.

See [Routing](/admin/routing) and [Models & routing](/user/models-and-routing).

## Next steps

- [What is Opsta AI Gateway](/overview/what-is) — the product in one page.
- [Upgrades](/operate/upgrades) — how to move to a new version.
