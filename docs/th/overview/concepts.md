> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Key concepts & glossary

These terms are used throughout the documentation. They form a hierarchy of **tenancy** (who) and a set of
**capabilities** (what the gateway does to a request).

## Tenancy

| Term | Meaning |
|---|---|
| **Organization** | An enterprise customer — the top-level isolation, billing, and SSO boundary. Each organization connects its own identity provider and owns many projects. |
| **Project** | A workspace that owns a routing configuration, providers, guardrails, budgets, and API keys. An organization has many projects. |
| **Group** | A team inside a project. Used for role aggregation and budget rollups; typically mapped from an identity-provider group. |
| **User** | A member — a person who signs in to the console and/or calls the gateway. |
| **Consumer** | The identity a request is attributed to, expressed as the tuple `organization.project.user`. Every API key, budget, limit, and usage record is keyed by this tuple. |
| **Role** | Access level: **platform admin** (manages everything), **org admin** (manages one organization), or **member** (uses the gateway, manages their own keys). |

## Capabilities

| Term | Meaning |
|---|---|
| **Provider** | An upstream AI service (OpenAI-compatible, DeepSeek, Anthropic, or generic) added per project. Provider credentials are stored as per-organization secrets. |
| **Logical model / route** | A stable alias clients use (e.g. `coding-default`, `bulk`) that the gateway maps to a real provider and upstream model. Clients never change when you re-point a route. |
| **Budget** | A monthly USD spending cap. Budgets are **hierarchical** — organization ≥ project ≥ group ≥ user — and the tightest cap wins. |
| **Token limit (TPM)** | A per-minute cap on tokens for a consumer, enforced at the gateway. |
| **Guardrail** | A policy that screens a request before it reaches the model: **PII masking**, **prompt-injection** blocking (pattern-based), and **semantic** prompt-injection blocking (by meaning). |
| **Semantic cache** | A vector-similarity response cache. A cache hit returns a stored answer and skips the model call, saving the full token spend. |
| **MCP server** | A remote Model Context Protocol server that provides tools to AI agents. The gateway governs access to registered MCP servers per project. |
| **API key** | A bearer credential bound to a consumer. Clients send it to authenticate; it is the identity everything else keys on. |

## Architecture terms

| Term | Meaning |
|---|---|
| **Control plane** | The management service backed by PostgreSQL. It is the **single source of truth** for all tenant configuration and exposes the console's API. |
| **Data plane** | The gateway itself, which handles live request traffic and enforces every policy. |
| **Reconcile** | The control plane continuously projects the configuration from PostgreSQL onto the data plane — there is no hand-edited gateway config and no drift. |

See [Architecture](/th/overview/architecture) for how these fit together.
