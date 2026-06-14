> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Glossary

Key terms used throughout this documentation. For the conceptual model behind them, see
[Key concepts](/th/overview/concepts) and the [Multi-tenancy model](/th/overview/multi-tenancy).

| Term | Meaning |
|---|---|
| **Organization** | The top tenant boundary — a customer or business unit. The isolation, billing, and SSO boundary. |
| **Project** | A workspace within an organization. Providers, routing, guardrails, and budgets are configured per project. |
| **Group** | A set of users within a project, used for shared limits and model allow-lists. |
| **User / Consumer** | An identity that makes requests, expressed as the tuple `organization.project.user`. |
| **Consumer tuple** | The three-part identity (`org.project.user`) that keys API keys, budgets, usage, and isolation. |
| **Platform admin** | Role spanning all organizations. |
| **Org admin** | Role confined to one organization. |
| **Member** | Read-only, self-service role for an individual user. |
| **Control plane** | The configuration service (backed by PostgreSQL) that is the single source of truth. |
| **Data plane** | The gateway that handles live traffic and enforces policy. Holds no configuration of its own. |
| **Reconcile** | The continuous projection of the control plane's desired state onto the data plane. |
| **Logical model name** | A stable name developers call (e.g. `coding-default`), mapped to a real provider model by routing. |
| **Provider** | An upstream LLM endpoint (OpenAI-compatible) configured per project. |
| **Routing** | The mapping of logical model names to providers and real model IDs. |
| **Budget** | A USD spending cap at organization, project, group, or user scope; the tightest applicable cap wins. |
| **Limit** | A rate cap (tokens per minute) at a tenancy scope. |
| **Guardrail** | A request-content control — prompt-injection detection and PII masking. |
| **Semantic cache** | A response cache keyed by meaning, so similar prompts reuse a prior answer and avoid upstream spend. |
| **Semantic guard** | An embedding-based prompt-safety classifier, tunable per project with sample prompts. |
| **MCP** | Model Context Protocol — the standard for giving AI agents access to external tools. |
| **MCP server** | A backend tool endpoint registered per project and fronted by the gateway. |
| **Gate** | A policy stage in the request lifecycle (key-auth, guardrails, routing, budget/limits, cache). |
| **Key-auth** | The gate that authenticates an API key and resolves the consumer identity. |
| **Tenant guard** | The check that a request may only reach its own tenant's resources. |
| **IdP brokering** | Connecting an organization's own identity provider so users sign in with corporate credentials. |
| **JIT provisioning** | Creating a user account automatically on first successful sign-in. |
| **Audit log** | The record of every mutating administrative action, including denied attempts. |
| **Component matrix** | The set of component versions tested together for a given product release. |
| **Build-once / promote-by-retag** | Shipping the exact tested image digest to production by retagging, not rebuilding. |
| **Air-gap** | Running with no internet egress — images mirrored, TLS internal, identity in-cluster. |

## Next steps

- [Key concepts](/th/overview/concepts) — the model these terms describe.
- [Multi-tenancy model](/th/overview/multi-tenancy) — organizations, projects, groups, users.
