> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Release notes

A user-facing summary of what each release delivered, newest first. Each product version pins a tested
[component matrix](/th/operate/upgrades) — the whole set is verified and shipped together.

::: info How to read this
These notes describe capabilities in product terms. For upgrade mechanics see [Upgrades](/th/operate/upgrades); for
the full configuration surface see the [Configuration reference](/th/reference/configuration).
:::

## MCP gateway _(latest)_

Governed access to AI-agent tools. Register remote **Model Context Protocol** servers per project; the gateway
fronts them with the same project API key, strict per-project isolation, and activity recording you already use
for LLM traffic.

- One key for chat and tools — agents authenticate with the project API key.
- A key can only reach its own project's MCP servers; cross-project access is refused.
- A per-project catalog of registered servers, with a connect URL for developers.

See [MCP servers](/th/admin/mcp-servers) and [Use MCP servers](/th/user/use-mcp-servers).

## v1.8 — Semantic guard

Embedding-based prompt-injection protection that catches **paraphrased** attacks a regex would miss. Each project
can tune it with its own allow/deny sample prompts, and the multilingual embedding model handles non-English
prompts (including Thai).

See [Semantic guard](/th/admin/semantic-guard).

## v1.7 — Semantic cache

A response cache keyed by **meaning**. Semantically similar prompts reuse a prior answer, cutting latency and
upstream spend. Cache savings are visible in the dashboards, and cache-aware pricing keeps cost figures accurate.

See [Semantic cache](/th/admin/semantic-cache).

## v1.6 — Control plane & multi-project

The configuration **control plane** (PostgreSQL source of truth) with continuous reconcile onto the gateway, plus
multi-organization, multi-project tenancy. Administrators manage everything through the console or the API;
nothing is hand-edited on the cluster.

This release also brought **per-org observability isolation**, **hierarchical budgets and limits** (org →
project → group → user), **per-project providers, routing, and guardrails**, member **self-service API keys**,
**per-organization IdP brokering** (OIDC/SAML), the **audit log**, and control-plane **hardening** (verified
identity, internal-service auth, network policy).

See [Architecture](/th/overview/architecture), [Multi-tenancy model](/th/overview/multi-tenancy),
[Budgets & limits](/th/admin/budgets-and-limits), and [SSO & IdP brokering](/th/admin/sso-and-idp).

## v1.4–v1.5 — SSO & observability

Single sign-on for the console and dashboards via your corporate IdP, and a **self-hosted** metrics/logs/traces
stack with per-organization usage and cost dashboards.

See [Observability](/th/admin/observability) and [SSO & IdP brokering](/th/admin/sso-and-idp).

## v1.3 — Dashboards & guardrails

Usage and cost dashboards from gateway telemetry, plus the first guardrails — prompt-injection detection and
optional PII masking.

See [Guardrails](/th/admin/guardrails).

## v1.2 — Budgets & limits

USD **budgets** and token-per-minute **limits** per group and user, with API-key authentication and a budget
controller that prices usage and enforces caps.

See [Budgets & limits](/th/admin/budgets-and-limits).

## v1.1 — Engine & routing

The core gateway: an OpenAI-compatible endpoint with **work-type → model routing**, so developers call stable
logical model names and administrators decide which provider and model serve them.

See [Routing](/th/admin/routing) and [Models & routing](/th/user/models-and-routing).

## Next steps

- [What is Opsta AI Gateway](/th/overview/what-is) — the product in one page.
- [Upgrades](/th/operate/upgrades) — how to move to a new version.
