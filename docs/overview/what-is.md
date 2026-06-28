# What is Opsta AI Gateway

**Opsta AI Gateway is an enterprise control point for all of your organization's AI traffic.** Every large
language model (LLM) request and every AI-agent (MCP) tool call passes through one governed gateway that runs
**entirely in your own environment** — so you control the cost, the access, and the risk, and your data never
leaves your infrastructure.

## Why a gateway

As teams adopt AI, two problems appear at once:

- **AI becomes a budget line.** Every team calls LLMs directly, with no caps and no attribution. The monthly
  bill is a surprise, and no one owns it.
- **AI becomes a risk surface.** There's no control over who uses which model, no masking of sensitive data, no
  guardrails against prompt injection, and no audit trail of what was sent — often through a third-party cloud
  you don't control.

Opsta AI Gateway puts a single, governed control point in front of all of it.

## What it gives you

- **Control the cost** — hierarchical USD budgets (organization → project → group → user), per-minute token
  limits, semantic caching that cuts spend, and **FinOps chargeback + forecast** (exportable per-tenant
  cost statements priced from the same rates you enforce, plus month-end budget projection). See
  [Budgets & limits](/admin/budgets-and-limits) and [FinOps](/admin/finops).
- **Govern access & safety** — API-key authentication, role-based access control, PII masking,
  prompt-injection [guardrails](/admin/guardrails) with **review & approval** (versioned, 4-eyes,
  revertible), an emergency [AI kill-switch](/admin/kill-switch) that halts all traffic for a
  project/org/platform in one click, and a full [audit log](/admin/audit-log).
- **Govern the prompt** — enforce a project-wide system prompt that clients can't strip
  ([prompt management](/admin/prompt-management)), and publish reusable, versioned
  [prompt templates](/admin/prompt-templates) apps invoke by name.
- **Audit what was asked** — optionally capture the prompt and model output per project for debugging
  and abuse investigation, with opt-in-per-project, bounded retention, and admin-only access
  ([prompt logging](/admin/prompt-logging)).
- **Connect any provider** — OpenAI-compatible endpoints *and* native [providers](/admin/providers)
  (AWS Bedrock, Google Vertex, Anthropic Claude, Google Gemini) via automatic protocol translation, with
  per-provider key **failover** — your apps keep speaking one OpenAI-style API.
- **Roll out models safely** — split a model's traffic across two providers by weight to
  A/B test or canary a new model, ramping with no client changes ([rollouts](/admin/canary-rollouts)).
- **Route automatically** — let clients send the model `auto` and have the gateway pick the right model
  from the prompt, so casual traffic avoids premium rates ([automated routing](/admin/auto-routing)).
- **Cut model spend** — route easy prompts to a cheap model and only the hard ones to a strong model, at a
  quality you set, with the savings measured before you enable it ([cost routing](/admin/cost-routing)).
- **Govern AI agents** — give each autonomous agent a **trusted, first-class identity**
  ([AI Agents](/admin/agents)): a verifiable, revocable credential carried through every LLM and tool
  call, so spend, access, and audit attribute to the *agent*. Register and govern remote
  [MCP servers](/admin/mcp-servers), or turn an existing REST API into a governed MCP server from its
  OpenAPI spec, so your agents' tool traffic is authenticated, isolated per project, and observed — the
  same controls as your LLM traffic. One **[Agent & Tool catalog](/admin/catalog)** shows every agent
  and tool across the org with its owner and risk tier, and you can **restrict which tools each agent may
  call** (a per-agent tool allow-list, enforced at the gateway).
- **Keep it yours** — self-hosted and air-gap installable. The data plane runs in your cluster; sensitive
  prompts and data never leave your environment. See [Data sovereignty](/security/data-sovereignty).
- **Back up & recover** — self-hosted [backup & disaster recovery](/operate/backup-and-dr): point-in-time
  PostgreSQL recovery plus Kubernetes-resource backups to an in-cluster object store, with a single-sign-on
  web console (gated to admin groups) to run and restore them — no external cloud dependency.
- **Built for many teams** — true [multi-tenancy](/overview/multi-tenancy): one platform serves many
  organizations, projects, groups, and users, each with isolated config, budgets, and dashboards.

## Who it's for

- **Developers** consume the gateway like any OpenAI-compatible endpoint — see the [User Guide](/user/get-access).
- **Organization & platform administrators** configure providers, budgets, guardrails, MCP, and SSO from the web
  console — see the [Administrator Guide](/admin/console-tour).
- **Platform engineers** install, secure, scale, and operate it on Kubernetes — see [Deploy &
  Operate](/operate/requirements).

It fits internal AI platforms, multi–business-unit enterprises, and organizations with strict data-sovereignty
or regulatory requirements.

## Self-managed or fully managed

Run Opsta AI Gateway yourself, or have Opsta deploy, run, and support it for you as a managed service with
24×7 monitoring and a banking-grade SLA.

## Next steps

- [Key concepts & glossary](/overview/concepts) — the vocabulary used throughout these docs.
- [Architecture](/overview/architecture) — how the pieces fit together.
- [Request lifecycle](/overview/request-lifecycle) — what happens to a request as it passes through.
- [Reference architecture](/operate/reference-architecture) — deployment topologies, component diagrams, sizing, security, and compliance for your architecture-review board.
