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
| **M2.5** API keys + USD budgets | ✅ done | key-auth consumers, per-consumer dollar caps via a budget controller |
| **M3** Model allow-list | ✅ done | per-group allowed-model enforcement (403) |
| **M4** Observability | ✅ done | Grafana LGTM + Alloy dashboards |
| **M5** Guardrails | ✅ done | PII masking + prompt-injection blocking (no cloud dependency) |
| **M6** SSO | ✅ done | Google Workspace OIDC, domain-restricted, feeding identity |

**Phase 0 (single-tenant engine) is complete.** Next is Phase 1 — the
multi-tenant control plane.

> **USD budget enforcement** (dollar caps per group/user) lands after SSO (M9,
> hierarchical budgets), once authenticated-consumer identity exists.

## Multi-tenant product — delivered

A control plane stores per-**Project** config in Postgres and reconciles it into
Higress; **Higress stays the data plane**. The following are built and live:

- **Control plane** ✅ — tenancy model + reconcile loop, project-scoped routing API.
- **Per-tenant governance** ✅ — hierarchical budgets/limits, per-user API keys,
  multi-tenant usage attribution, project-scoped guardrails.
- **Enterprise access** ✅ — per-org IdP brokering (each org connects its own
  Google/Entra/SAML in the console; users land in the right org/group/role on
  login) + an audit log of admin actions + a web console.
- **Real provider egress** ✅ — connect any AI provider to a project in the
  console; the reconcile wires the egress route, rewrites the logical alias to the
  real model, and injects the project's key — proven end-to-end against DeepSeek.
  See the [guides](/guides/connect-a-provider).

### Next

- **Enterprise-grade** — SCIM auto-provisioning, FinOps + audit deep-dive,
  semantic cache, canary/A-B model rollout, per-org BYOK provider vault, approval
  workflows, and more.

Everything is designed so today's single-tenant setup is a lift-and-shift into
the multi-tenant product — identity is always the `{org, project, group, user}`
tuple, config is rendered from a Project spec, and every policy is per-project
overridable.
