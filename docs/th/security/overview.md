> 🌐 **เอกสารภาษาไทยกำลังจัดทำ** — เนื้อหาด้านล่างเป็นภาษาอังกฤษชั่วคราว จนกว่าจะมีการแปล. _This page is not yet translated; English content is shown temporarily._

# Security overview

Opsta AI Gateway is built to be the **trusted control point** for enterprise AI traffic. Security is structural,
not bolted on: the platform runs entirely on infrastructure you own, every request passes an ordered chain of
policy gates, every administrative change is audited, and tenants are isolated by construction.

::: info Who this is for
Security, risk, and compliance stakeholders evaluating the platform, and the engineers who operate it.
:::

## The pillars

| Pillar | What it means | Read more |
|---|---|---|
| **Data sovereignty** | Self-hosted; request content, telemetry, identity, and config never leave your cluster. Runs air-gapped. | [Data sovereignty](/th/security/data-sovereignty) |
| **Tenant isolation** | Organizations, projects, and users are isolated across keys, budgets, routing, telemetry, and MCP access. | [Multi-tenancy model](/th/overview/multi-tenancy) |
| **Least-privilege access** | Three roles — platform admin, org admin, member — scope every action; org admins see only their org. | [RBAC model](/th/security/rbac) |
| **Policy enforcement** | Each request runs key-auth, guardrails, routing, budgets/limits, and cache before reaching a provider. | [Request lifecycle](/th/overview/request-lifecycle) |
| **Auditability** | Every mutating action — including denied attempts — is recorded with actor, target, outcome, and status. | [Audit & compliance](/th/security/audit-and-compliance) |
| **Hardened by default** | Verified identity, internal-service auth, network isolation, secret hygiene, supply-chain scanning. | [Hardening](/th/security/hardening) |

## Defense in depth

Security is layered so that no single control is a single point of failure:

- **At the edge** — TLS terminates in your cluster with a certificate you control.
- **At the gateway** — every request is authenticated and runs the policy gate chain; a failing gate stops the
  request with a clear status code.
- **At the control plane** — the configuration API verifies caller identity (signed tokens), enforces RBAC,
  rate-limits and size-caps requests, and validates input.
- **Between services** — internal calls require a shared secret, and network policy restricts who can reach the
  control plane and the telemetry backends.
- **At rest** — the source of truth is your PostgreSQL; secrets live in Kubernetes Secrets or your external
  secret store.

## Trust boundary

Everything inside the trust boundary — the gateway, control plane, database, identity, telemetry, and console —
runs in **your** Kubernetes cluster. The only things that cross it are requests to the **LLM and MCP providers
you explicitly configure**. There is no Opsta-operated cloud in the data path.

## Next steps

- [Data sovereignty](/th/security/data-sovereignty) — exactly what stays in your environment.
- [RBAC model](/th/security/rbac) · [Audit & compliance](/th/security/audit-and-compliance) ·
  [Hardening](/th/security/hardening)
