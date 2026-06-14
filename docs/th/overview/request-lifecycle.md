> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Request lifecycle

Every request passes through an ordered chain of policy gates in the data plane before it reaches a provider.
Each gate can let the request continue or reject it — and the gates run in a fixed order so that, for example,
a request is authenticated before any budget is charged, and a cache hit avoids upstream spend entirely.

```mermaid
flowchart TB
  C([Client request]) --> KA{Key-auth}
  KA -->|invalid key| R401[401 Unauthorized]
  KA -->|ok, identity set| GR{Guardrails}
  GR -->|PII / injection match| R403[403 Blocked]
  GR -->|ok| RT[Routing · resolve model]
  RT --> BL{Budget & limits}
  BL -->|over budget / TPM| R429[429 Too Many Requests]
  BL -->|ok| CA{Semantic cache}
  CA -->|hit| HIT([Cached response · no upstream spend])
  CA -->|miss| UP[Provider / MCP server]
  UP --> RESP([Response · usage recorded])
```

## The gates in order

1. **Key-auth** — validates the API key and resolves the caller's identity (the `organization.project.user`
   consumer). Everything downstream keys on this.
2. **Guardrails** — screens the request: PII masking, pattern-based prompt-injection, and semantic
   prompt-injection. A match short-circuits with a 403 before any model is called.
3. **Routing** — resolves the client's logical model (e.g. `coding-default`) to the configured provider and
   upstream model. For agent traffic, the equivalent step routes to the registered MCP server.
4. **Budget & limits** — checks the consumer's monthly USD budget (hierarchical) and per-minute token limit.
   Over either cap, the request is rejected before reaching the provider.
5. **Semantic cache** — if enabled, a similar prior prompt returns a stored answer, skipping the provider and
   saving the full token spend.
6. **Provider / MCP server** — the request reaches your upstream. The response flows back and usage is recorded
   for budgets, dashboards, and the audit trail.

## Which gate rejected my request?

The status code tells you which gate stopped a request:

| Status | Gate | Meaning | What to do |
|---|---|---|---|
| **401 Unauthorized** | Key-auth | Missing or invalid API key | Check the key and the `Authorization: Bearer …` header — see [Manage API keys](/th/user/api-keys) |
| **403 Blocked** | Guardrails | Request matched a PII or prompt-injection rule | Review [Blocked requests](/th/user/blocked-requests); report a false positive if needed |
| **429 Too Many Requests** | Budget & limits | Over the monthly budget or per-minute token limit | See [Usage & budget](/th/user/usage-and-budget); an admin can adjust [budgets & limits](/th/admin/budgets-and-limits) |
| **5xx** | Provider | The upstream provider or MCP server failed | Check the provider status in the [Providers](/th/admin/providers) screen |

For how identities and tenancy shape these checks, see [Multi-tenancy](/th/overview/multi-tenancy).
