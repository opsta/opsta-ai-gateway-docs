# Agent & Tool catalog

The **Agent & Tool catalog** is a single governance overview of everything that can act in your
organization: every **AI agent** and every governed **tool** (MCP server), across all projects, with
its **owner** and **risk tier**. As agents and tools proliferate, this is the one place to answer
*"what exists, who owns it, and how risky is it?"*

::: info Who can do this
**Org admins** (their own organization) and **platform admins**, under **Agent & Tool catalog** in the
admin sidebar.
:::

![The Agent & Tool catalog — agents and tools with owner and risk tier](/images/catalog.png)

## What it shows

- **Agents** — every registered [AI agent](/admin/agents): name, project, group, who it *acts for*,
  owner, and risk tier.
- **Tools** — every registered [MCP server](/admin/mcp-servers): name, project, owner, risk tier,
  enabled state, and description.
- A **risk filter** (high / medium / low) to focus on what matters, with high-risk entries surfaced
  first.

## Tool risk & ownership

Tools (MCP servers) now carry the same governance metadata as agents — **owner**, **risk tier**, and a
**description** — set on the project's [MCP servers](/admin/mcp-servers) tab when you register or edit a
server. This is what lets the catalog give every tool an accountable owner and a risk rating, the same
way agents already have.

::: tip Visibility first, enforcement next
The catalog is a read-only governance overview — it tells you what exists and who owns it. Access
*enforcement* (which agents may call which tools) builds on this registry and is tracked as a separate
capability.
:::

## Next steps

- [AI Agents](/admin/agents) — register and govern the agents listed here.
- [MCP servers](/admin/mcp-servers) — register tools and set their owner/risk.
- [AI kill-switch](/admin/kill-switch) — halt a project/org in one click.
