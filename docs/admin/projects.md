# Projects

A **project** is the unit that owns a routing configuration, providers, guardrails, budgets, and API keys. An
organization has many projects — for example, one per product, team, or environment.

::: info Who can do this
**Org admins** (for their organization) and **platform admins**.
:::

## Create and manage a project

On **Projects**, use the project dropdown to switch projects or **create** a new one. Each project is edited
through a **tabbed configuration editor**:

| Tab | What you configure | Guide |
|---|---|---|
| **Users** | Per-project consumers (team access) and their keys | below |
| **LLM Providers** | Provider credentials and connections | [Providers](/admin/providers) |
| **Routing** | Logical model → provider → upstream model | [Routing](/admin/routing) |
| **Guardrails** | PII + prompt-injection rules | [Guardrails](/admin/guardrails) |
| **Semantic Cache** | Vector-similarity caching | [Semantic cache](/admin/semantic-cache) |
| **Semantic Guard** | Embedding-based injection blocking | [Semantic guard](/admin/semantic-guard) |
| **MCP Servers** | Governed remote MCP servers | [MCP servers](/admin/mcp-servers) |
| **Budgets & Limits** | Per-consumer / per-group caps | [Budgets & limits](/admin/budgets-and-limits) |
| **Review** | Read-only view of the effective merged config | below |
| **Settings** | Rename, describe, or delete the project | below |

![The project editor and its tab bar](/images/project-tabs.png)

## Review the effective configuration

The **Review** tab shows the **effective** configuration the gateway actually enforces — merged routes,
guardrails, and limits — so you can confirm what's live before clients depend on it.

## Settings

The **Settings** tab renames or describes a project, or deletes it.

::: warning Deleting a project
Deleting a project removes its configuration and keys. Existing client keys for that project stop working.
:::

## Next steps

Start with [Providers](/admin/providers), then [Routing](/admin/routing).
