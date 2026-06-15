# Release notes

A user-facing summary of what each release delivered, newest first. Each product version pins a tested
[component matrix](/operate/upgrades) — the whole set is verified and shipped together.

::: info How to read this
These notes describe capabilities in product terms. For upgrade mechanics see [Upgrades](/operate/upgrades); for
the full configuration surface see the [Configuration reference](/reference/configuration).
:::

## v1.10 — Prompt management & model rollouts _(latest)_

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
