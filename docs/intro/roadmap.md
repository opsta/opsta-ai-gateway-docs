# Roadmap

The gateway is built milestone by milestone; each is fully green
(`task reset && task test`) before the next starts.

## Phase 0 — single-tenant engine

| Milestone | Status | What it delivers |
|---|---|---|
| **M0** Cluster + Higress | ✅ done | reproducible local gateway from code |
| **M0.5** Remote access + in-cluster TLS | ✅ done | Let's Encrypt TLS in-cluster, Cloudflare Tunnel dev ingress |
| **M1** Work-type → model routing | ✅ done | header/tag routing to logical model routes + fallback |
| **M2** Per-group/user token limits | ✅ done | built-in token rate limits, Redis-backed, identity-keyed |
| **M3** Model allow-list | ✅ done | per-group allowed-model enforcement (403) |
| **M4** Observability | ✅ done | Grafana LGTM + Alloy dashboards |
| **M5** Guardrails | ⏳ next | PII masking + content/prompt-injection (no cloud dependency) |
| **M6** SSO | ⏳ planned | Google Workspace OIDC, domain-restricted, feeding identity |

> **USD budget enforcement** (dollar caps per group/user) lands after SSO (M9,
> hierarchical budgets), once authenticated-consumer identity exists.

## Beyond — multi-tenant product

A control plane stores a per-**Project** spec and reconciles it into Higress
config; **Higress stays the data plane**. On top: enterprise SSO + RBAC,
per-tenant budgets / guardrails / API keys, usage dashboards, and FinOps.

- **Control plane** — tenancy model + reconcile loop, project-scoped routing API.
- **Per-tenant governance** — hierarchical budgets/limits, API keys, multi-tenant
  usage attribution, project-scoped guardrails.
- **Enterprise access** — multi-org SSO + SCIM + RBAC, web UI.
- **Enterprise-grade** — FinOps + audit, semantic cache, canary/A-B model
  rollout, per-org BYOK provider vault, approval workflows, and more.

Everything is designed so today's single-tenant setup is a lift-and-shift into
the multi-tenant product — identity is always the `{org, project, group, user}`
tuple, config is rendered from a Project spec, and every policy is per-project
overridable.
